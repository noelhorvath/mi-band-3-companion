import { Injectable } from '@angular/core';
import { BluetoothLE, OperationResult } from '@ionic-native/bluetooth-le/ngx';
import { BleConnectionService } from '../connection/ble-connection.service';
import { BehaviorSubject, Observer, Subscription } from 'rxjs';
import { BatteryInfo } from '../../../shared/models/classes/BatteryInfo';
import { FirebaseAuthService } from '../../firebase/auth/firebase-auth.service';
import { Activity } from '../../../shared/models/classes/Activity';
import { HeartRate } from '../../../shared/models/classes/HeartRate';
import { ConnectionInfo } from '../../../shared/models/classes/ConnectionInfo';
import { LogHelper } from '../../../shared/models/classes/LogHelper';
import { MeasurementInfo } from '../../../shared/models/classes/MeasurementInfo';
import { BleBaseService } from '../base/ble-base.service';
import { FireTimestamp } from '../../../shared/models/classes/FireTimestamp';
import { ActivityInfo } from '../../../shared/models/classes/ActivityInfo';
import { Buffer } from 'buffer';
import { DateTypeEnum } from '../../../shared/enums/date.enum';
import { FirestoreHeartRateService } from '../../firestore/heart-rate/firestore-heart-rate.service';
import { ProgressStatusEnum } from '../../../shared/enums/progress-status.enum';
import { TaskProgressInfo } from '../../../shared/models/classes/TaskProgressInfo';
import { FirestoreBatteryInfoService } from '../../firestore/battery-info/firestore-battery-info.service';
import { FirestoreActivityService } from '../../firestore/activity/firestore-activity.service';
import { MeasurementValue } from '../../../shared/models/classes/MeasurementValue';
import { FirestoreActivityInfoService } from '../../firestore/activity/info/activity-info.service';

@Injectable({
    providedIn: 'root'
})
export class BleDataService extends BleBaseService {
    private readonly logHelper: LogHelper;
    private activityInfo: ActivityInfo | undefined;
    private connectionInfo: ConnectionInfo;
    private activitySyncedDate: Date | undefined;
    private totalPackageCount: number;
    private processedPackageCount: number;
    private pastActivityBuffer: Activity[];
    private pastHeartRateBuffer: HeartRate[];
    private processingPastActivityHour: number;
    private processingPastActivityDay: number;
    private processingIndex: { hourly: number; daily: number; total: number };
    private processingCount: { hourlyActivity: number; hourlyHeartRate: number; dailyActivity: number; dailyHeartRate: number };
    private activitySyncInterval: NodeJS.Timer | undefined;
    private activityInfoSubscription: Subscription | undefined;
    private isSyncInitialized: boolean;
    public activitySyncStatusSubject: BehaviorSubject<TaskProgressInfo>;
    public activitySubject: BehaviorSubject<Activity | undefined>;
    public batteryInfoSubject: BehaviorSubject<BatteryInfo | undefined>;
    public heartRateSubject: BehaviorSubject<number | undefined>;
    public isSubscribedSubject: BehaviorSubject<boolean>;

