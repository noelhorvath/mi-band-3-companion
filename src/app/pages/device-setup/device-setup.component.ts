import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { BleConnectionService } from '../../services/ble/connection/ble-connection.service';
import { PermissionService } from '../../services/permission/permission.service';
import { Router } from '@angular/router';
import { FirebaseAuthService } from '../../services/firebase/auth/firebase-auth.service';
import { MessageService } from '../../services/message/message.service';
import { FirestoreUserService } from '../../services/firestore/user/firestore-user.service';
import { Device } from '../../shared/models/classes/Device';
import { ScanInfo } from '../../shared/models/classes/ScanInfo';
import { ConnectionInfo } from '../../shared/models/classes/ConnectionInfo';
import { ScanResult } from '../../shared/models/classes/ScanResult';
import { LogInfo } from '../../shared/models/classes/LogInfo';
import { LogHelper } from '../../shared/models/classes/LogHelper';
import { BLEConnectionStatus } from '../../shared/enums/ble.enum';

@Component({
    selector: 'app-setup',
    templateUrl: './device-setup.component.html',
    styleUrls: ['./device-setup.component.scss'],
})
export class DeviceSetupComponent implements OnDestroy, OnInit {
    private readonly logHelper: LogHelper;
    private connectionInfoSubscription: Subscription | undefined;
    private scanInfoSubscription: Subscription | undefined;
    private scanIntervalId: NodeJS.Timer | undefined;
    public readonly SCAN_WAIT_TIME: number = 10;
    public connectionInfo: ConnectionInfo;
    public counter: number | undefined;
    public scanInfo: ScanInfo;
    public scanResults: ScanResult[] | undefined;

    public constructor(
        private bleConnectionService: BleConnectionService,
        private permissionService: PermissionService,
        private userService: FirestoreUserService,
        private router: Router,
        private authService: FirebaseAuthService,
        private messageService: MessageService
    ) {
        this.logHelper = new LogHelper(DeviceSetupComponent.name);
        this.scanInfo = new ScanInfo();
        this.connectionInfo = new ConnectionInfo();
    }

    public ngOnInit(): void {
        this.scanInfoSubscription = this.bleConnectionService.scanInfoSubject.subscribe({
            next: async (scanInfo: ScanInfo) => {
                this.scanInfo = scanInfo;
                this.logHelper.logDefault('ngOnInit', 'scan info', { value: scanInfo });
                if (scanInfo.results !== undefined) {
                    const authUser = this.authService.getAuthUser();
                    if (authUser !== undefined) {
                        const user = await this.userService.get(authUser.uid);
                        this.scanResults = scanInfo.results.filter( (scanResult: ScanResult) =>
                            user?.devices !== undefined && user.devices.length > 0
                                ? user.devices.findIndex( device => device.macAddress === scanResult.address) === -1 : true);
                        await this.messageService.dismissLoading();
                        if (scanInfo.isDisabled.valueOf() && this.scanIntervalId === undefined) {
                            // 10s timeout before next scan
                            this.runScanCountdown();
                        }
                    }
                }
            },
            error: async (e: unknown) => {
                await this.displayErrorToast(e, 'scanInfoSubject');
            }
        });
    }

    public async startScanningForDevices(): Promise<void> {
        try {
            await this.messageService.createLoading('PREPARING_SCANNING_WITH_DOTS');
            this.messageService.changeLoadingMessage('CHECKING_PERMISSIONS_WITH_DOTS');
            await this.permissionService.checkForBluetoothScanPermissions();
            this.messageService.changeLoadingMessage('ENABLING_BL_WITH_DOTS');
            const isEnabled = await this.bleConnectionService.enableBL();
            if (!isEnabled) {
                return await this.messageService.displayErrorMessage(new LogInfo(DeviceSetupComponent.name, this.startScanningForDevices.name, 'BL_NOT_ENABLED'), 'alert', true);
            }
            this.messageService.changeLoadingMessage('SCANNING_FOR_DEVICES_WITH_DOTS');
            return this.bleConnectionService.scanForDevices(3000);
        } catch (e) {
            return await this.messageService.displayErrorMessage(new LogInfo(DeviceSetupComponent.name, this.startScanningForDevices.name, e), 'alert', true);
        }
    }

