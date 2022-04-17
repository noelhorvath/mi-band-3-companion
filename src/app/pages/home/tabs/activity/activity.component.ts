import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivityDataType, DateType, MeasurementValueDataType } from '../../../../shared/types/custom.types';
import { DateTypeEnum, IntervalTypeEnum } from '../../../../shared/enums/date.enum';
import { ChartDataset } from 'chart.js';
import { StorageService } from '../../../../services/storage/storage.service';
import { ActivityDataTypeEnum } from '../../../../shared/enums/activity.enum';
import { Activity } from '../../../../shared/models/classes/Activity';
import { LogHelper } from '../../../../shared/models/classes/LogHelper';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { FirestoreActivityService } from '../../../../services/firestore/activity/firestore-activity.service';
import { getDaysInMonth, getInterval, isLeapYear } from '../../../../shared/functions/date.functions';
import { MeasurementValueDataTypeEnum } from '../../../../shared/enums/measurement-value-data-type.enum';
import { DocumentSnapshot } from '@angular/fire/firestore';
import { Device } from '../../../../shared/models/classes/Device';
import { IFilterOptions } from '../../../../shared/models/interfaces/IFilterOptions';
import { OrderByQuery, PaginateResult, WhereQuery } from '../../../../shared/types/firestore.types';
import { QueryOperator } from '../../../../shared/enums/firestore.enum';
import { FireTimestamp } from '../../../../shared/models/classes/FireTimestamp';
import { IChartDataStatus } from '../../../../shared/models/interfaces/IChartDataStatus';
import { BleConnectionService } from '../../../../services/ble/connection/ble-connection.service';

@Component({
    selector: 'app-activity',
    templateUrl: './activity.component.html',
    styleUrls: ['./activity.component.scss'],
})
export class ActivityComponent implements OnInit, OnDestroy {
    private readonly logHelper: LogHelper;
    public readonly ACTIVITY_DATA_TYPES: ActivityDataType[] = [ActivityDataTypeEnum.STEPS, ActivityDataTypeEnum.CALORIES, ActivityDataTypeEnum.DISTANCE, ActivityDataTypeEnum.INTENSITY];
    public readonly MEASUREMENT_VALUE_DATA_TYPES: MeasurementValueDataType[] = [MeasurementValueDataTypeEnum.AVERAGE, MeasurementValueDataTypeEnum.MINIMUM, MeasurementValueDataTypeEnum.MAXIMUM];
    public readonly FILTER_FIELDS: { fieldName: string; text: string }[];
    public readonly MEASUREMENT_TYPES: (DateTypeEnum.DAILY | DateTypeEnum.HOURLY | DateTypeEnum.WEEKLY | DateTypeEnum.MONTHLY | 'all')[];
    private dailyActivitiesSubscription: Subscription | undefined;
    private weeklyActivitiesSubscription: Subscription | undefined;
    private monthlyActivitiesSubscription: Subscription | undefined;
    private yearlyActivitiesSubscription: Subscription | undefined;
    private connectionInfoSubscription: Subscription | undefined;
    private activityDataInitializedStatusSubscription: Subscription | undefined;
    private activityDataInitializedStatusSubject: Subject<IChartDataStatus>;
    private activityDataInitializedStatus: IChartDataStatus;
    private dailyActivities: Activity[] | undefined;
    private weeklyActivities: Activity[] | undefined;
    private monthlyActivities: Activity[] | undefined;
    private yearlyActivities: Activity[] | undefined;
    private lastPaginateActivityDoc: DocumentSnapshot<Activity> | undefined;
    private lastPaginateQueryOptions: (OrderByQuery | WhereQuery)[] | undefined;
    public isLoadingActivities: boolean;
    public device: Device | undefined;
    public activityItemsSize: number;
    public activityItems: Activity[] | undefined;
    public activityDataType: ActivityDataType | undefined;
    public activityChartDateType: DateType | undefined;
    public activityMeasurementValueDataType: MeasurementValueDataType | undefined;
    public activityChartData: ChartDataset[] | undefined;
    public isDailyButtonDisabled: boolean;

