import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { BleConnectionService } from '../../../../services/ble/connection/ble-connection.service';
import { Subscription } from 'rxjs';
import { FirebaseAuthService } from '../../../../services/firebase/auth/firebase-auth.service';
import { FirestoreUserService } from '../../../../services/firestore/user/firestore-user.service';
import { BleDataService } from '../../../../services/ble/data/ble-data.service';
import { User } from '../../../../shared/models/classes/User';
import { Activity } from '../../../../shared/models/classes/Activity';
import { ConnectionInfo } from '../../../../shared/models/classes/ConnectionInfo';
import { LogHelper } from '../../../../shared/models/classes/LogHelper';
import { User as AuthUser } from '@angular/fire/auth';
import { ActivityInfo } from '../../../../shared/models/classes/ActivityInfo';
import { FirestoreActivityInfoService } from '../../../../services/firestore/activity/info/activity-info.service';
import { FireTimestamp } from '../../../../shared/models/classes/FireTimestamp';
import { FirestoreBatteryInfoService } from '../../../../services/firestore/battery-info/firestore-battery-info.service';
import { BatteryInfo } from '../../../../shared/models/classes/BatteryInfo';
import { Device } from '../../../../shared/models/classes/Device';

@Component({
    selector: 'app-device',
    templateUrl: './device.component.html',
    styleUrls: ['./device.component.scss'],
})
export class DeviceComponent implements OnDestroy, OnInit {
    private readonly logHelper: LogHelper;
    private activitySubscription: Subscription | undefined;
    private connectionInfoSubscription: Subscription | undefined;
    private heartRateSubscription: Subscription | undefined;
    private isAuthInitialized: Subscription | undefined;
    private userSubscription: Subscription | undefined;
    private activityInfoSubscription: Subscription | undefined;
    private batteryInfoSubscription: Subscription | undefined;
    public device: Device | undefined;
    public connectionInfo: ConnectionInfo | undefined;
    public user: User | undefined;
    public activity: Activity | undefined;
    public bpm: number | undefined;
    public deviceSoftwareVersion: string;
    public deviceHardwareVersion: string;
    public lastSynced: FireTimestamp | undefined;
    public batteryInfo: BatteryInfo | undefined;

    public constructor(
        private bleConnectionService: BleConnectionService,
        private authService: FirebaseAuthService,
        private userService: FirestoreUserService,
        public bleDataService: BleDataService,
        private changeDetectorRef: ChangeDetectorRef,
        private activityInfoService: FirestoreActivityInfoService,
        private batteryInfoService: FirestoreBatteryInfoService
    ) {
        this.logHelper = new LogHelper(DeviceComponent.name);
        this.deviceSoftwareVersion = 'UNKNOWN';
        this.deviceHardwareVersion = 'UNKNOWN';
    }

    public ngOnInit(): void {
        this.connectionInfoSubscription = this.bleConnectionService.connectionInfoSubject.subscribe((info: ConnectionInfo) => {
            this.connectionInfo = info;
            if (this.connectionInfo.device !== undefined) {
                this.device = this.connectionInfo.device;
            }
            this.changeDetectorRef.detectChanges();
            this.logHelper.logDefault('activitySubject', 'detectChanges has been called');
            if (this.connectionInfo.isReady()) {
                this.bleDataService.getSoftwareVersion()
                    .then( (version: string) => this.deviceSoftwareVersion = version )
                    .catch( (e: unknown) => this.logHelper.logDefault(this.bleDataService.getHardwareVersion.name, e));
                this.bleDataService.getHardwareVersion()
                    .then( (version: string) => this.deviceHardwareVersion = version )
                    .catch( (e: unknown) => this.logHelper.logDefault(this.bleDataService.getHardwareVersion.name, e));
                this.activityInfoSubscription = this.activityInfoService.getWithValueChanges(this.connectionInfo.device?.macAddress ?? 'unknown')
                    .subscribe( (activityInfo: ActivityInfo | undefined) => this.lastSynced = activityInfo?.lastSynced );
                this.batteryInfoSubscription = this.batteryInfoService.getWithValueChanges(this.connectionInfo.device?.macAddress ?? 'unknown')
                    .subscribe( (batteryInfo: BatteryInfo | undefined) => this.batteryInfo = batteryInfo );
            }
        });
        this.activitySubscription = this.bleDataService.activitySubject.subscribe((activity: Activity | undefined) => {
            this.activity = activity;
            this.logHelper.logDefault('activitySubject', 'activity', { value: activity });
            this.changeDetectorRef.detectChanges();
            this.logHelper.logDefault('activitySubject', 'detectChanges has been called');
        });
        this.heartRateSubscription = this.bleDataService.heartRateSubject.subscribe((bpm: number | undefined) => {
            this.bpm = bpm;
            if (bpm !== undefined) {
                this.logHelper.logDefault('heartRateSubject', 'hearRate', { value: bpm });
                this.changeDetectorRef.detectChanges();
                this.logHelper.logDefault('activitySubject', 'detectChanges has been called');
            }
        });
        this.userSubscription = this.authService.authUserSubject.subscribe(async (authUser: AuthUser | undefined) => {
            if (authUser !== undefined) {
                try {
                    this.user = await this.userService.get(authUser.uid);
                    this.logHelper.logDefault('authUserSubject', 'Logged in user', { value: this.user });
                    this.isAuthInitialized?.unsubscribe();
                } catch (e: unknown) {
                    this.logHelper.logError('getUser', e);
                }
            }
        });
    }

    public ngOnDestroy(): void {
        this.connectionInfoSubscription?.unsubscribe();
        this.userSubscription?.unsubscribe();
        this.activitySubscription?.unsubscribe();
        this.heartRateSubscription?.unsubscribe();
        this.isAuthInitialized?.unsubscribe();
        this.activityInfoSubscription?.unsubscribe();
        this.batteryInfoSubscription?.unsubscribe();
    }
}
