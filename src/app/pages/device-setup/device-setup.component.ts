import {Component, NgZone, OnInit} from '@angular/core';
import {Subscription} from "rxjs";
import {BleConnectionService} from "../../services/ble/connection/ble-connection.service";
import {PermissionService} from "../../services/permission/permission.service";
import {Router} from "@angular/router";
import {AuthService} from "../../services/firebase/auth/auth.service";
import {MessageService} from "../../services/message/message.service";
import {IScannedDevice} from "./models/IScannedDevice";
import {UserService} from "../../services/firebase/firestore/user/user.service";
import {Device} from "../../shared/models/classes/Device";

@Component({
    selector: 'app-setup',
    templateUrl: './device-setup.component.html',
    styleUrls: ['./device-setup.component.scss'],
})
export class DeviceSetupComponent implements OnInit {
    public deviceList: IScannedDevice[];
    public deviceListSubscription: Subscription;
    public isScanningDisabled: boolean;
    public isScanningDisabledSubscription: Subscription;
    public isScanning: boolean;
    public isScanningSubscription: Subscription;
    public counter: number;
    public connectedDevice: Device;
    public connectedDeviceSubscription: Subscription;
    public connectionStatus: string;
    public connectionStatusSubscription: Subscription;

    constructor(
        private bleConnectionService: BleConnectionService,
        private permissionService: PermissionService,
        private userService: UserService,
        private router: Router,
        private authService: AuthService,
        private messageService: MessageService,
        private zone: NgZone
    ) {
        this.deviceListSubscription = this.bleConnectionService.deviceListSubject.subscribe(async list => {
            if (list) {
                this.deviceList = list.map( scanResult => {
                    return {name: scanResult.name, address: scanResult.address, rssi: scanResult.rssi} as IScannedDevice;
                });
                await this.messageService.dismissLoading();
            }
        });

        this.isScanningSubscription = this.bleConnectionService.isScanningSubject.subscribe(async value => {
            this.isScanning = value;
        }, async error => {
            await this.displayErrorToast(error);
        });

        this.isScanningDisabledSubscription = this.bleConnectionService.isScanningDisabledSubject.subscribe(value => {
            this.isScanningDisabled = value;
            if (value.valueOf()) {
                // 10s timeout before next scan
                this.runScanCountDown();
            }
        }, async error => {
            await this.displayErrorToast(error);
        });

        this.connectionStatusSubscription = this.bleConnectionService.connectionStatusSubject.subscribe( async status => {
            this.connectionStatus = status;
            console.log("status: " + status);
            if (status === 'connecting') {
                await this.messageService.createLoading('CONNECTING_WITH_DOTS');
            } else if (status === 'connected') {
                try {
                    if (this.connectedDevice) {
                        //TODO: some message here
                        const user = await this.authService.authUser;
                        if (user) {
                            await this.userService.updateField(user.uid, 'devices', this.connectedDevice, false, true);
                            await this.router.navigateByUrl('/home', { replaceUrl: true });
                            console.log('device connected');
                        } else {
                            console.error(DeviceSetupComponent.name + ' device setup error -> User is not logged in!');
                            await this.router.navigateByUrl('/login', { replaceUrl: true });
                        }
                        await this.messageService.dismissLoading();
                    } else {
                        console.error(DeviceSetupComponent.name + ' -> missing device address after connecting');
                    }
                } catch (error) {
                    await this.messageService.errorHandler(DeviceSetupComponent.name, "Device setup error", error, 'toast', true, 5000);
                }
            } else if ('disconnected') {
                await this.messageService.dismissLoading();
            }
        }, async error => {
            this.connectionStatus = 'disconnected';
            await this.displayErrorToast(error);
        });

        this.connectedDeviceSubscription = this.bleConnectionService.connectedDeviceSubject.subscribe(async (device: Device) => {
            this.connectedDevice = device;
        }, async error => {
            await this.displayErrorToast(error);
        });
    }

    public async startScanningForDevices() {
        try {
            await this.messageService.createLoading("PREPARING_SCANNING");
            this.messageService.changeLoadingMessage("CHECKING_PERMISSIONS");
            await this.permissionService.checkForBluetoothScanPermissions();
            this.messageService.changeLoadingMessage("ENABLING_BL");
            const isEnabled = await this.bleConnectionService.enableBL();
            if (!isEnabled) { return await this.messageService.errorHandler(DeviceSetupComponent.name, 'BL is not enabled', 'BL_NOT_ENABLED', 'alert', true); }
            this.messageService.changeLoadingMessage("SCANNING_FOR_DEVICES");
            return this.bleConnectionService.scanForDevices(3000);
        } catch (e) {
            console.error(DeviceSetupComponent.name + " -> startScanningForDevices error: " + e.message);
            return await this.messageService.errorHandler(DeviceSetupComponent.name, e, e, 'alert', true);
        }
    }

    private runScanCountDown() {
        let intervalId = setInterval(() => {
            if (this.counter == null) {
                // start countdown
                this.counter = 10;
            } else {
                if (this.counter !== 0) {
                    this.counter -= 1;
                } else {
                    // end countdown
                    this.counter = undefined;
                    this.zone.run( () => {
                        this.bleConnectionService.isScanningDisabledSubject.next(false);
                    });
                    clearInterval(intervalId);
                }
            }
        }, 1000);
    }

    public connectToSelectedDevice(address: string): Promise<void> {
        return this.bleConnectionService.connect(address, false, true);
    }

    private async displayErrorToast(error: any) {
        if ((this.messageService.toast && this.messageService.toast.header !== "ERROR") || !this.messageService.toast) {
            await this.messageService.errorHandler(DeviceSetupComponent.name, "ERROR", error, 'toast', true, 5000, 'bottom');
        }
    }

    ngOnInit() {}

    ngOnDestroy() {
        if (this.isScanningDisabledSubscription) { this.isScanningDisabledSubscription.unsubscribe() }
        if (this.isScanningSubscription) { this.isScanningSubscription.unsubscribe() }
        if (this.deviceListSubscription) { this.deviceListSubscription.unsubscribe() }
        if (this.connectionStatusSubscription) { this.connectionStatusSubscription.unsubscribe() }
    }
}
