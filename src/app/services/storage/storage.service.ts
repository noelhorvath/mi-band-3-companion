import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { BehaviorSubject } from 'rxjs';
import { LogHelper } from '../../shared/models/classes/LogHelper';
import { ActivityDataType, DateType, MeasurementValueDataType } from '../../shared/types/custom.types';

@Injectable({
    providedIn: 'root'
})
export class StorageService {
    private readonly logHelper: LogHelper;
    public isStorageServiceInitializedSubject: BehaviorSubject<boolean>;

    public constructor(private storage: Storage) {
        this.logHelper = new LogHelper(StorageService.name);
        this.isStorageServiceInitializedSubject = new BehaviorSubject<boolean>(false);
        this.initStorage().then(() => {
            this.isStorageServiceInitializedSubject.next(true);
            this.logHelper.logDefault(this.initStorage.name, 'Storage has been initialized!');
        }).catch(error => {
            this.logHelper.logError(this.initStorage.name, error);
        });
    }

    private async initStorage(): Promise<Storage> {
        return this.storage.create();
    }

    public async setLanguage(lang: string): Promise<void> {
        return this.storage.set('lang', lang);
    }

    private async getData<T>(key: string): Promise<T | undefined> {
        try {
            const data = await this.storage.get(key);
            return data !== null ? data : undefined;
        } catch (e: unknown) {
            return Promise.reject(e);
        }
    }

    public async getLanguage(): Promise<string | undefined> {
        return this.getData('lang');
    }

    public async setActivityChartDateType(dateType: DateType): Promise<void> {
        return this.storage.set('activityChartDateType', dateType);
    }

    public async getActivityChartDateType(): Promise<DateType | undefined> {
        return this.getData('activityChartDateType');
    }

    public async setActivityDataType(dateType: ActivityDataType): Promise<void> {
        return this.storage.set('activityDataType', dateType);
    }

    public async getActivityDataType(): Promise<ActivityDataType | undefined> {
        return this.getData('activityDataType');
    }

    public async setHeartRateChartDateType(dateType: DateType): Promise<void> {
        return this.storage.set('heartRateChartDateType', dateType);
    }

    public async getHeartRateChartDateType(): Promise<DateType | undefined> {
        return this.getData('heartRateChartDateType');
    }

    public async setHeartRateDataType(dateType: MeasurementValueDataType): Promise<void> {
        return this.storage.set('heartRateDataType', dateType);
    }

    public async getHeartRateDataType(): Promise<MeasurementValueDataType | undefined> {
        return this.getData('heartRateDataType');
    }

    public async setActivityMeasurementValueDataType(dateType: MeasurementValueDataType): Promise<void> {
        return this.storage.set('activityMeasurementValueDataType', dateType);
    }

    public async getActivityMeasurementValueDataType(): Promise<MeasurementValueDataType | undefined> {
        return this.getData('activityMeasurementValueDataType');
    }
}