    public constructor(
        private storageService: StorageService,
        private activityService: FirestoreActivityService,
        private bleConnectionService: BleConnectionService
    ) {
        this.logHelper = new LogHelper(ActivityComponent.name);
        this.isDailyButtonDisabled = false;
        this.isLoadingActivities = false;
        this.activityItemsSize = 10;
        this.FILTER_FIELDS = [
            { fieldName: 'measurementInfo.date', text: 'date' },
            { fieldName: ActivityDataTypeEnum.STEPS, text: ActivityDataTypeEnum.STEPS },
            { fieldName: ActivityDataTypeEnum.DISTANCE, text: ActivityDataTypeEnum.DISTANCE },
            { fieldName: ActivityDataTypeEnum.CALORIES, text: ActivityDataTypeEnum.CALORIES },
            { fieldName: 'intensity.avg', text: 'avg_intensity' },
            { fieldName: 'intensity.max', text: 'max_intensity' },
            { fieldName: 'intensity.min', text: 'min_intensity' },
        ];
        this.activityDataInitializedStatus = { isDaily: false, isWeekly: false, isMonthly: false, isYearly: false };
        this.activityDataInitializedStatusSubject = new BehaviorSubject<{ isDaily: boolean; isWeekly: boolean; isMonthly: boolean; isYearly: boolean }>(
            { isDaily: false, isWeekly: false, isMonthly: false, isYearly: false }
        );
        this.MEASUREMENT_TYPES = ['all', DateTypeEnum.HOURLY, DateTypeEnum.DAILY];
        this.connectionInfoSubscription = this.bleConnectionService.deviceSettingsSubject.subscribe( (device: Device) => {
            this.device = device;
            this.activityDataInitializedStatus = { isDaily: false, isWeekly: false, isMonthly: false, isYearly: false };
            this.activityDataInitializedStatusSubject = new BehaviorSubject<{ isDaily: boolean; isWeekly: boolean; isMonthly: boolean; isYearly: boolean }>(
                { isDaily: false, isWeekly: false, isMonthly: false, isYearly: false }
            );
            this.activityDataInitializedStatusSubscription = this.activityDataInitializedStatusSubject
                .subscribe((initStatus: IChartDataStatus) => {
                        if (initStatus.isDaily !== this.activityDataInitializedStatus.isDaily
                            || initStatus.isWeekly !== this.activityDataInitializedStatus.isWeekly
                            || initStatus.isMonthly !== this.activityDataInitializedStatus.isMonthly
                            || initStatus.isYearly !== this.activityDataInitializedStatus.isYearly
                        ) {
                            this.activityDataInitializedStatus = initStatus;
                        }
                    }
                );
            let interval = getInterval(IntervalTypeEnum.TODAY);
            try {
                this.dailyActivitiesSubscription = this.activityService.listWithValueChanges([
                    { fieldPath: 'measurementInfo.date', opStr: '>=', value: interval.start },
                    { fieldPath: 'measurementInfo.date', opStr: '<=', value: interval.end },
                    { fieldPath: 'measurementInfo.type', opStr: '==', value: DateTypeEnum.HOURLY },
                    { fieldPath: 'measurementInfo.deviceRef', opStr: '==', value: this.device?.macAddress },
                    { fieldPath: 'measurementInfo.date', directionStr: 'asc' },
                    { limit: 24 }
                ]).subscribe((activities: Activity[] | undefined) => {
                    this.dailyActivities = activities ?? [];
                    if (!this.activityDataInitializedStatus.isDaily && this.dailyActivities instanceof Array) {
                        this.activityDataInitializedStatus.isDaily = true;
                        this.activityDataInitializedStatusSubject.next(this.activityDataInitializedStatus);
                    }
                });
            } catch (e: unknown) {
                this.logHelper.logError(this.activityService.listWithValueChanges.name, 'list activities error', { value: e });
                this.dailyActivities = undefined;
            }

            interval = getInterval(IntervalTypeEnum.THIS_WEEK);
            try {
                this.weeklyActivitiesSubscription = this.activityService.listWithValueChanges([
                    { fieldPath: 'measurementInfo.date', opStr: '>=', value: interval.start },
                    { fieldPath: 'measurementInfo.date', opStr: '<=', value: interval.end },
                    { fieldPath: 'measurementInfo.type', opStr: '==', value: DateTypeEnum.DAILY },
                    { fieldPath: 'measurementInfo.deviceRef', opStr: '==', value: this.device?.macAddress },
                    { fieldPath: 'measurementInfo.date', directionStr: 'asc' },
                    { limit: 7 }
                ]).subscribe((activities: Activity[] | undefined) => {
                    this.weeklyActivities = activities ?? [];
                    if (!this.activityDataInitializedStatus.isWeekly && this.weeklyActivities instanceof Array) {
                        this.activityDataInitializedStatus.isWeekly = true;
                        this.activityDataInitializedStatusSubject.next(this.activityDataInitializedStatus);
                    }
                });
            } catch (e: unknown) {
                this.logHelper.logError(this.activityService.listWithValueChanges.name, 'list activities error', { value: e });
                this.weeklyActivities = undefined;
            }

            interval = getInterval(IntervalTypeEnum.THIS_MONTH);
            try {
                this.monthlyActivitiesSubscription = this.activityService.listWithValueChanges([
                    { fieldPath: 'measurementInfo.date', opStr: '>=', value: interval.start },
                    { fieldPath: 'measurementInfo.date', opStr: '<=', value: interval.end },
                    { fieldPath: 'measurementInfo.type', opStr: '==', value: DateTypeEnum.DAILY },
                    { fieldPath: 'measurementInfo.deviceRef', opStr: '==', value: this.device?.macAddress },
                    { fieldPath: 'measurementInfo.date', directionStr: 'asc' },
                    { limit: getDaysInMonth(new Date()) }
                ]).subscribe((activities: Activity[] | undefined) => {
                    this.monthlyActivities = activities ?? [];
                    if (!this.activityDataInitializedStatus.isMonthly && this.monthlyActivities instanceof Array) {
                        this.activityDataInitializedStatus.isMonthly = true;
                        this.activityDataInitializedStatusSubject.next(this.activityDataInitializedStatus);
                    }
                });
            } catch (e: unknown) {
                this.logHelper.logError(this.activityService.listWithValueChanges.name, 'list activities error', { value: e });
                this.monthlyActivities = undefined;
            }

            interval = getInterval(IntervalTypeEnum.THIS_YEAR);
            try {
                this.yearlyActivitiesSubscription = this.activityService.listWithValueChanges([
                    { fieldPath: 'measurementInfo.date', opStr: '>=', value: interval.start },
                    { fieldPath: 'measurementInfo.date', opStr: '<=', value: interval.end },
                    { fieldPath: 'measurementInfo.type', opStr: '==', value: DateTypeEnum.DAILY },
                    { fieldPath: 'measurementInfo.deviceRef', opStr: '==', value: this.device?.macAddress },
                    { fieldPath: 'measurementInfo.date', directionStr: 'asc' },
                    { limit: isLeapYear(new Date()) ? 366 : 365 }
                ]).subscribe((activities: Activity[] | undefined) => {
                    this.yearlyActivities = activities ?? [];
                    if (!this.activityDataInitializedStatus.isYearly && this.yearlyActivities instanceof Array) {
                        this.activityDataInitializedStatus.isYearly = true;
                        this.activityDataInitializedStatusSubject.next(this.activityDataInitializedStatus);
                    }
                });
            } catch (e: unknown) {
                this.logHelper.logError(this.activityService.listWithValueChanges.name, 'list activities error', { value: e });
                this.yearlyActivities = undefined;
            }
        });
    }