    public constructor(
        ble: BluetoothLE,
        private bleConnectionService: BleConnectionService,
        private authService: FirebaseAuthService,
        private activityInfoService: FirestoreActivityInfoService,
        private activityService: FirestoreActivityService,
        private heartRateService: FirestoreHeartRateService,
        private batteryInfoService: FirestoreBatteryInfoService
    ) {
        super(ble);
        this.logHelper = new LogHelper(BleDataService.name);
        this.connectionInfo = new ConnectionInfo();
        this.totalPackageCount = 0;
        this.processedPackageCount = 0;
        this.processingPastActivityHour = 0;
        this.processingPastActivityDay = 0;
        this.processingIndex = { daily: 0, hourly: 0, total: 0 };
        this.processingCount = { hourlyActivity: 0, hourlyHeartRate: 0, dailyActivity: 0, dailyHeartRate: 0 };
        this.pastActivityBuffer = [];
        this.pastHeartRateBuffer = [];
        this.isSyncInitialized = false;
        this.activitySyncStatusSubject = new BehaviorSubject<TaskProgressInfo>(new TaskProgressInfo());
        this.batteryInfoSubject = new BehaviorSubject<BatteryInfo | undefined>(undefined);
        this.activitySubject = new BehaviorSubject<Activity | undefined>(undefined);
        this.heartRateSubject = new BehaviorSubject<number | undefined>(undefined);
        this.isSubscribedSubject = new BehaviorSubject<boolean>(false);
        this.bleConnectionService.connectionInfoSubject.subscribe({
            next: async (info: ConnectionInfo) => {
                this.connectionInfo = info;
                if (info.isDisconnected()) {
                    this.resetService();
                } else if (info.isReady()) {
                    this.activityInfoSubscription = this.activityInfoService.getWithValueChanges(info.device?.macAddress ?? 'undefined')
                        .subscribe(async (activityInfo: ActivityInfo | undefined) => {
                            this.activityInfo = activityInfo;
                            if (activityInfo === undefined) {
                                const initialSyncDate = new Date(new Date().setUTCDate(new Date().getUTCDate() - 31));
                                initialSyncDate.setUTCDate(initialSyncDate.getUTCDate() - 31);
                                const initialActivityInfo = new ActivityInfo(
                                    info.device?.macAddress ?? 'undefined',
                                    FireTimestamp.fromDate(new Date(new Date().setUTCDate(new Date().getUTCDate() - 31)))
                                );
                                try {
                                    await this.activityInfoService.add(initialActivityInfo);
                                } catch (e: unknown) {
                                    this.logHelper.logError('activityInfo sub error', e);
                                }
                            } else {
                                if (!this.isSyncInitialized) {
                                    this.isSyncInitialized = !this.isSyncInitialized;
                                    try {
                                        await this.fetchActivityData();
                                        this.logHelper.logDefault('Started initial sync', { value: FireTimestamp.now() });
                                    } catch (e: unknown) {
                                        this.logHelper.logError(this.fetchActivityData.name, e);
                                    }

                                    // set 30 min interval for activity sync
                                    this.activitySyncInterval = setInterval(async () => {
                                        try {
                                            await this.fetchActivityData();
                                        } catch (e: unknown) {
                                            this.logHelper.logError(this.fetchActivityData.name, e);
                                        }
                                        this.logHelper.logDefault('Syncing past activity data', { value: FireTimestamp.now() });
                                    }, 1800000); // === 1000 (to ms) * 60 (to sec) * 30 (to min)
                                    // set 5 min interval for battery info updating
                                    this.activitySyncInterval = setInterval(async () => {
                                        try {
                                            if (this.connectionInfo.isReady()) {
                                                await this.readBatteryInfo();
                                            }
                                        } catch (e: unknown) {
                                            this.logHelper.logError(this.readBatteryInfo.name, e);
                                        }
                                        this.logHelper.logDefault('Updating battery info', { value: FireTimestamp.now() });
                                    }, 300000); // === 1000 (to ms) * 60 (to sec) * 5 (to min)
                                }
                            }
                        });
                }
            },
            error: (e: unknown) => {
                this.logHelper.logError('connectionInfoSubject', e);
            }
        });
        this.authService.authUserSubject.subscribe( () => {
            // reset data
            this.resetService();
        });
    }

    private resetService(): void {
        this.isSubscribedSubject.next(false);
        this.batteryInfoSubject.next(undefined);
        this.activitySubject.next(undefined);
        this.heartRateSubject.next(undefined);
        if (this.activitySyncInterval !== undefined) {
            clearInterval(this.activitySyncInterval);
            this.activitySyncInterval = undefined;
        }
        this.activityInfoSubscription?.unsubscribe();
        this.pastActivityBuffer = [];
        this.pastHeartRateBuffer = [];
        this.isSyncInitialized = false;
    }

