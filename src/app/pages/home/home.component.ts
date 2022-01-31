import {Component, OnDestroy, OnInit} from '@angular/core';
import {UserService} from "../../services/firebase/firestore/user/user.service";
import {AuthService} from "../../services/firebase/auth/auth.service";
import {first} from "rxjs/operators";
import {Router} from "@angular/router";
import {BleConnectionService} from "../../services/ble/connection/ble-connection.service";
import {MessageService} from "../../services/message/message.service";
import {Device} from "../../shared/models/classes/Device";
import {User} from "../../shared/models/classes/User";
import {BleDataService} from "../../services/ble/data/ble-data.service";
import {BatteryInfo} from "../../shared/models/classes/BatteryInfo";
import {Subscription} from "rxjs";

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
    public user: User;
    public connectedDevice: Device;
    public connectionStatus: string;
    public batteryInfo: BatteryInfo;
    private connectionStatusSubscription: Subscription;
    private connectedDeviceSubscription: Subscription;
    private batteryInfoSubscription: Subscription;

    constructor(
        private userService: UserService,
        private authService: AuthService,
        private router: Router,
        private bleConnectionService: BleConnectionService,
        private messageService: MessageService,
        private bleDataService: BleDataService
    ) {}

    ngOnInit() {
        console.log(HomeComponent.name + ' -> ngOnInit');
        this.batteryInfoSubscription = this.bleDataService.batteryInfoSubject.subscribe( batteryInfo => {
           this.batteryInfo = batteryInfo;
        });
        this.connectionStatusSubscription = this.bleConnectionService.connectionStatusSubject.subscribe( status => {
            this.connectionStatus = status;
        }, () => this.connectionStatus = 'connection_error' );
        this.connectedDeviceSubscription = this.bleConnectionService.connectedDeviceSubject.subscribe( async device => {
            this.connectedDevice = device;
        });
        this.userService.get(this.authService.authUser.uid).pipe(first()).subscribe( async user => {
            this.user = user;
            if (user) {
                try {
                    const device = this.user.getCurrentlyUsedDevice();
                    const wasConnected = await this.bleConnectionService.wasConnected(device.macAddress);
                    const isConnected = wasConnected ? await this.bleConnectionService.isConnected(device.macAddress) : null;
                    console.log('isConnected: ' + isConnected);
                    if (!isConnected) {
                        await this.messageService.createLoading('CONNECTING_TO_DEVICE');
                        await this.bleConnectionService.connect(device.macAddress);
                        const connectionSub = this.bleConnectionService.connectionStatusSubject.subscribe( async status => {
                            if (status === 'connected') {
                                await this.bleDataService.initBLESubscriptions(device.macAddress);
                                this.bleDataService.readAllData(device.macAddress);
                                try {
                                    const device = this.user.getCurrentlyUsedDevice();
                                    const devices = this.user.devices.map( d => {
                                        if (d.macAddress === device.macAddress) {
                                            const temp = new Device();
                                            temp.copy(d);
                                            temp.lastUsedDate = new Date().toISOString();
                                            return temp;
                                        }
                                        return d;
                                    });
                                    await this.userService.updateField(this.user.id, 'devices', devices, true, false);
                                    await this.messageService.dismissLoading();
                                    connectionSub.unsubscribe();
                                } catch (e) {
                                    await this.messageService.errorHandler(HomeComponent.name, 'device update error', e, 'toast', true);
                                }
                            }
                        }, async error => {
                            this.bleConnectionService.connectionStatusSubject.next('disconnected');
                            await this.messageService.errorHandler(HomeComponent.name, 'connection status error', error, 'toast', true);
                        });
                    } else {
                        const sub = this.bleDataService.isSubscribedSubject.subscribe( async isSubscribed => {
                            console.log('device: ' + this.connectedDevice);
                            console.log('issubbed: ' + isSubscribed);
                            if (!isSubscribed && this.connectedDevice) {
                                console.log(HomeComponent.name + ' -> Subscribing to connected device BLE services');
                                await this.bleDataService.initBLESubscriptions(this.connectedDevice.macAddress);
                                this.bleDataService.readAllData(this.connectedDevice.macAddress);
                                if (sub) { sub.unsubscribe() }
                            }
                        });
                    }
                } catch (e) {
                    await this.messageService.errorHandler(HomeComponent.name, 'connect error', e, 'toast', true);
                }
            } else if (!user) {
                await this.router.navigateByUrl('/login', { replaceUrl: true });
            }
        }, async error => {
            await this.messageService.errorHandler(HomeComponent.name, 'user sub error', error, 'toast', true);
        });
    }

    ngOnDestroy() {
        console.log(HomeComponent.name + ' -> onDestroy');
    }
}