    private async initChart(): Promise<void> {
        try {
            const savedActivityDataType = await this.storageService.getActivityDataType();
            this.logHelper.logDefault(this.ngOnInit.name, 'saved ActivityDataType', { value: savedActivityDataType });
            this.activityDataType = savedActivityDataType ?? ActivityDataTypeEnum.STEPS;
            const savedActivityMeasurementValueDataType = await this.storageService.getActivityMeasurementValueDataType();
            this.logHelper.logDefault(this.ngOnInit.name, 'saved ActivityMeasurementValueDataType', { value: savedActivityMeasurementValueDataType });
            this.activityMeasurementValueDataType = savedActivityMeasurementValueDataType ?? MeasurementValueDataTypeEnum.AVERAGE;
            const savedChartDateType = await this.storageService.getActivityChartDateType();
            this.logHelper.logDefault(this.ngOnInit.name, 'saved chart DateType', { value: savedChartDateType });
            if (savedActivityDataType === ActivityDataTypeEnum.CALORIES || savedActivityDataType === ActivityDataTypeEnum.DISTANCE) {
                this.activityChartDateType = (savedChartDateType === DateTypeEnum.DAILY ? DateTypeEnum.WEEKLY : savedChartDateType) ?? DateTypeEnum.WEEKLY;
            } else {
                this.activityChartDateType = savedChartDateType ?? DateTypeEnum.DAILY;
            }
        } catch (e: unknown) {
            this.logHelper.logError(this.ngOnInit.name, 'error', { value: e });
        }
    }