    private runScanCountdown(): void {
        this.scanIntervalId = setInterval(() => {
            if (this.counter === undefined) {
                // start countdown
                this.counter = this.SCAN_WAIT_TIME;
            } else {
                if (1 < this.counter) {
                    this.counter--;
                } else {
                    // end countdown
                    this.counter = undefined;
                    this.scanInfo.isDisabled = false;
                    this.bleConnectionService.scanInfoSubject.next(this.scanInfo);
                    if (this.scanIntervalId !== undefined) {
                        clearInterval(this.scanIntervalId);
                        this.scanIntervalId = undefined;
                    }
                }
            }
        }, 1000);
    }

    public connectToSelectedDevice(scannedDevice: ScanResult): Promise<void> {
        this.connectionInfoSubscription = this.bleConnectionService.connectionInfoSubject.subscribe({
            next: async (connectionInfo: ConnectionInfo) => {
                this.connectionInfo = connectionInfo;
                this.logHelper.logDefault('connectionInfoSubject', 'connectionInfo', { value: connectionInfo });
                if (connectionInfo.isConnectingOrAuthenticating()) {
                    await this.messageService.createLoading('CONNECTING_TO_DEVICE_WITH_DOTS');
                } else if (connectionInfo.isReady()) {
                    try {
                        this.messageService.changeLoadingMessage('SAVING_NEW_DEVICE_WITH_DOTS');
                        const authUser = this.authService.getAuthUser();
                        if (authUser !== undefined) {
                            const user = await this.userService.get(authUser.uid);
                            if (user !== undefined && connectionInfo.device !== undefined) {
                                if (user.devices === undefined) {
                                    user.devices = [];
                                }
                                user.devices.push(connectionInfo.device);
                                this.userService.update({ id: user.id }, { devices: user.devices })
                                    .then(() => this.logHelper.logDefault('update User', 'devices field has been updated'))
                                    .catch((e: unknown) => this.logHelper.logError('update User error', e));
                                this.messageService.changeLoadingMessage('INITIALIZING_DEVICE_WITH_DOTS');
                                this.logHelper.logDefault('connectionInfoSubject', 'Adding new device', { value: connectionInfo.device });
                                await this.router.navigateByUrl('/home', { replaceUrl: true });
                            } else {
                                await this.messageService.dismissLoading();
                                await this.router.navigateByUrl('/login', { replaceUrl: true });
                            }
                        } else {
                            this.logHelper.logError('connectionInfoSubject', 'User is not logged in!');
                            await this.messageService.dismissLoading();
                            await this.router.navigateByUrl('/login', { replaceUrl: true });
                        }
                    } catch (error: unknown) {
                        await this.messageService.displayErrorMessage(new LogInfo(DeviceSetupComponent.name, 'connectionInfoSubject', error), 'toast', true, 5000);
                    }
                } else if (connectionInfo.isDisconnected()) {
                    await this.messageService.dismissLoading();
                }
            },
            error: async (e: unknown) => {
                this.connectionInfo.status = BLEConnectionStatus.CONNECTION_ERROR;
                await this.displayErrorToast(e, 'connectionInfoSubject');
            }
        });
        return this.bleConnectionService.connect(new Device(scannedDevice.name, scannedDevice.address), false);
    }

    private async displayErrorToast(error: unknown, id: string): Promise<void> {
        if ((this.messageService.toast && this.messageService.toast.header !== 'ERROR') || this.messageService.toast) {
            await this.messageService.displayErrorMessage(new LogInfo(DeviceSetupComponent.name, id, error), 'toast', true, 5000, 'bottom');
        }
    }

    public ngOnDestroy(): void {
        this.scanInfoSubscription?.unsubscribe();
        this.connectionInfoSubscription?.unsubscribe();
    }

    public async signOutUser(): Promise<void> {
        try {
            await this.authService.signOut();
            await this.router.navigateByUrl('/login', { replaceUrl: true });
        } catch (e: unknown) {
            this.logHelper.logError(this.signOutUser.name, e);
        }
    }
}