    private processPastActivityData(data: OperationResult): void {
        if (data.value) {
            /* Fetched past activity data max 13 bytes
               fetch batch contains 4 (at max) activity data/package  per minute

                    0. queue number
                    1-4 activity data
                    5-8. next activity data
                    9-12. next activity data

                    Activity data:

                        0. raw category
                        1. intensity
                        2. steps
                        3. heart rate
            */
            const bytes = this.ble.encodedStringToBytes(data.value);
            if (this.activitySyncedDate !== undefined) {
                for (let i = 0; i < (bytes.length - 1) / 4; i++) {
                    if (this.processedPackageCount > 0) {
                        this.activitySyncedDate.setMinutes(this.activitySyncedDate.getMinutes() + 1);
                    }

                    if (this.processedPackageCount === 0) {
                        this.processingIndex.total = 0;
                        this.processingCount.hourlyActivity = 0;
                        this.processingCount.hourlyHeartRate = 0;
                        this.processingCount.dailyActivity = 0;
                        this.processingCount.dailyHeartRate = 0;
                    }

                    // for every average +1 is needed because avg starts at -1
                    if (this.processingPastActivityDay !== this.activitySyncedDate.getDate()) {
                        // +1 is needed because avg starts at -1
                        if (this.processingCount.dailyHeartRate !== 0) {
                            this.pastHeartRateBuffer[this.processingIndex.daily].bpm.avg =
                                Math.floor(++this.pastHeartRateBuffer[this.processingIndex.daily].bpm.avg
                                    / this.processingCount.dailyHeartRate);
                        }

                        if (this.processingCount.dailyActivity !== 0) {
                            this.pastActivityBuffer[this.processingIndex.daily].intensity.avg =
                                Math.floor(++this.pastActivityBuffer[this.processingIndex.daily].intensity.avg
                                    / this.processingCount.dailyActivity);
                        }

                        this.processingCount.dailyHeartRate = 0;
                        this.processingCount.dailyActivity = 0;
                        this.processingIndex.total++;
                    }

                    if (this.processingPastActivityDay !== this.activitySyncedDate.getDate() || this.processedPackageCount === 0) {
                        this.processingPastActivityDay = this.activitySyncedDate.getDate();
                        const date = new Date(Date.UTC(this.activitySyncedDate.getFullYear(),
                            this.activitySyncedDate.getMonth(), this.activitySyncedDate.getDate(), 0, 0, 0, 0));
                        this.pastActivityBuffer.push(
                            new Activity(
                                'undefined',
                                0, // steps,
                                -1,
                                -1,
                                new MeasurementValue(-1), // intensity
                                new MeasurementInfo(data.address, FireTimestamp.fromDate(date), DateTypeEnum.DAILY),
                            )
                        );
                        this.pastHeartRateBuffer.push(new HeartRate(
                            'undefined',
                            new MeasurementValue(-1), // bpm
                            new MeasurementInfo(data.address, FireTimestamp.fromDate(date), DateTypeEnum.DAILY),
                        ));
                        this.processingIndex.daily = this.processingIndex.total === 0 ? this.processingIndex.total++ : this.processingIndex.total;
                    }

                    if (this.processingPastActivityHour !== this.activitySyncedDate.getHours()) {
                        // +1 is needed because avg starts at -1
                        if (this.processingCount.hourlyHeartRate !== 0) {
                            this.pastHeartRateBuffer[this.processingIndex.hourly].bpm.avg =
                                Math.floor(++this.pastHeartRateBuffer[this.processingIndex.hourly].bpm.avg
                                    / this.processingCount.hourlyHeartRate);
                        }

                        if (this.processingCount.hourlyActivity !== 0) {
                            this.pastActivityBuffer[this.processingIndex.hourly].intensity.avg =
                                Math.floor(++this.pastActivityBuffer[this.processingIndex.hourly].intensity.avg
                                    / this.processingCount.hourlyActivity);
                        }

                        this.processingCount.hourlyHeartRate = 0;
                        this.processingCount.hourlyActivity = 0;
                        this.processingIndex.total++;
                    }

                    if (this.processingPastActivityHour !== this.activitySyncedDate.getHours() || this.processedPackageCount === 0) {
                        this.processingPastActivityHour = this.activitySyncedDate.getHours();
                        const date = new Date(this.activitySyncedDate); // clone date
                        date.setMinutes(0, 0, 0);
                        this.pastActivityBuffer.push(
                            new Activity(
                                'undefined',
                                0, // steps,
                                -1,
                                -1,
                                new MeasurementValue(-1), // intensity
                                new MeasurementInfo(data.address, FireTimestamp.fromDate(date), DateTypeEnum.HOURLY),
                            )
                        );
                        this.pastHeartRateBuffer.push(new HeartRate(
                            'undefined',
                            new MeasurementValue(-1), // bpm
                            new MeasurementInfo(data.address, FireTimestamp.fromDate(date), DateTypeEnum.HOURLY),
                        ));
                        this.processingIndex.hourly = this.processingIndex.total;
                    }


                    // bytes[i * 4 + 1] == category ?
                    const intensity = bytes[i * 4 + 2];
                    this.pastActivityBuffer[this.processingIndex.daily].steps += bytes[i * 4 + 3];
                    this.pastActivityBuffer[this.processingIndex.hourly].steps += bytes[i * 4 + 3];
                    const bpm = bytes[i * 4 + 4];
                    // 255 bpm === not measured
                    if (bpm !== 255) {
                        if (this.pastHeartRateBuffer[this.processingIndex.hourly].bpm.min > bpm) {
                            this.pastHeartRateBuffer[this.processingIndex.hourly].bpm.min = bpm;
                        }

                        if (this.pastHeartRateBuffer[this.processingIndex.hourly].bpm.max < bpm) {
                            this.pastHeartRateBuffer[this.processingIndex.hourly].bpm.max = bpm;
                        }

                        this.pastHeartRateBuffer[this.processingIndex.hourly].bpm.avg += bpm;
                        this.processingCount.hourlyHeartRate++;

                        if (this.pastHeartRateBuffer[this.processingIndex.daily].bpm.min > bpm) {
                            this.pastHeartRateBuffer[this.processingIndex.daily].bpm.min = bpm;
                        }

                        if (this.pastHeartRateBuffer[this.processingIndex.daily].bpm.max < bpm) {
                            this.pastHeartRateBuffer[this.processingIndex.daily].bpm.max = bpm;
                        }

                        this.pastHeartRateBuffer[this.processingIndex.daily].bpm.avg += bpm;
                        this.processingCount.dailyHeartRate++;
                    }

                    if (intensity !== 0) {
                        if (this.pastActivityBuffer[this.processingIndex.hourly].intensity.min > intensity) {
                            this.pastActivityBuffer[this.processingIndex.hourly].intensity.min = intensity;
                        }

                        if (this.pastActivityBuffer[this.processingIndex.hourly].intensity.max < intensity) {
                            this.pastActivityBuffer[this.processingIndex.hourly].intensity.max = intensity;
                        }

                        this.pastActivityBuffer[this.processingIndex.hourly].intensity.avg += intensity;
                        this.processingCount.hourlyActivity++;

                        if (this.pastActivityBuffer[this.processingIndex.daily].intensity.min > intensity) {
                            this.pastActivityBuffer[this.processingIndex.daily].intensity.min = intensity;
                        }

                        if (this.pastActivityBuffer[this.processingIndex.daily].intensity.max < intensity) {
                            this.pastActivityBuffer[this.processingIndex.daily].intensity.max = intensity;
                        }

                        this.pastActivityBuffer[this.processingIndex.daily].intensity.avg += intensity;
                        this.processingCount.dailyActivity++;
                    }

                    if (this.totalPackageCount === ++this.processedPackageCount) {
                        // +1 is needed because avg starts at -1
                        if (this.processingCount.hourlyHeartRate !== 0) {
                            this.pastHeartRateBuffer[this.processingIndex.hourly].bpm.avg =
                                Math.floor(++this.pastHeartRateBuffer[this.processingIndex.hourly].bpm.avg / this.processingCount.hourlyHeartRate);
                        }

                        if (this.processingCount.hourlyActivity !== 0) {
                            this.pastActivityBuffer[this.processingIndex.hourly].intensity.avg =
                                Math.floor(++this.pastActivityBuffer[this.processingIndex.hourly].intensity.avg / this.processingCount.hourlyActivity);
                        }

                        // +1 is needed because avg starts at -1
                        if (this.processingCount.dailyHeartRate !== 0) {
                            this.pastHeartRateBuffer[this.processingIndex.daily].bpm.avg =
                                Math.floor(++this.pastHeartRateBuffer[this.processingIndex.daily].bpm.avg / this.processingCount.dailyHeartRate);
                        }

                        if (this.processingCount.dailyActivity !== 0) {
                            this.pastActivityBuffer[this.processingIndex.daily].intensity.avg =
                                Math.floor(++this.pastActivityBuffer[this.processingIndex.daily].intensity.avg / this.processingCount.dailyActivity);
                        }
                    }
                }
            } else {
                this.logHelper.logDefault(this.processPastActivityData.name, 'sync error', { value: 'activitySyncStartDateTime is undefined' });
            }
        }
    }