    public ngOnInit(): void {
        this.initChart()
            .then(() => this.logHelper.logDefault(this.initChart.name, 'activity chart has been initialized'));
    }

    public async onChartTypeChanged(dateType?: DateType): Promise<void> {
        try {
            if (this.activityChartDateType !== undefined && this.activityDataType !== undefined) {
                const prevMeasurementValueDataType = await this.storageService.getActivityMeasurementValueDataType();
                const prevActivityDataType = await this.storageService.getActivityDataType();
                const prevDateType = this.activityChartDateType;

                if (this.activityChartDateType !== dateType && dateType !== undefined) {
                    this.activityChartDateType = dateType;
                    await this.storageService.setActivityChartDateType(this.activityChartDateType);
                }

                this.isDailyButtonDisabled = this.activityDataType === ActivityDataTypeEnum.CALORIES || this.activityDataType === ActivityDataTypeEnum.DISTANCE;

                if (this.isDailyButtonDisabled && this.activityChartDateType === DateTypeEnum.DAILY) {
                    this.activityChartDateType = DateTypeEnum.WEEKLY;
                    return;
                }

                if (this.activityDataType !== prevActivityDataType) {
                    await this.storageService.setActivityDataType(this.activityDataType);
                }

                if (this.activityMeasurementValueDataType !== prevMeasurementValueDataType && this.activityMeasurementValueDataType !== undefined) {
                    await this.storageService.setActivityMeasurementValueDataType(this.activityMeasurementValueDataType);
                }

                if (this.activityDataType !== prevActivityDataType || this.activityChartDateType !== prevDateType
                    || this.activityMeasurementValueDataType !== prevMeasurementValueDataType || this.activityChartData === undefined
                ) {
                    this.logHelper.logDefault(this.onChartTypeChanged.name, 'data type changed', { value: this.activityDataType });
                    switch (dateType ?? this.activityChartDateType) {
                        case DateTypeEnum.DAILY:
                            if (this.dailyActivities === undefined) {
                                const sub = this.activityDataInitializedStatusSubject.subscribe((status: IChartDataStatus) => {
                                    if (status.isDaily.valueOf()) {
                                        this.logHelper.logDefault(this.onChartTypeChanged.name, 'dailyActivities is initialized');
                                        this.onChartTypeChanged(DateTypeEnum.DAILY);
                                        sub?.unsubscribe();
                                    }
                                });
                                return;
                            }
                            break;
                        case DateTypeEnum.WEEKLY:
                            if (this.weeklyActivities === undefined) {
                                const sub = this.activityDataInitializedStatusSubject.subscribe((status: IChartDataStatus) => {
                                    if (status.isWeekly.valueOf()) {
                                        this.logHelper.logDefault(this.onChartTypeChanged.name, 'weeklyActivities is initialized');
                                        this.onChartTypeChanged(DateTypeEnum.WEEKLY);
                                        sub?.unsubscribe();
                                    }
                                });
                                return;
                            }
                            break;
                        case DateTypeEnum.MONTHLY:
                            if (this.monthlyActivities === undefined) {
                                const sub = this.activityDataInitializedStatusSubject.subscribe((status: IChartDataStatus) => {
                                    if (status.isMonthly.valueOf()) {
                                        this.logHelper.logDefault(this.onChartTypeChanged.name, 'monthlyActivities is initialized');
                                        this.onChartTypeChanged(DateTypeEnum.MONTHLY);
                                        sub?.unsubscribe();
                                    }
                                });
                                return;
                            }
                            break;
                        case DateTypeEnum.YEARLY:
                            if (this.yearlyActivities === undefined) {
                                const sub = this.activityDataInitializedStatusSubject.subscribe((status: IChartDataStatus) => {
                                    if (status.isYearly.valueOf()) {
                                        this.logHelper.logDefault(this.onChartTypeChanged.name, 'yearlyActivities is initialized');
                                        this.onChartTypeChanged(DateTypeEnum.YEARLY);
                                        sub?.unsubscribe();
                                    }
                                });
                                return;
                            }
                            break;
                        default:
                            return Promise.reject(dateType + ' is not used in chart visualization');
                    }
                    this.activityChartData = this.getActivityChartData(this.activityDataType, this.activityChartDateType, this.activityMeasurementValueDataType);
                } else {
                    this.logHelper.logDefault(this.onChartTypeChanged.name, 'data type is same', { value: this.activityDataType });
                }
            }
        } catch (e: unknown) {
            this.logHelper.logError(this.onChartTypeChanged.name, 'error', { value: e });
        }
    }

