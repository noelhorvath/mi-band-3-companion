import { Component, OnDestroy, OnInit } from '@angular/core';
import { LogHelper } from '../../../../shared/models/classes/LogHelper';
import { ChartDataset } from 'chart.js';
import { DateType, MeasurementValueDataType } from '../../../../shared/types/custom.types';
import { DateTypeEnum, IntervalTypeEnum } from '../../../../shared/enums/date.enum';
import { getDaysInMonth, getInterval, isLeapYear } from '../../../../shared/functions/date.functions';
import { FirestoreHeartRateService } from '../../../../services/firestore/heart-rate/firestore-heart-rate.service';
import { StorageService } from '../../../../services/storage/storage.service';
import { HeartRate } from '../../../../shared/models/classes/HeartRate';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { MeasurementValueDataTypeEnum } from '../../../../shared/enums/measurement-value-data-type.enum';
import { IChartDataStatus } from '../../../../shared/models/interfaces/IChartDataStatus';
import { DocumentSnapshot } from '@angular/fire/firestore';
import { OrderByQuery, PaginateResult, WhereQuery } from '../../../../shared/types/firestore.types';
import { Device } from '../../../../shared/models/classes/Device';
import { IFilterOptions } from '../../../../shared/models/interfaces/IFilterOptions';
import { FireTimestamp } from '../../../../shared/models/classes/FireTimestamp';
import { QueryOperator } from '../../../../shared/enums/firestore.enum';
import { BleConnectionService } from '../../../../services/ble/connection/ble-connection.service';

@Component({
    selector: 'app-heart-rate',
    templateUrl: './heart-rate.component.html',
    styleUrls: ['./heart-rate.component.scss'],
})
export class HeartRateComponent implements OnInit, OnDestroy {
    private readonly logHelper: LogHelper;
    public readonly HEART_RATE_DATA_TYPES: MeasurementValueDataType[] = [MeasurementValueDataTypeEnum.AVERAGE, MeasurementValueDataTypeEnum.MINIMUM, MeasurementValueDataTypeEnum.MAXIMUM];
    public readonly FILTER_FIELDS: { fieldName: string; text: string }[];
    public readonly MEASUREMENT_TYPES: (DateTypeEnum.DAILY | DateTypeEnum.HOURLY | DateTypeEnum.WEEKLY | DateTypeEnum.MONTHLY | 'all')[];
    private dailyHeartRatesSubscription: Subscription | undefined;
    private weeklyHeartRatesSubscription: Subscription | undefined;
    private monthlyHeartRatesSubscription: Subscription | undefined;
    private yearlyHeartRatesSubscription: Subscription | undefined;
    private heartRateDataInitializedStatusSubscription: Subscription | undefined;
    private connectionInfoSubscription: Subscription | undefined;
    private heartRateDataInitializedStatusSubject: Subject<IChartDataStatus>;
    private heartRateDataInitializedStatus: IChartDataStatus;
    private dailyHeartRates: HeartRate[] | undefined;
    private weeklyHeartRates: HeartRate[] | undefined;
    private monthlyHeartRates: HeartRate[] | undefined;
    private yearlyHeartRates: HeartRate[] | undefined;
    private lastPaginateHeartRateDoc: DocumentSnapshot<HeartRate> | undefined;
    private lastPaginateQueryOptions: (OrderByQuery | WhereQuery)[] | undefined;
    public isLoadingHeartRates: boolean;
    public device: Device | undefined;
    public heartRateItemsSize: number;
    public heartRateItems: HeartRate[] | undefined;
    public heartRateDataType: MeasurementValueDataType | undefined;
    public heartRateChartDateType: DateType | undefined;
    public heartRateChartData: ChartDataset[] | undefined;