    private async processFetchData(data: OperationResult): Promise<void> {
        if (data.value) {
            /* Fetch data 15 bytes or 3 bytes
                0-2. response
                3-6. number of packages
                7.-14 datetime (that was sent initially)
            */
            const bytes = this.ble.encodedStringToBytes(data.value);
            this.logHelper.logDefault(this.processFetchData.name, 'fetch', { value: Buffer.from(bytes).toString('hex') });
            this.logHelper.logDefault(this.processFetchData.name, 'fetch', { value: bytes });
            if (3 <= bytes.length) {
                const response = Buffer.from(bytes).subarray(0, 3).toString('hex');
                switch (response) {
                    case '100101':
                        this.totalPackageCount = bytes.length === 15 ? this.bytesToInt(bytes.subarray(3, 7)) : 0;
                        const tmpStartDate = bytes.length === 15 ? this.dateTimeFromBytes(bytes, 7)?.toDate() : undefined;
                        if (tmpStartDate !== undefined) {
                            this.activitySyncedDate = new Date(tmpStartDate);
                            this.activitySyncedDate.setSeconds(0, 0);
                            this.processingPastActivityHour = this.activitySyncedDate.getHours();
                            this.processingPastActivityDay = this.activitySyncedDate.getDate();
                            this.logHelper.logDefault(this.processFetchData.name, 'fetch package count', { value: this.totalPackageCount });
                            this.logHelper.logDefault(this.processFetchData.name, 'fetch start datetime', { value: this.activitySyncedDate });
                            if (0 < this.totalPackageCount) {
                                this.processedPackageCount = 0;
                                try {
                                    await this.write(data.address, data.service, data.characteristic, Uint8Array.of(0x02));
                                    this.activitySyncStatusSubject.next(new TaskProgressInfo(ProgressStatusEnum.STARTED, Math.ceil(this.totalPackageCount / 60) * 2));
                                    this.logHelper.logDefault(this.processFetchData.name, 'Activity fetching start code sent');
                                } catch (e: unknown) {
                                    this.logHelper.logError(this.processFetchData.name, 'write fetch start error', { value: e });
                                }
                            } else {
                                try {
                                    await this.write(data.address, data.service, data.characteristic, Uint8Array.of(0x03));
                                    this.logHelper.logDefault(this.processFetchData.name, 'Activity fetching end code sent, because there is no past activity data');
                                } catch (e: unknown) {
                                    this.logHelper.logError(this.processFetchData.name, 'write fetch end error', { value: e });
                                }
                            }
                        } else {
                            this.logHelper.logError(this.processFetchData.name, 'fetch start error', { value: 'missing start date' });
                        }
                        break;
                    case '100102':
                        this.logHelper.logDefault(this.processFetchData.name, 'Activity fetching started');
                        break;
                    case '100201':
                        if (this.pastActivityBuffer !== []) {
                            let processedCount = 0;
                            let isFirstHourlyProcessed = false;
                            await Promise.all(this.pastHeartRateBuffer.map( async (heartRate: HeartRate) => {
                                try {
                                    if (!isFirstHourlyProcessed || heartRate.measurementInfo.type === DateTypeEnum.DAILY) {
                                        if (heartRate.measurementInfo.type === DateTypeEnum.HOURLY) {
                                            isFirstHourlyProcessed = !isFirstHourlyProcessed;
                                        }
                                        const sameHeartRate = await this.heartRateService.list([
                                            { fieldPath: 'measurementInfo.date', opStr: '==', value: heartRate.measurementInfo.date },
                                            { fieldPath: 'measurementInfo.type', opStr: '==', value: heartRate.measurementInfo.type },
                                            { limit: 1 }
                                        ]);
                                        if (sameHeartRate !== undefined) {
                                            heartRate.bpm.max = heartRate.bpm.max < sameHeartRate[0].bpm.max ? sameHeartRate[0].bpm.max : heartRate.bpm.max;
                                            heartRate.bpm.min = heartRate.bpm.min > sameHeartRate[0].bpm.min ? sameHeartRate[0].bpm.min : heartRate.bpm.min;

                                            if (heartRate.bpm.avg === -1) {
                                                heartRate.bpm.avg = sameHeartRate[0].bpm.avg;
                                            }

                                            if (heartRate.bpm.avg !== -1 && sameHeartRate[0].bpm.avg !== -1) {
                                                if ((heartRate.bpm.avg === 0 && sameHeartRate[0].bpm.avg === 0)
                                                    || (heartRate.bpm.avg === 0 || sameHeartRate[0].bpm.avg === 0)
                                                ) {
                                                    heartRate.bpm.avg += sameHeartRate[0].bpm.avg;
                                                } else {
                                                    heartRate.bpm.avg = Math.floor((heartRate.bpm.avg + sameHeartRate[0].bpm.avg) / 2);
                                                }
                                            }

                                            await this.heartRateService.update({ id: sameHeartRate[0].id }, { bpm: heartRate.bpm });
                                        } else {
                                            await this.heartRateService.add(heartRate);
                                        }
                                    } else {
                                        await this.heartRateService.add(heartRate);
                                    }
                                } catch (e: unknown) {
                                    this.logHelper.logError(this.processFetchData.name, 'add past HeartRate error', { value: e });
                                }
                                this.activitySyncStatusSubject.next(new TaskProgressInfo(ProgressStatusEnum.PROCESSING, this.pastActivityBuffer.length * 2, ++processedCount));
                            }));
                            this.pastHeartRateBuffer = [];
                            isFirstHourlyProcessed = false;
                            await Promise.all(this.pastActivityBuffer.map( async (activity: Activity) => {
                                try {
                                    if (!isFirstHourlyProcessed || activity.measurementInfo.type === DateTypeEnum.DAILY) {
                                        if (activity.measurementInfo.type === DateTypeEnum.HOURLY) {
                                            isFirstHourlyProcessed = !isFirstHourlyProcessed;
                                        }
                                        const sameActivity = await this.activityService.list([
                                            { fieldPath: 'measurementInfo.date', opStr: '==', value: activity.measurementInfo.date },
                                            { fieldPath: 'measurementInfo.type', opStr: '==', value: activity.measurementInfo.type },
                                            { limit: 1 }
                                        ]);
                                        if (sameActivity !== undefined) {
                                            if (activity.measurementInfo.type === DateTypeEnum.HOURLY) {
                                                activity.steps += sameActivity[0].steps;
                                            } else {
                                                activity.steps = activity.steps > sameActivity[0].steps ? activity.steps : sameActivity[0].steps;
                                            }

                                            activity.intensity.max = activity.intensity.max < sameActivity[0].intensity.max
                                                ? sameActivity[0].intensity.max : activity.intensity.max;
                                            activity.intensity.min = activity.intensity.min > sameActivity[0].intensity.min
                                                ? sameActivity[0].intensity.min : activity.intensity.min;

                                            if (activity.intensity.avg === -1) {
                                                activity.intensity.avg = sameActivity[0].intensity.avg;
                                            }

                                            if (activity.intensity.avg !== -1 && sameActivity[0].intensity.avg !== -1) {
                                                if ((activity.intensity.avg === 0 && sameActivity[0].intensity.avg === 0)
                                                    || (activity.intensity.avg === 0 || sameActivity[0].intensity.avg === 0)
                                                ) {
                                                    activity.intensity.avg += sameActivity[0].intensity.avg;
                                                } else {
                                                    activity.intensity.avg = Math.floor((activity.intensity.avg + sameActivity[0].intensity.avg) / 2);
                                                }
                                            }

                                            await this.activityService.update(
                                                { id: sameActivity[0].id },
                                                {
                                                    steps: activity.steps,
                                                    intensity: activity.intensity
                                                }
                                            );
                                        } else {
                                            await this.activityService.add(activity);
                                        }
                                    } else {
                                        await this.activityService.add(activity);
                                    }
                                } catch (e: unknown) {
                                    this.logHelper.logError(this.processFetchData.name, 'add past Activity error', { value: e });
                                }
                                this.activitySyncStatusSubject.next(new TaskProgressInfo(ProgressStatusEnum.PROCESSING, this.pastActivityBuffer.length * 2, ++processedCount));
                            }));

                            this.pastActivityBuffer = [];
                            try {
                                if (this.activitySyncedDate !== undefined && this.activityInfo !== undefined) {
                                    this.activitySyncedDate.setMinutes(this.activitySyncedDate.getMinutes() + 1);
                                    await this.activityInfoService.update({ id: this.activityInfo.id }, { lastSynced: FireTimestamp.fromDate(this.activitySyncedDate) });
                                }
                            } catch (e: unknown) {
                                this.logHelper.logError(this.processPastActivityData.name, 'update last sync date error');
                            }
                        }

                        if (this.activitySyncedDate !== undefined && new Date().getTime() - this.activitySyncedDate.getTime() <= 60 * 1000) {
                            try {
                                await this.write(data.address, data.service, data.characteristic, Uint8Array.of(0x03));
                                this.logHelper.logDefault(this.processFetchData.name, 'Activity fetching end code sent');
                            } catch (e: unknown) {
                                this.logHelper.logError(this.processFetchData.name, 'write fetch end error', { value: e });
                            }
                        } else {
                            try {
                                await this.fetchActivityData();
                            } catch (e: unknown) {
                                this.logHelper.logError(this.fetchActivityData.name, e);
                            }
                        }
                        break;
                    case '100301':
                        this.logHelper.logDefault(this.processFetchData.name, 'Fetching successfully finished');
                        this.unsubscribe(data.address, data.service, data.characteristic).catch((e: unknown) => {
                            this.logHelper.logError(this.processFetchData.name, e);
                        });
                        this.activitySyncStatusSubject.next(new TaskProgressInfo(ProgressStatusEnum.FINISHED));
                        break;
                    default:
                        this.activitySyncStatusSubject.next(new TaskProgressInfo(ProgressStatusEnum.FAILED));
                        this.unsubscribe(data.address, data.service, data.characteristic).catch((e: unknown) => {
                            this.logHelper.logError(this.processFetchData.name, e);
                        });
                        this.logHelper.logError(this.processFetchData.name, 'unexpected fetch response code', { value: response });
                }
            }
        }
    }