    private getActivityChartData(fieldName: ActivityDataType, dateType: DateType, intensityDataType?: MeasurementValueDataType): ChartDataset[] {
        let data: number[];
        if (fieldName === ActivityDataTypeEnum.INTENSITY && intensityDataType === undefined) {
            throw new Error('intensityDataType must be provided for intensity');
        }
        switch (dateType) {
            case DateTypeEnum.DAILY:
                data = new Array<number>(24).fill(0);
                console.log('dailyActivities: ' + this.dailyActivities?.toString());
                this.dailyActivities?.map((activity: Activity) => {
                    const hours = activity.measurementInfo.date.toDate().getHours();
                    if (fieldName === ActivityDataTypeEnum.INTENSITY && intensityDataType !== undefined) {
                        switch (intensityDataType) {
                            case MeasurementValueDataTypeEnum.AVERAGE:
                                data[hours] = activity[fieldName][intensityDataType] !== -1 ? activity[fieldName][intensityDataType] : 0;
                                break;
                            case MeasurementValueDataTypeEnum.MAXIMUM:
                                data[hours] = activity[fieldName][intensityDataType] !== Number.MIN_SAFE_INTEGER ? activity[fieldName][intensityDataType] : 0;
                                break;
                            case MeasurementValueDataTypeEnum.MINIMUM:
                                data[hours] = activity[fieldName][intensityDataType] !== Number.MAX_SAFE_INTEGER ? activity[fieldName][intensityDataType] : 0;
                                break;
                            default:
                                throw new Error('Unknown MeasurementValueDateType: ' + intensityDataType);
                        }
                    } else if (fieldName !== ActivityDataTypeEnum.INTENSITY) {
                        data[hours] = activity[fieldName] !== -1 ? activity[fieldName] : 0;
                    } else {
                        throw new Error('intensityDataType must be provided for intensity');
                    }
                });
                break;
            case DateTypeEnum.WEEKLY:
                data = new Array(7).fill(0);
                this.weeklyActivities?.map((activity: Activity) => {
                    const dayOfWeek = activity.measurementInfo.date.toDate().getDay() - 1;
                    if (fieldName === ActivityDataTypeEnum.INTENSITY && intensityDataType !== undefined) {
                        switch (intensityDataType) {
                            case MeasurementValueDataTypeEnum.AVERAGE:
                                data[dayOfWeek === -1 ? 6 : dayOfWeek] = activity[fieldName][intensityDataType] !== -1 ? activity[fieldName][intensityDataType] : 0;
                                break;
                            case MeasurementValueDataTypeEnum.MAXIMUM:
                                data[dayOfWeek === -1 ? 6 : dayOfWeek] = activity[fieldName][intensityDataType] !== Number.MIN_SAFE_INTEGER
                                    ? activity[fieldName][intensityDataType] : 0;
                                break;
                            case MeasurementValueDataTypeEnum.MINIMUM:
                                data[dayOfWeek === -1 ? 6 : dayOfWeek] = activity[fieldName][intensityDataType] !== Number.MAX_SAFE_INTEGER
                                    ? activity[fieldName][intensityDataType] : 0;
                                break;
                            default:
                                throw new Error('Unknown MeasurementValueDateType: ' + intensityDataType);
                        }
                    } else if (fieldName !== ActivityDataTypeEnum.INTENSITY) {
                        data[dayOfWeek === -1 ? 6 : dayOfWeek] = activity[fieldName] !== -1 ? activity[fieldName] : 0;
                    }
                });
                break;
            case DateTypeEnum.MONTHLY:
                const daysInCurrentMonth = getDaysInMonth(new Date());
                data = new Array(daysInCurrentMonth).fill(0);
                this.monthlyActivities?.map((activity: Activity) => {
                    const day = activity.measurementInfo.date.toDate().getDate();
                    if (fieldName === ActivityDataTypeEnum.INTENSITY && intensityDataType !== undefined) {
                        switch (intensityDataType) {
                            case MeasurementValueDataTypeEnum.AVERAGE:
                                data[day] = activity[fieldName][intensityDataType] !== -1 ? activity[fieldName][intensityDataType] : 0;
                                break;
                            case MeasurementValueDataTypeEnum.MAXIMUM:
                                data[day] = activity[fieldName][intensityDataType] !== Number.MIN_SAFE_INTEGER
                                    ? activity[fieldName][intensityDataType] : 0;
                                break;
                            case MeasurementValueDataTypeEnum.MINIMUM:
                                data[day] = activity[fieldName][intensityDataType] !== Number.MAX_SAFE_INTEGER
                                    ? activity[fieldName][intensityDataType] : 0;
                                break;
                            default:
                                throw new Error('Unknown MeasurementValueDateType: ' + intensityDataType);
                        }
                    } else if (fieldName !== ActivityDataTypeEnum.INTENSITY) {
                        data[day] = activity[fieldName] !== -1 ? activity[fieldName] : 0;
                    }
                });
                break;
            case DateTypeEnum.YEARLY:
                data = new Array(12).fill(0);
                let prevMonth;
                let avgCount = 0;
                this.yearlyActivities?.map((activity: Activity, i: number) => {
                    const month = activity.measurementInfo.date.toDate().getMonth();
                    if (prevMonth === undefined) {
                        prevMonth = month;
                        if (fieldName === ActivityDataTypeEnum.INTENSITY && intensityDataType === MeasurementValueDataTypeEnum.MINIMUM) {
                            data[month] = Number.MAX_SAFE_INTEGER;
                        }
                    }

                    if (fieldName === ActivityDataTypeEnum.INTENSITY) {
                        if (intensityDataType !== undefined) {
                            switch (intensityDataType) {
                                case MeasurementValueDataTypeEnum.MINIMUM:
                                    if (month !== prevMonth) {
                                        data[prevMonth] = data[prevMonth] !== Number.MAX_SAFE_INTEGER ? data[prevMonth] : 1;
                                        data[month] = Number.MAX_SAFE_INTEGER;
                                    } else {
                                        if (activity[fieldName][intensityDataType] < data[month]) {
                                            data[month] = activity[fieldName][intensityDataType];
                                        }
                                    }
                                    break;
                                case MeasurementValueDataTypeEnum.MAXIMUM:
                                    if (activity[fieldName][intensityDataType] > data[month]) {
                                        data[month] = activity[fieldName][intensityDataType];
                                    }
                                    break;
                                case MeasurementValueDataTypeEnum.AVERAGE:
                                    if (month !== prevMonth) {
                                        if (avgCount !== 0) {
                                            data[prevMonth] = Math.floor(data[prevMonth] / avgCount);
                                            avgCount = 0;
                                        } else {
                                            data[prevMonth] = 0;
                                        }
                                    } else {
                                        if (activity[fieldName][intensityDataType] !== -1) {
                                            data[month] += activity[fieldName][intensityDataType];
                                            avgCount++;
                                        }
                                    }
                                    break;
                                default:
                                    throw new Error('Unknown MeasurementValueDateType: ' + intensityDataType);
                            }
                        }
                    } else {
                        if (activity[fieldName] !== -1) {
                            data[month] += activity[fieldName];
                        }
                    }

                    if (this.yearlyActivities && i === this.yearlyActivities.length - 1) {
                        if (fieldName === ActivityDataTypeEnum.INTENSITY) {
                            if (intensityDataType === MeasurementValueDataTypeEnum.AVERAGE) {
                                data[month] = avgCount !== 0 ? Math.floor(data[month] / avgCount) : 0;
                            }

                            if (intensityDataType === MeasurementValueDataTypeEnum.MINIMUM) {
                                data[month] = data[month] !== Number.MAX_SAFE_INTEGER ? data[month] : 1;
                            }
                        }
                    } else {
                        prevMonth = month;
                    }
                });
                break;
            default:
                throw new Error(dateType + ' is not used in chart visualization');
        }
        return [
            {
                data,
                backgroundColor: '#ff9500',
                borderColor: '#ff9500'
            }
        ];
    }