    public constructor(
        private storageService: StorageService,
        private heartRateService: FirestoreHeartRateService,
        private bleConnectionService: BleConnectionService
    ) {
        this.logHelper = new LogHelper(HeartRateComponent.name);
        this.isLoadingHeartRates = false;
        this.heartRateItemsSize = 10;
        this.heartRateDataInitializedStatus = { isDaily: false, isWeekly: false, isMonthly: false, isYearly: false };
        this.heartRateDataInitializedStatusSubject = new BehaviorSubject<{ isDaily: boolean; isWeekly: boolean; isMonthly: boolean; isYearly: boolean }>(
            { isDaily: false, isWeekly: false, isMonthly: false, isYearly: false }
        );
        this.FILTER_FIELDS = [
            { fieldName: 'measurementInfo.date', text: 'date' },
            { fieldName: 'bpm.avg', text: MeasurementValueDataTypeEnum.AVERAGE },
            { fieldName: 'bpm.max', text: MeasurementValueDataTypeEnum.MAXIMUM },
            { fieldName: 'bpm.min', text: MeasurementValueDataTypeEnum.MINIMUM },
        ];
        this.MEASUREMENT_TYPES = ['all', DateTypeEnum.HOURLY, DateTypeEnum.DAILY];
        this.connectionInfoSubscription = this.bleConnectionService.deviceSettingsSubject.subscribe((device: Device) => {
            this.device = device;
            this.heartRateDataInitializedStatus = { isDaily: false, isWeekly: false, isMonthly: false, isYearly: false };
            this.heartRateDataInitializedStatusSubject = new BehaviorSubject<{ isDaily: boolean; isWeekly: boolean; isMonthly: boolean; isYearly: boolean }>(
                { isDaily: false, isWeekly: false, isMonthly: false, isYearly: false }
            );
            this.heartRateDataInitializedStatusSubscription = this.heartRateDataInitializedStatusSubject
                .subscribe((initStatus: IChartDataStatus) => {
                        if (initStatus.isDaily !== this.heartRateDataInitializedStatus.isDaily
                            || initStatus.isWeekly !== this.heartRateDataInitializedStatus.isWeekly
                            || initStatus.isMonthly !== this.heartRateDataInitializedStatus.isMonthly
                            || initStatus.isYearly !== this.heartRateDataInitializedStatus.isYearly
                        ) {
                            this.heartRateDataInitializedStatus = initStatus;
                        }
                    }
                );
            let interval = getInterval(IntervalTypeEnum.TODAY);
            try {
                this.dailyHeartRatesSubscription = this.heartRateService.listWithValueChanges([
                    { fieldPath: 'measurementInfo.date', opStr: '>=', value: interval.start },
                    { fieldPath: 'measurementInfo.date', opStr: '<=', value: interval.end },
                    { fieldPath: 'measurementInfo.type', opStr: '==', value: DateTypeEnum.HOURLY },
                    { fieldPath: 'measurementInfo.deviceRef', opStr: '==', value: this.device?.macAddress },
                    { fieldPath: 'measurementInfo.date', directionStr: 'asc' },
                    { limit: 24 }
                ]).subscribe((heartRates: HeartRate[] | undefined) => {
                    this.dailyHeartRates = heartRates ?? [];
                    if (!this.heartRateDataInitializedStatus.isDaily && this.dailyHeartRates instanceof Array) {
                        this.heartRateDataInitializedStatus.isDaily = true;
                        this.heartRateDataInitializedStatusSubject.next(this.heartRateDataInitializedStatus);
                    }
                });
            } catch (e: unknown) {
                this.logHelper.logError(this.heartRateService.listWithValueChanges.name, 'list HeartRates error', { value: e });
                this.dailyHeartRates = undefined;
            }

            interval = getInterval(IntervalTypeEnum.THIS_WEEK);
            try {
                this.weeklyHeartRatesSubscription = this.heartRateService.listWithValueChanges([
                    { fieldPath: 'measurementInfo.date', opStr: '>=', value: interval.start },
                    { fieldPath: 'measurementInfo.date', opStr: '<=', value: interval.end },
                    { fieldPath: 'measurementInfo.type', opStr: '==', value: DateTypeEnum.DAILY },
                    { fieldPath: 'measurementInfo.deviceRef', opStr: '==', value: this.device?.macAddress },
                    { fieldPath: 'measurementInfo.date', directionStr: 'asc' },
                    { limit: 7 }
                ]).subscribe((heartRates: HeartRate[] | undefined) => {
                    this.weeklyHeartRates = heartRates ?? [];
                    if (!this.heartRateDataInitializedStatus.isWeekly && this.weeklyHeartRates instanceof Array) {
                        this.heartRateDataInitializedStatus.isWeekly = true;
                        this.heartRateDataInitializedStatusSubject.next(this.heartRateDataInitializedStatus);
                    }
                });
            } catch (e: unknown) {
                this.logHelper.logError(this.heartRateService.listWithValueChanges.name, 'list HeartRates error', { value: e });
                this.weeklyHeartRates = undefined;
            }

            interval = getInterval(IntervalTypeEnum.THIS_MONTH);
            try {
                this.monthlyHeartRatesSubscription = this.heartRateService.listWithValueChanges([
                    { fieldPath: 'measurementInfo.date', opStr: '>=', value: interval.start },
                    { fieldPath: 'measurementInfo.date', opStr: '<=', value: interval.end },
                    { fieldPath: 'measurementInfo.type', opStr: '==', value: DateTypeEnum.DAILY },
                    { fieldPath: 'measurementInfo.deviceRef', opStr: '==', value: this.device?.macAddress },
                    { fieldPath: 'measurementInfo.date', directionStr: 'asc' },
                    { limit: getDaysInMonth(new Date()) }
                ]).subscribe((heartRates: HeartRate[] | undefined) => {
                    this.monthlyHeartRates = heartRates ?? [];
                    if (!this.heartRateDataInitializedStatus.isMonthly && this.monthlyHeartRates instanceof Array) {
                        this.heartRateDataInitializedStatus.isMonthly = true;
                        this.heartRateDataInitializedStatusSubject.next(this.heartRateDataInitializedStatus);
                    }
                });
            } catch (e: unknown) {
                this.logHelper.logError(this.heartRateService.listWithValueChanges.name, 'list HeartRates error', { value: e });
                this.monthlyHeartRates = undefined;
            }

            interval = getInterval(IntervalTypeEnum.THIS_YEAR);
            try {
                this.yearlyHeartRatesSubscription = this.heartRateService.listWithValueChanges([
                    { fieldPath: 'measurementInfo.date', opStr: '>=', value: interval.start },
                    { fieldPath: 'measurementInfo.date', opStr: '<=', value: interval.end },
                    { fieldPath: 'measurementInfo.type', opStr: '==', value: DateTypeEnum.DAILY },
                    { fieldPath: 'measurementInfo.deviceRef', opStr: '==', value: this.device?.macAddress },
                    { fieldPath: 'measurementInfo.date', directionStr: 'asc' },
                    { limit: isLeapYear(new Date()) ? 366 : 365 }
                ]).subscribe((heartRates: HeartRate[] | undefined) => {
                    this.yearlyHeartRates = heartRates ?? [];
                    if (!this.heartRateDataInitializedStatus.isYearly && this.yearlyHeartRates instanceof Array) {
                        this.heartRateDataInitializedStatus.isYearly = true;
                        this.heartRateDataInitializedStatusSubject.next(this.heartRateDataInitializedStatus);
                    }
                });
            } catch (e: unknown) {
                this.logHelper.logError(this.heartRateService.listWithValueChanges.name, 'list HeartRates error', { value: e });
                this.yearlyHeartRates = undefined;
            }
        });
    }