    private async processRealTimeActivity(data: OperationResult): Promise<void> {
        if (data.value) {
            const bytes = this.ble.encodedStringToBytes(data.value);
            /* Realtime steps 5 bytes or 13 bytes if not used with Mi Fit it only shows steps count => 5 bytes
                0. header?
                1-4. steps
                5-8. calories (kcal)
                9-12. distance (meters)
            */
            const activity = new Activity();
            const current = new Date();
            const date = new Date(Date.UTC(current.getFullYear(), current.getMonth(), current.getDate(), 0, 0, 0, 0));
            activity.measurementInfo = new MeasurementInfo(data.address, FireTimestamp.fromDate(date), DateTypeEnum.DAILY);
            activity.steps = this.bytesToInt(bytes.subarray(1, 5));
            activity.distance = this.bytesToInt(bytes.subarray(5, 9));
            activity.calories = this.bytesToInt(bytes.subarray(9));
            const sameActivity = await this.activityService.list([
                { fieldPath: 'measurementInfo.date', opStr: '==', value: activity.measurementInfo.date },
                { fieldPath: 'measurementInfo.type', opStr: '==', value: activity.measurementInfo.type },
                { limit: 1 }
            ]);
            if (sameActivity !== undefined) {
                await this.activityService.update(
                    { id: sameActivity[0].id },
                    {
                        steps: activity.steps,
                        distance: activity.distance,
                        calories: activity.calories
                    }
                );
            } else {
                await this.activityService.add(activity);
            }
            this.activitySubject.next(activity);
            this.logHelper.logDefault(this.processRealTimeActivity.name, 'realtime activity', { value: activity });
        }
    }