    public async loadActivities(event?: any, filterOptions?: IFilterOptions): Promise<void> {
        try {
            this.isLoadingActivities = true;
            let result: PaginateResult<Activity> | undefined;
            if (filterOptions !== undefined) {
                event.disabled = true;
                this.lastPaginateActivityDoc = undefined;
                this.activityItems = [];
                const paginateOptions = {
                    queryOptions: new Array<OrderByQuery | WhereQuery>(),
                    size: this.activityItemsSize,
                    lastDocSnap: this.lastPaginateActivityDoc
                };

                if (filterOptions.measurementType !== 'all') {
                    paginateOptions.queryOptions.push({
                        fieldPath: 'measurementInfo.type',
                        opStr: '==',
                        value: filterOptions.measurementType
                    });
                }

                paginateOptions.queryOptions.push({
                    fieldPath: 'measurementInfo.deviceRef',
                    opStr: '==',
                    value: this.device?.macAddress
                });

                switch (filterOptions.fieldName) {
                    case 'measurementInfo.date':
                        let date: FireTimestamp;
                        if (filterOptions.startDate) {
                            const current = new Date(filterOptions.startDate);
                            if (filterOptions.measurementType === DateTypeEnum.DAILY) {
                                date = FireTimestamp.fromDate(
                                    new Date(Date.UTC(current.getFullYear(), current.getMonth(), current.getDate(), 0, 0, 0, 0))
                                );
                            } else {
                                date = FireTimestamp.fromDate(
                                    new Date(current.getFullYear(), current.getMonth(), current.getDate(), current.getHours(), 0, 0, 0)
                                );
                            }
                            paginateOptions.queryOptions.push({
                                fieldPath: 'measurementInfo.date',
                                opStr: QueryOperator.GREATER_OR_EQUAL,
                                value: date
                            });
                        }

                        if (filterOptions.endDate) {
                            const current = new Date(filterOptions.endDate);
                            if (filterOptions.measurementType === DateTypeEnum.DAILY) {
                                date = FireTimestamp.fromDate(
                                    new Date(Date.UTC(current.getFullYear(), current.getMonth(), current.getDate(), 0, 0, 0, 0))
                                );
                            } else {
                                date = FireTimestamp.fromDate(
                                    new Date(current.getFullYear(), current.getMonth(), current.getDate(), current.getHours(), 0, 0, 0)
                                );
                            }
                            paginateOptions.queryOptions.push({
                                fieldPath: 'measurementInfo.date',
                                opStr: QueryOperator.LESS_OR_EQUAL,
                                value: date
                            });
                        }
                        break;
                    case ActivityDataTypeEnum.DISTANCE || ActivityDataTypeEnum.CALORIES || 'intensity.avg':
                        if (filterOptions.fieldValue === 0) {
                            switch (filterOptions.matchOperator) {
                                case '!=':
                                    paginateOptions.queryOptions.push({
                                        fieldPath: filterOptions.fieldName,
                                        opStr: QueryOperator.NOT_IN,
                                        value: [-1, 0]
                                    });
                                    break;
                                case '==':
                                    paginateOptions.queryOptions.push({
                                        fieldPath: filterOptions.fieldName,
                                        opStr: QueryOperator.IN,
                                        value: [-1, 0]
                                    });
                                    break;
                                case '<=':
                                    paginateOptions.queryOptions.push({
                                        fieldPath: filterOptions.fieldName,
                                        opStr: filterOptions.matchOperator,
                                        value: -1
                                    });
                                    break;
                                case '>=':
                                    paginateOptions.queryOptions.push({
                                        fieldPath: filterOptions.fieldName,
                                        opStr: filterOptions.matchOperator,
                                        value: -1
                                    });
                                    break;
                                default:
                                    paginateOptions.queryOptions.push({
                                        fieldPath: filterOptions.fieldName,
                                        opStr: filterOptions.matchOperator,
                                        value: filterOptions.fieldValue
                                    });
                            }
                        } else {
                            paginateOptions.queryOptions.push({
                                fieldPath: filterOptions.fieldName,
                                opStr: filterOptions.matchOperator,
                                value: filterOptions.fieldValue === -1 ? -2 : filterOptions.fieldValue
                            });
                        }
                        break;
                    case 'intensity.max':
                        if (filterOptions.fieldValue === 0) {
                            switch (filterOptions.matchOperator) {
                                case '!=':
                                    paginateOptions.queryOptions.push({
                                        fieldPath: filterOptions.fieldName,
                                        opStr: QueryOperator.NOT_IN,
                                        value: [Number.MIN_SAFE_INTEGER, 0]
                                    });
                                    break;
                                case '==':
                                    paginateOptions.queryOptions.push({
                                        fieldPath: filterOptions.fieldName,
                                        opStr: QueryOperator.IN,
                                        value: [Number.MIN_SAFE_INTEGER, 0]
                                    });
                                    break;
                                case '<=':
                                    paginateOptions.queryOptions.push({
                                        fieldPath: filterOptions.fieldName,
                                        opStr: filterOptions.matchOperator,
                                        value: Number.MIN_SAFE_INTEGER
                                    });
                                    break;
                                case '>=':
                                    paginateOptions.queryOptions.push({
                                        fieldPath: filterOptions.fieldName,
                                        opStr: filterOptions.matchOperator,
                                        value: Number.MIN_SAFE_INTEGER
                                    });
                                    break;
                                default:
                                    paginateOptions.queryOptions.push({
                                        fieldPath: filterOptions.fieldName,
                                        opStr: filterOptions.matchOperator,
                                        value: filterOptions.fieldValue
                                    });
                            }
                        } else {
                            paginateOptions.queryOptions.push({
                                fieldPath: filterOptions.fieldName,
                                opStr: filterOptions.matchOperator,
                                value: filterOptions.fieldValue === Number.MIN_SAFE_INTEGER ? -2 : filterOptions.fieldValue
                            });
                        }
                        break;
                    case 'intensity.min':
                        if (filterOptions.fieldValue === 0) {
                            switch (filterOptions.matchOperator) {
                                case '!=':
                                    paginateOptions.queryOptions.push({
                                        fieldPath: filterOptions.fieldName,
                                        opStr: QueryOperator.NOT_IN,
                                        value: [Number.MAX_SAFE_INTEGER, 0]
                                    });
                                    break;
                                case '==':
                                    paginateOptions.queryOptions.push({
                                        fieldPath: filterOptions.fieldName,
                                        opStr: QueryOperator.IN,
                                        value: [Number.MAX_SAFE_INTEGER, 0]
                                    });
                                    break;
                                case '<=':
                                    paginateOptions.queryOptions.push({
                                        fieldPath: filterOptions.fieldName,
                                        opStr: filterOptions.matchOperator,
                                        value: Number.MAX_SAFE_INTEGER
                                    });
                                    break;
                                case '>=':
                                    paginateOptions.queryOptions.push({
                                        fieldPath: filterOptions.fieldName,
                                        opStr: filterOptions.matchOperator,
                                        value: Number.MAX_SAFE_INTEGER
                                    });
                                    break;
                                default:
                                    paginateOptions.queryOptions.push({
                                        fieldPath: filterOptions.fieldName,
                                        opStr: filterOptions.matchOperator,
                                        value: filterOptions.fieldValue
                                    });
                            }
                        } else {
                            paginateOptions.queryOptions.push({
                                fieldPath: filterOptions.fieldName,
                                opStr: filterOptions.matchOperator,
                                value: filterOptions.fieldValue
                            });
                        }
                        break;
                    default:
                        paginateOptions.queryOptions.push({
                            fieldPath: filterOptions.fieldName,
                            opStr: filterOptions.matchOperator,
                            value: filterOptions.fieldValue === Number.MAX_SAFE_INTEGER ? -2 : filterOptions.fieldValue
                        });
                }

                if ((filterOptions.matchOperator !== '==' && filterOptions.matchOperator !== '!=')
                    || filterOptions.fieldName === 'measurementInfo.date'
                ) {
                    paginateOptions.queryOptions.push({
                        fieldPath: filterOptions.fieldName,
                        directionStr: filterOptions.orderDirection
                    });
                }

                result = await this.activityService.paginate(paginateOptions);
                this.lastPaginateQueryOptions = paginateOptions.queryOptions;
                this.activityItems = result?.items ?? [];
            } else {
                if (this.lastPaginateActivityDoc !== undefined) {
                    result = await this.activityService.paginate({
                        queryOptions: this.lastPaginateQueryOptions ?? [],
                        size: this.activityItemsSize,
                        lastDocSnap: this.lastPaginateActivityDoc
                    });

                    if (this.activityItems === undefined) {
                        this.activityItems = [];
                    }

                    if (result !== undefined) {
                        this.activityItems.push(...result.items);
                    }
                }
            }
            this.lastPaginateActivityDoc = result?.lastDocSnap;
        } catch (e: unknown) {
            this.logHelper.logError(this.loadActivities.name, 'paginate error', { value: e });
        } finally {
            if (filterOptions !== undefined && event && 'disabled' in event) {
                event.disabled = false;
            } else {
                if (event && 'target' in event) {
                    event.target.complete();
                }
            }
            this.isLoadingActivities = false;
        }
    }

    public ngOnDestroy(): void {
        this.dailyActivitiesSubscription?.unsubscribe();
        this.weeklyActivitiesSubscription?.unsubscribe();
        this.monthlyActivitiesSubscription?.unsubscribe();
        this.yearlyActivitiesSubscription?.unsubscribe();
        this.activityDataInitializedStatusSubscription?.unsubscribe();
        this.connectionInfoSubscription?.unsubscribe();
    }
}