    private async initChart(): Promise<void> {
        try {
            const savedHeartRateDataType = await this.storageService.getHeartRateDataType();
            this.logHelper.logDefault(this.ngOnInit.name, 'saved HeartRateDataType', { value: savedHeartRateDataType });
            this.heartRateDataType = savedHeartRateDataType ?? MeasurementValueDataTypeEnum.AVERAGE;
            const savedChartDateType = await this.storageService.getHeartRateChartDateType();
            this.logHelper.logDefault(this.ngOnInit.name, 'saved chart DateType', { value: savedChartDateType });
            this.heartRateChartDateType = savedChartDateType ?? DateTypeEnum.DAILY;
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
            if (this.heartRateChartDateType !== undefined && this.heartRateDataType !== undefined) {
                const prevHeartRateDataType = await this.storageService.getHeartRateDataType();
                const prevDateType = this.heartRateChartDateType;

                if (this.heartRateChartDateType !== dateType && dateType !== undefined) {
                    this.heartRateChartDateType = dateType;
                    await this.storageService.setHeartRateChartDateType(this.heartRateChartDateType);
                }

                if (this.heartRateDataType !== prevHeartRateDataType) {
                    await this.storageService.setHeartRateDataType(this.heartRateDataType);
                }

                if (this.heartRateDataType !== prevHeartRateDataType || this.heartRateChartDateType !== prevDateType
                    || this.heartRateChartData === undefined
                ) {
                    this.logHelper.logDefault(this.onChartTypeChanged.name, 'data type changed', { value: this.heartRateChartData });
                    switch (dateType ?? this.heartRateChartDateType) {
                        case DateTypeEnum.DAILY:
                            if (this.dailyHeartRates === undefined) {
                                const sub = this.heartRateDataInitializedStatusSubject.subscribe((status: IChartDataStatus) => {
                                    if (status.isDaily.valueOf()) {
                                        this.logHelper.logDefault(this.onChartTypeChanged.name, 'dailyHeartRates is initialized');
                                        this.onChartTypeChanged(DateTypeEnum.DAILY);
                                        sub?.unsubscribe();
                                    }
                                });
                                return;
                            }
                            break;
                        case DateTypeEnum.WEEKLY:
                            if (this.weeklyHeartRates === undefined) {
                                const sub = this.heartRateDataInitializedStatusSubject.subscribe((status: IChartDataStatus) => {
                                    if (status.isWeekly.valueOf()) {
                                        this.logHelper.logDefault(this.onChartTypeChanged.name, 'weeklyHeartRates is initialized');
                                        this.onChartTypeChanged(DateTypeEnum.WEEKLY);
                                        sub?.unsubscribe();
                                    }
                                });
                                return;
                            }
                            break;
                        case DateTypeEnum.MONTHLY:
                            if (this.monthlyHeartRates === undefined) {
                                const sub = this.heartRateDataInitializedStatusSubject.subscribe((status: IChartDataStatus) => {
                                    if (status.isMonthly.valueOf()) {
                                        this.logHelper.logDefault(this.onChartTypeChanged.name, 'monthlyHeartRates is initialized');
                                        this.onChartTypeChanged(DateTypeEnum.MONTHLY);
                                        sub?.unsubscribe();
                                    }
                                });
                                return;
                            }
                            break;
                        case DateTypeEnum.YEARLY:
                            if (this.yearlyHeartRates === undefined) {
                                const sub = this.heartRateDataInitializedStatusSubject.subscribe((status: IChartDataStatus) => {
                                    if (status.isYearly.valueOf()) {
                                        this.logHelper.logDefault(this.onChartTypeChanged.name, 'yearlyHeartRates is initialized');
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
                    this.heartRateChartData = this.getHeartRateChartData(this.heartRateDataType, this.heartRateChartDateType);
                } else {
                    this.logHelper.logDefault(this.onChartTypeChanged.name, 'data type is same', { value: this.heartRateDataType });
                }
            }
        } catch (e: unknown) {
            this.logHelper.logError(this.onChartTypeChanged.name, 'error', { value: e });
        }
    }

    private getHeartRateChartData(fieldName: MeasurementValueDataType, dateType: DateType): ChartDataset[] {
        let data: number[];
        switch (dateType) {
            case DateTypeEnum.DAILY:
                data = new Array<number>(24).fill(0);
                this.dailyHeartRates?.map((heartRate: HeartRate) => {
                    const hours = heartRate.measurementInfo.date.toDate().getHours();
                    switch (fieldName) {
                        case MeasurementValueDataTypeEnum.AVERAGE:
                            data[hours] = heartRate.bpm[fieldName] !== -1 ? heartRate.bpm[fieldName] : 0;
                            break;
                        case MeasurementValueDataTypeEnum.MAXIMUM:
                            data[hours] = heartRate.bpm[fieldName] !== Number.MIN_SAFE_INTEGER ? heartRate.bpm[fieldName] : 0;
                            break;
                        case MeasurementValueDataTypeEnum.MINIMUM:
                            data[hours] = heartRate.bpm[fieldName] !== Number.MAX_SAFE_INTEGER ? heartRate.bpm[fieldName] : 0;
                            break;
                        default:
                            throw new Error('Unknown MeasurementValueDateType: ' + fieldName);
                    }
                });
                break;
            case DateTypeEnum.WEEKLY:
                data = new Array(7).fill(0);
                this.weeklyHeartRates?.map((heartRate: HeartRate) => {
                    const dayOfWeek = heartRate.measurementInfo.date.toDate().getDay() - 1;
                    switch (fieldName) {
                        case MeasurementValueDataTypeEnum.AVERAGE:
                            data[dayOfWeek === -1 ? 6 : dayOfWeek] = heartRate.bpm[fieldName] !== -1
                                ? heartRate.bpm[fieldName] : 0;
                            break;
                        case MeasurementValueDataTypeEnum.MAXIMUM:
                            data[dayOfWeek === -1 ? 6 : dayOfWeek] = heartRate.bpm[fieldName] !== Number.MIN_SAFE_INTEGER
                                ? heartRate.bpm[fieldName] : 0;
                            break;
                        case MeasurementValueDataTypeEnum.MINIMUM:
                            data[dayOfWeek === -1 ? 6 : dayOfWeek] = heartRate.bpm[fieldName] !== Number.MAX_SAFE_INTEGER
                                ? heartRate.bpm[fieldName] : 0;
                            break;
                        default:
                            throw new Error('Unknown MeasurementValueDateType: ' + fieldName);
                    }
                });
                break;
            case DateTypeEnum.MONTHLY:
                const daysInCurrentMonth = getDaysInMonth(new Date());
                data = new Array(daysInCurrentMonth).fill(0);
                this.monthlyHeartRates?.map((heartRate: HeartRate) => {
                    const day = heartRate.measurementInfo.date.toDate().getDate();
                    switch (fieldName) {
                        case MeasurementValueDataTypeEnum.AVERAGE:
                            data[day] = heartRate.bpm[fieldName] !== -1 ? heartRate.bpm[fieldName] : 0;
                            break;
                        case MeasurementValueDataTypeEnum.MAXIMUM:
                            data[day] = heartRate.bpm[fieldName] !== Number.MIN_SAFE_INTEGER
                                ? heartRate.bpm[fieldName] : 0;
                            break;
                        case MeasurementValueDataTypeEnum.MINIMUM:
                            data[day] = heartRate.bpm[fieldName] !== Number.MAX_SAFE_INTEGER
                                ? heartRate.bpm[fieldName] : 0;
                            break;
                        default:
                            throw new Error('Unknown MeasurementValueDateType: ' + fieldName);
                    }
                });
                break;
            case DateTypeEnum.YEARLY:
                data = new Array(12).fill(0);
                let prevMonth;
                let avgHeartRateCount = 0;
                this.yearlyHeartRates?.map((heartRate: HeartRate, i: number) => {
                    const month = heartRate.measurementInfo.date.toDate().getMonth();
                    if (prevMonth === undefined) {
                        prevMonth = month;
                        if (fieldName === MeasurementValueDataTypeEnum.MINIMUM) {
                            data[month] = Number.MAX_SAFE_INTEGER;
                        }
                    }

                    switch (fieldName) {
                        case MeasurementValueDataTypeEnum.MINIMUM:
                            if (month !== prevMonth) {
                                data[prevMonth] = data[prevMonth] !== Number.MAX_SAFE_INTEGER ? data[prevMonth] : 0;
                                data[month] = Number.MAX_SAFE_INTEGER;
                            } else {
                                if (heartRate.bpm[fieldName] < data[month]) {
                                    data[month] = heartRate.bpm[fieldName];
                                }
                            }
                            break;
                        case MeasurementValueDataTypeEnum.MAXIMUM:
                            if (heartRate.bpm[fieldName] > data[month]) {
                                data[month] = heartRate.bpm[fieldName];
                            }
                            break;
                        case MeasurementValueDataTypeEnum.AVERAGE:
                            if (month !== prevMonth) {
                                if (avgHeartRateCount !== 0) {
                                    data[prevMonth] = Math.floor(data[prevMonth] / avgHeartRateCount);
                                    avgHeartRateCount = 0;
                                } else {
                                    data[prevMonth] = 0;
                                }
                            } else {
                                if (heartRate.bpm[fieldName] !== -1) {
                                    data[month] += heartRate.bpm[fieldName];
                                    avgHeartRateCount++;
                                }
                            }
                            break;
                        default:
                            throw new Error('Unknown MeasurementValueDateType: ' + fieldName);
                    }

                    if (this.yearlyHeartRates && i === this.yearlyHeartRates.length - 1) {
                        if (fieldName === MeasurementValueDataTypeEnum.AVERAGE) {
                            data[month] = avgHeartRateCount !== 0 ? Math.floor(data[month] / avgHeartRateCount) : 0;
                        }

                        if (fieldName === MeasurementValueDataTypeEnum.MINIMUM) {
                            data[month] = data[month] !== Number.MAX_SAFE_INTEGER ? data[month] : 0;
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
                backgroundColor: '#ff9500'
            }
        ];
    }

    public async loadHeartRates(event?: any, filterOptions?: IFilterOptions): Promise<void> {
        try {
            this.isLoadingHeartRates = true;
            let result: PaginateResult<HeartRate> | undefined;
            if (filterOptions !== undefined) {
                event.disabled = true;
                this.lastPaginateHeartRateDoc = undefined;
                this.heartRateItems = [];
                const paginateOptions = {
                    queryOptions: new Array<OrderByQuery | WhereQuery>(),
                    size: this.heartRateItemsSize,
                    lastDocSnap: this.lastPaginateHeartRateDoc
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
                    case 'bpm.avg':
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
                    case 'bpm.max':
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
                    case 'bpm.min':
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

                result = await this.heartRateService.paginate(paginateOptions);
                this.lastPaginateQueryOptions = paginateOptions.queryOptions;
                this.heartRateItems = result?.items ?? [];
            } else {
                if (this.lastPaginateHeartRateDoc !== undefined) {
                    result = await this.heartRateService.paginate({
                        queryOptions: this.lastPaginateQueryOptions ?? [],
                        size: this.heartRateItemsSize,
                        lastDocSnap: this.lastPaginateHeartRateDoc
                    });

                    if (this.heartRateItems === undefined) {
                        this.heartRateItems = [];
                    }

                    if (result !== undefined) {
                        this.heartRateItems.push(...result.items);
                    }
                }
            }
            this.lastPaginateHeartRateDoc = result?.lastDocSnap;
        } catch (e: unknown) {
            this.logHelper.logError(this.loadHeartRates.name, 'paginate error', { value: e });
        } finally {
            if (filterOptions !== undefined && event && 'disabled' in event) {
                event.disabled = false;
            } else {
                if (event && 'target' in event) {
                    event.target.complete();
                }
            }
            this.isLoadingHeartRates = false;
        }
    }

    public ngOnDestroy(): void {
        this.dailyHeartRatesSubscription?.unsubscribe();
        this.weeklyHeartRatesSubscription?.unsubscribe();
        this.monthlyHeartRatesSubscription?.unsubscribe();
        this.yearlyHeartRatesSubscription?.unsubscribe();
        this.heartRateDataInitializedStatusSubscription?.unsubscribe();
        this.connectionInfoSubscription?.unsubscribe();
    }
}
