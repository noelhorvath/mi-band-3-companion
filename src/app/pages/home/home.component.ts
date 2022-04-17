import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FirestoreUserService } from '../../services/firestore/user/firestore-user.service';
import { FirebaseAuthService } from '../../services/firebase/auth/firebase-auth.service';
import { Router } from '@angular/router';
import { BleConnectionService } from '../../services/ble/connection/ble-connection.service';
import { MessageService } from '../../services/message/message.service';
import { User } from '../../shared/models/classes/User';
import { User as AuthUser } from '@angular/fire/auth';
import { BleDataService } from '../../services/ble/data/ble-data.service';
import { BatteryInfo } from '../../shared/models/classes/BatteryInfo';
import { Subscription } from 'rxjs';
import { ConnectionInfo } from '../../shared/models/classes/ConnectionInfo';
import { LogHelper } from '../../shared/models/classes/LogHelper';
import { LogInfo } from '../../shared/models/classes/LogInfo';
import { BLEConnectionStatus } from '../../shared/enums/ble.enum';
import { Device } from '../../shared/models/classes/Device';
import { BleDeviceSettingsService } from '../../services/ble/device-settings/ble-device-settings.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnDestroy, OnInit {
    private readonly logHelper: LogHelper;
    private connectionInfoSubscription: Subscription | undefined;
    private isSubscribedSubscription: Subscription | undefined;
    private batteryInfoSubscription: Subscription | undefined;
    private authUserSubscription: Subscription | undefined;
    private userSubscription: Subscription | undefined;
    public user: User | undefined;
    public authUser: AuthUser | undefined;
    public batteryInfo: BatteryInfo | undefined;
    public connectionInfo: ConnectionInfo;
    public isSubscribed: boolean;

    public constructor(
        private userService: FirestoreUserService,
        private authService: FirebaseAuthService,
        private router: Router,
        private messageService: MessageService,
        private bleConnectionService: BleConnectionService,
        private bleDataService: BleDataService,
        private bleDeviceSettingsService: BleDeviceSettingsService,
        private changeDetectorRef: ChangeDetectorRef
    ) {
        this.logHelper = new LogHelper(HomeComponent.name);
        this.isSubscribed = false;
        this.connectionInfo = new ConnectionInfo();
    }

    private async initDevice(): Promise<void> {
        try {
            this.user = await this.userService.get(this.authUser?.uid ?? 'undefined');
            this.logHelper.logDefault('userService get', 'current user', { value: this.user });
            if (this.user !== undefined) {
                const device = this.user.getCurrentlyUsedDevice();
                if (device !== undefined) {
                    const isConnected = await this.bleConnectionService.isConnected(device);
                    this.logHelper.logDefault('userObservable', `is {${ device.toString() }} connected`, { value: isConnected });
                    if (!isConnected.valueOf()) {
                        await this.messageService.createLoading('CONNECTING_TO_DEVICE_WITH_DOTS');
                        await this.bleConnectionService.connect(device);
                    }
                } else {
                    await this.router.navigateByUrl('/device-setup', { replaceUrl: true });
                }
            } else {
                await this.router.navigateByUrl('/login', { replaceUrl: true });
            }
        } catch (error: unknown) {
            await this.messageService.displayErrorMessage(new LogInfo(HomeComponent.name, this.initDevice.name, error), 'toast', true);
        }
    }

    public ngOnInit(): void {
        this.batteryInfoSubscription = this.bleDataService.batteryInfoSubject.subscribe((batteryInfo: BatteryInfo | undefined) => {
            this.batteryInfo = batteryInfo;
            this.logHelper.logDefault('batteryInfoSubject', 'batteryInfo', { value: batteryInfo });
            this.changeDetectorRef.detectChanges();
        });
        this.isSubscribedSubscription = this.bleDataService.isSubscribedSubject.subscribe(async (isSubscribed: boolean) => {
            this.logHelper.logDefault('isSubscribedSubject', 'Is app subscribed to device characteristics', { value: isSubscribed });
            this.isSubscribed = isSubscribed;
            if (this.isSubscribed.valueOf()) {
                await this.messageService.dismissLoading();
            }
        });
        this.authUserSubscription = this.authService.authUserSubject.subscribe((authUser: AuthUser | undefined) => {
            this.authUser = authUser;
            if (authUser !== undefined) {
                this.userSubscription = this.userService.getWithValueChanges(authUser.uid)
                    .subscribe( (user: User | undefined) => this.user = user);
            }
        });
        this.initDevice().then( () => {
            this.logHelper.logDefault(this.initDevice.name, 'Device has been initialized');
            this.connectionInfoSubscription = this.bleConnectionService.connectionInfoSubject.subscribe({
                next: async (connInfo: ConnectionInfo) => {
                    this.connectionInfo = connInfo;
                    console.log('connectionInfo: ' + connInfo.toString());
                    if (connInfo.device !== undefined) {
                        this.bleConnectionService.deviceSettingsSubject.next(connInfo.device);
                    }
                    this.logHelper.logDefault('connectionInfoSubject', 'connectionInfo', { value: connInfo });
                    if (connInfo.isReady()) {
                        if (this.user !== undefined && connInfo.device !== undefined) {
                            try {
                                const devices = this.user?.devices?.map((dev: Device) =>
                                    connInfo.device !== undefined && dev.macAddress === connInfo.device.macAddress ? connInfo.device : dev);
                                // update last connected date of device
                                this.userService.update({ id: this.user.id }, { devices })
                                    .then(() => this.logHelper.logDefault('update User', 'devices field has been updated'))
                                    .catch((e: unknown) => this.logHelper.logError('update User error', e));
                                this.messageService.changeLoadingMessage('INITIALIZING_DEVICE_WITH_DOTS');
                                console.log('a');
                                await this.bleDataService.initDeviceData();
                                console.log('b');
                                this.bleDeviceSettingsService.setCurrentTime(connInfo.device).catch( (e: unknown) => {
                                    this.logHelper.logError(this.bleDeviceSettingsService.setCurrentTime.name, e);
                                });
                                this.bleDeviceSettingsService.setUserInfo(connInfo.device, this.user).catch( (e: unknown) => {
                                    this.logHelper.logError(this.bleDeviceSettingsService.setCurrentTime.name, e);
                                });
                            } catch (e: unknown) {
                                await this.messageService.displayErrorMessage(new LogInfo(HomeComponent.name, this.ngOnInit.name, e), 'toast', true);
                            }
                        }
                    }
                },
                error: async (e: unknown) => {
                    this.connectionInfo.status = BLEConnectionStatus.CONNECTION_ERROR;
                    await this.messageService.displayErrorMessage(new LogInfo(HomeComponent.name, 'connectionInfoSubject', e), 'toast', true);
                }
            });
        });
    }

    public ngOnDestroy(): void {
        this.connectionInfoSubscription?.unsubscribe();
        this.batteryInfoSubscription?.unsubscribe();
        this.isSubscribedSubscription?.unsubscribe();
        this.authUserSubscription?.unsubscribe();
        this.userSubscription?.unsubscribe();
    }

    public async signOut(): Promise<void> {
        try {
            await this.authService.signOut();
            await this.router.navigateByUrl('/login', { replaceUrl: true });
            this.logHelper.logDefault(this.signOut.name, 'User logged out');
        } catch (e: unknown) {
            this.logHelper.logError(this.signOut.name, e);
        }
    }
}