    public async processBatteryInfo(data: OperationResult): Promise<void> {
        if (data.value) {
            const bytes = this.ble.encodedStringToBytes(data.value);
            if (bytes.length < 3) {
                // get full battery info
                try {
                    await this.readBatteryInfo();
                } catch (e: unknown) {
                    this.logHelper.logError(this.processBatteryInfo.name, this.readBatteryInfo.name, { value: e });
                }
            } else {
                // process full info after reading from device
                const batteryInfo = new BatteryInfo();
                const unknown_value = bytes.at(0); // first byte ???
                batteryInfo.id = data.address;
                batteryInfo.deviceRef = this.connectionInfo.device?.macAddress ?? 'unknown';
                batteryInfo.batteryLevel = bytes.at(1) as number;
                batteryInfo.isCharging = bytes.at(2) === 1; // status => 1 === charging
                batteryInfo.prevChargeDate = this.dateTimeFromBytes(bytes, 3); // 7 bytes
                batteryInfo.prevNumOfCharges = bytes.at(10);
                batteryInfo.lastChargeDate = this.dateTimeFromBytes(bytes, 11); // 7 bytes
                batteryInfo.lastNumOfCharges = bytes.at(18);
                batteryInfo.lastChargeLevel = bytes.at(19);
                this.logHelper.logDefault(this.processBatteryInfo.name, 'batteryInfo', { value: batteryInfo });
                this.logHelper.logDefault(this.processBatteryInfo.name, 'batteryInfo unknown value', { value: unknown_value });
                this.batteryInfoSubject.next(batteryInfo);
                try {
                    await this.batteryInfoService.update({ id: batteryInfo.id }, batteryInfo);
                } catch (e: unknown) {
                    this.logHelper.logError(this.processBatteryInfo.name, 'update BatteryInfo error', { value: e });
                }
            }
        }
    }

