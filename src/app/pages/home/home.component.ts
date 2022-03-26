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
        private changeDetectorRef: ChangeDetectorRef
    ) {
        this.logHelper = new LogHelper(HomeComponent.name);
        this.isSubscribed = false;
        this.connectionInfo = new ConnectionInfo();
    }

    public async ngOnInit(): Promise<void> {
        try {
            this.batteryInfoSubscription = this.bleDataService.batteryInfoSubject.subscribe((batteryInfo: BatteryInfo | undefined) => {
                this.batteryInfo = batteryInfo;
                this.logHelper.logDefault('batteryInfoSubject', 'batteryInfo', { value: batteryInfo });
                this.changeDetectorRef.detectChanges();
            });
            this.connectionInfoSubscription = this.bleConnectionService.connectionInfoSubject.subscribe({
                next: async (info: ConnectionInfo) => {
                    this.connectionInfo = info;
                    this.logHelper.logDefault('connectionInfoSubject', 'connectionInfo', { value: info });
                },
                error: () => this.connectionInfo.status = BLEConnectionStatus.CONNECTION_ERROR
            });
            this.isSubscribedSubscription = this.bleDataService.isSubscribedSubject.subscribe(async (isSubscribed: boolean) => {
                this.logHelper.logDefault('isSubscribedSubject', 'Is subscribe to device characteristics', { value: isSubscribed });
                if (!this.isSubscribed.valueOf() && isSubscribed.valueOf() && this.connectionInfo.isReady() && this.connectionInfo.device !== undefined) {
                    this.logHelper.logDefault('isSubscribedSubject', 'Reading device\'s data...');
                    this.bleDataService.readAllData(this.connectionInfo.device.macAddress);
                }
                this.isSubscribed = isSubscribed;
            });
            this.authUserSubscription = this.authService.authUserSubject.subscribe((authUser: AuthUser | undefined) => this.authUser = authUser);
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
                        const connectionSub = this.bleConnectionService.connectionInfoSubject.subscribe({
                            next: async (connInfo: ConnectionInfo) => {
                                if (connInfo.isReady()) {
                                    if (this.user !== undefined && connInfo.device !== undefined) {
                                        try {
                                            await this.bleDataService.initBLESubscriptions(connInfo.device.macAddress);
                                            this.logHelper.logDefault('connectionSub', 'initBLESubscriptions finished');
                                            const devices = this.user?.devices;
                                            devices?.push(device);
                                            // update device.lastUsedDate in user devices
                                            this.userService.updateField({ id: this.user.id }, 'devices', devices, false)
                                                .then(() => this.logHelper.logDefault('update User', 'devices field has been updated'))
                                                .catch( (e: unknown) => this.logHelper.logError('update User error', e));
                                            await this.messageService.dismissLoading();
                                            connectionSub.unsubscribe();
                                        } catch (e: unknown) {
                                            await this.messageService.displayErrorMessage(new LogInfo(HomeComponent.name, this.ngOnInit.name, e), 'toast', true);
                                        }
                                    }
                                }
                            },
                            error: async (e: unknown) => {
                                await this.messageService.displayErrorMessage(new LogInfo(HomeComponent.name, 'connectionInfoSubject', e), 'toast', true);
                            }
                        });
                    } else {
                        if (!this.isSubscribed.valueOf()) {
                            await this.bleDataService.initBLESubscriptions(device.macAddress);
                        }
                    }
                } else {
                    await this.router.navigateByUrl('/device-setup', { replaceUrl: true });
                }
            } else {
                await this.router.navigateByUrl('/login', { replaceUrl: true });
            }
        } catch (error: unknown) {
            await this.messageService.displayErrorMessage(new LogInfo(HomeComponent.name, this.ngOnInit.name, error), 'toast', true);
        }
    }

    public ngOnDestroy(): void {
        this.connectionInfoSubscription?.unsubscribe();
        this.batteryInfoSubscription?.unsubscribe();
        this.isSubscribedSubscription?.unsubscribe();
        this.authUserSubscription?.unsubscribe();
    }
}
