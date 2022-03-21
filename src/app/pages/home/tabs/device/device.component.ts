import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { BleConnectionService } from '../../../../services/ble/connection/ble-connection.service';
import { firstValueFrom, Subscription } from 'rxjs';
import { FirebaseAuthService } from '../../../../services/firebase/auth/firebase-auth.service';
import { FirestoreUserService } from '../../../../services/firestore/user/firestore-user.service';
import { BleDataService } from '../../../../services/ble/data/ble-data.service';
import { User } from '../../../../shared/models/classes/User';
import { Activity } from '../../../../shared/models/classes/Activity';
import { HeartRate } from '../../../../shared/models/classes/HeartRate';
import { ConnectionInfo } from '../../../../shared/models/classes/ConnectionInfo';
import { LogHelper } from '../../../../shared/models/classes/LogHelper';
import { User as AuthUser } from '@angular/fire/auth';

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
    public connectionInfo: ConnectionInfo | undefined;
    public user: User | undefined;
    public activity: Activity | undefined;
    public heartRate: HeartRate | undefined;

    public constructor(
        private bleConnectionService: BleConnectionService,
        private authService: FirebaseAuthService,
        private userService: FirestoreUserService,
        public bleDataService: BleDataService,
        private changeDetectorRef: ChangeDetectorRef
    ) {
        this.logHelper = new LogHelper(DeviceComponent.name);
    }

    public ngOnInit(): void {
        this.connectionInfoSubscription = this.bleConnectionService.connectionInfoSubject.subscribe((info: ConnectionInfo) => {
            this.connectionInfo = info;
            this.changeDetectorRef.detectChanges();
            this.logHelper.logDefault('activitySubject', 'detectChanges has been called');
        });
        this.activitySubscription = this.bleDataService.activitySubject.subscribe((activity: Activity | undefined) => {
            this.activity = activity;
            this.logHelper.logDefault('activitySubject', 'activity', { value: activity });
            this.changeDetectorRef.detectChanges();
            this.logHelper.logDefault('activitySubject', 'detectChanges has been called');
        });
        this.heartRateSubscription = this.bleDataService.heartRateSubject.subscribe((heartRate: HeartRate | undefined) => {
            this.heartRate = heartRate;
            this.logHelper.logDefault('heartRateSubject', 'hearRate', { value: heartRate });
            this.changeDetectorRef.detectChanges();
            this.logHelper.logDefault('activitySubject', 'detectChanges has been called');
        });
        this.userSubscription = this.authService.authUserSubject.subscribe(async (authUser: AuthUser | undefined) => {
            if (authUser !== undefined) {
                try {
                    this.user = await firstValueFrom(this.userService.get(authUser.uid));
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
    }


}