    private async processHeartRate(data: OperationResult): Promise<void> {
        if (data.value !== undefined) {
            // pushes data per second 1 heart rate measurement === 5 bpm data
            // 0. header?
            // 1. bpm
            const bpm = this.ble.encodedStringToBytes(data.value)[1];
            this.logHelper.logDefault(this.processHeartRate.name, 'bpm', { value: bpm });
            this.heartRateSubject.next(bpm);
        }
    }

    private processDataObserver(processFunction: (value: OperationResult) => void): Partial<Observer<OperationResult>> {
        return {
            next: processFunction,
            error: (e: unknown): void => {
                if (e instanceof Error && e.message !== 'Device is disconnected') {
                    this.logHelper.logDefault(this.processDataObserver.name, e);
                }
            }
        };
    }

    private subscribeToRealTimeActivity(): void {
        const service = this.miBand3.getServiceByName('mi band');
        const characteristic = service?.getCharacteristicByName('realtime activity');
        if (service === undefined) {
            throw new Error('Failed to get Mi Band service');
        } else if (characteristic === undefined) {
            throw new Error('Failed to get Realtime Activity characteristic');
        } else if (this.connectionInfo.device === undefined) {
            throw new Error('No connected device');
        }
        return this.subscribe(this.connectionInfo.device, service, characteristic, this.processDataObserver((value: OperationResult) => this.processRealTimeActivity(value)));
    }

    private subscribeToActivityData(): void {
        const service = this.miBand3.getServiceByName('mi band');
        const characteristic = service?.getCharacteristicByName('activity data');
        if (service === undefined) {
            throw new Error('Failed to get Mi Band service');
        } else if (characteristic === undefined) {
            throw new Error('Failed to get Activity Data characteristic');
        } else if (this.connectionInfo.device === undefined) {
            throw new Error('No connected device');
        }
        return this.subscribe(this.connectionInfo.device, service, characteristic, this.processDataObserver((value: OperationResult) => this.processPastActivityData(value)));
    }

    private subscribeToBatteryInfo(): void {
        const service = this.miBand3.getServiceByName('mi band');
        const characteristic = service?.getCharacteristicByName('battery info');
        if (service === undefined) {
            throw new Error('Failed to get Mi Band service');
        } else if (characteristic === undefined) {
            throw new Error('Failed to get Battery Info characteristic');
        } else if (this.connectionInfo.device === undefined) {
            throw new Error('No connected device');
        }
        return this.subscribe(this.connectionInfo.device, service, characteristic, this.processDataObserver((value: OperationResult) => this.processBatteryInfo(value)));
    }

    private subscribeToHeartRate(): void {
        const service = this.miBand3.getServiceByName('heart rate');
        const characteristic = service?.getCharacteristicByName('heart rate measurement');
        if (service === undefined) {
            throw new Error('Failed to get Heart Rate service');
        } else if (characteristic === undefined) {
            throw new Error('Failed to get Heart Rate Measurement characteristic');
        } else if (this.connectionInfo.device === undefined) {
            throw new Error('No connected device');
        }
        return this.subscribe(this.connectionInfo.device, service, characteristic, this.processDataObserver((value: OperationResult) => this.processHeartRate(value)));
    }

    private async readRealTimeActivity(): Promise<void> {
        const service = this.miBand3.getServiceByName('mi band');
        const characteristic = service?.getCharacteristicByName('realtime activity');
        if (service === undefined) {
            throw new Error('Failed to get Mi Band service');
        } else if (characteristic === undefined) {
            throw new Error('Failed to get Realtime Activity characteristic');
        } else if (this.connectionInfo.device === undefined) {
            throw new Error('No connected device');
        }
        try {
            await this.processRealTimeActivity(await this.read(this.connectionInfo.device, service, characteristic));
        } catch (e: unknown) {
            this.logHelper.logError(this.readRealTimeActivity.name, 'read real time activity error', { value: e });
        }
    }

    private async readBatteryInfo(): Promise<void> {
        const service = this.miBand3.getServiceByName('mi band');
        const characteristic = service?.getCharacteristicByName('battery info');
        if (service === undefined) {
            throw new Error('Failed to get Mi Band service');
        } else if (characteristic === undefined) {
            throw new Error('Failed to get Battery Info characteristic');
        } else if (this.connectionInfo.device === undefined) {
            throw new Error('No connected device');
        }
        try {
            await this.processBatteryInfo(await this.read(this.connectionInfo.device, service, characteristic));
        } catch (e: unknown) {
            this.logHelper.logError(this.readRealTimeActivity.name, 'read real time activity error', { value: e });
        }
    }

    public async initDeviceData(): Promise<void> {
        try {
            this.subscribeToRealTimeActivity();
            this.subscribeToBatteryInfo();
            this.subscribeToHeartRate();
            await this.readRealTimeActivity();
            await this.readBatteryInfo();
            this.isSubscribedSubject.next(true);
        } catch (e: unknown) {
            throw e;
        }
    }

    public async getSoftwareVersion(): Promise<string> {
        const service = this.miBand3.getServiceByName('device information');
        const characteristic = service?.getCharacteristicByName('software');
        if (service === undefined) {
            throw new Error('Failed to get Device Information service');
        } else if (characteristic === undefined) {
            throw new Error('Failed to get Software Revision characteristic');
        } else if (this.connectionInfo.device === undefined) {
            throw new Error('No connected device');
        }
        let version = 'unknown';
        try {
            const data = await this.read(this.connectionInfo.device, service, characteristic);
            version = String.fromCharCode(...this.ble.encodedStringToBytes(data.value));
        } catch (e: unknown) {
            this.logHelper.logError(this.getSoftwareVersion.name, e);
        }
        return version;
    }

    public async getSerialNumber(): Promise<string> {
        const service = this.miBand3.getServiceByName('device information');
        const characteristic = service?.getCharacteristicByName('serial number');
        if (service === undefined) {
            throw new Error('Failed to get Device Information service');
        } else if (characteristic === undefined) {
            throw new Error('Failed to get Serial Number characteristic');
        } else if (this.connectionInfo.device === undefined) {
            throw new Error('No connected device');
        }
        let version = 'unknown';
        try {
            const data = await this.read(this.connectionInfo.device, service, characteristic);
            version = String.fromCharCode(...this.ble.encodedStringToBytes(data.value));
        } catch (e: unknown) {
            this.logHelper.logError(this.getSerialNumber.name, e);
        }
        return version;
    }

    public async getHardwareVersion(): Promise<string> {
        const service = this.miBand3.getServiceByName('device information');
        const characteristic = service?.getCharacteristicByName('hardware revision');
        if (service === undefined) {
            throw new Error('Failed to get Device Information service');
        } else if (characteristic === undefined) {
            throw new Error('Failed to get Hardware Revision characteristic');
        } else if (this.connectionInfo.device === undefined) {
            throw new Error('No connected device');
        }
        let version = 'unknown';
        try {
            const data = await this.read(this.connectionInfo.device, service, characteristic);
            version = String.fromCharCode(...this.ble.encodedStringToBytes(data.value));
        } catch (e: unknown) {
            this.logHelper.logError(this.getSerialNumber.name, e);
        }
        return version;
    }

    public async fetchActivityData(): Promise<void> {
        const service = this.miBand3.getServiceByName('mi band');
        const characteristic = service?.getCharacteristicByName('fetch');
        if (service === undefined) {
            throw new Error('Failed to get Mi Band service');
        } else if (characteristic === undefined) {
            throw new Error('Failed to get Fetch characteristic');
        } else if (this.connectionInfo.device === undefined) {
            throw new Error('No connected device');
        }
        this.subscribe(this.connectionInfo.device, service, characteristic, this.processDataObserver((value: OperationResult) => this.processFetchData(value)));
        this.subscribeToActivityData();
        try {
            if (this.activityInfo !== undefined) {
                this.logHelper.logDefault(this.fetchActivityData.name, 'Fetching activity date from device...');
                if (this.activityInfo.lastSynced === undefined) {
                }
                const timeBytes = this.dateTimeToBytes(this.activityInfo.lastSynced, { timezone: true });
                const initBytes = Uint8Array.of(0x01, 0x01);
                const writeData = new Uint8Array(timeBytes.length + initBytes.length);
                writeData.set(initBytes);
                writeData.set(timeBytes, initBytes.length);
                this.logHelper.logDefault(this.fetchActivityData.name, 'activity fetch write data', { value: writeData });
                await this.write(this.connectionInfo.device, service, characteristic, writeData);
                this.logHelper.logDefault(this.fetchActivityData.name, 'Past activity fetching start data sent');
            }
        } catch (e: unknown) {
            this.logHelper.logError(this.fetchActivityData.name, e);
        }
    }

}
