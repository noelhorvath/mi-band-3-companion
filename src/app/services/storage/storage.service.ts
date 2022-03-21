import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { BehaviorSubject } from 'rxjs';
import { LogHelper } from '../../shared/models/classes/LogHelper';
import { ActivityDataType, DateType } from '../../shared/types/custom.types';

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

    public async getLanguage(): Promise<string | undefined> {
        try {
            const data = await this.storage.get('lang');
            return data !== null ? data : undefined;
        } catch (e: unknown) {
            return Promise.reject(e);
        }

    }

    public async setActivityChartDateType(dateType: DateType): Promise<void> {
        return this.storage.set('activityChartDateType', dateType);
    }

    public async getActivityChartDateType(): Promise<DateType | undefined> {
        try {
            const data = await this.storage.get('activityChartDateType');
            return data !== null ? data : undefined;
        } catch (e: unknown) {
            return Promise.reject(e);
        }
    }

    public async setActivityDataType(dateType: ActivityDataType): Promise<void> {
        return this.storage.set('activityDataType', dateType);
    }

    public async getActivityDataType(): Promise<ActivityDataType | undefined> {
        try {
            const data = await this.storage.get('activityDataType');
            return data !== null ? data : undefined;
        } catch (e: unknown) {
            return Promise.reject(e);
        }
    }

    public async setHeartRateChartDateType(dateType: DateType): Promise<void> {
        return this.storage.set('heartRateChartDateType', dateType);
    }

    public async getHeartRateChartDateType(): Promise<DateType | undefined> {
        try {
            const data = await this.storage.get('heartRateChartDateType');
            return data !== null ? data : undefined;
        } catch (e: unknown) {
            return Promise.reject(e);
        }
    }

    public async setTrainingChartDateType(dateType: DateType): Promise<void> {
        return this.storage.set('trainingChartDateType', dateType);
    }

    public async getTrainingChartDateType(): Promise<DateType | undefined> {
        try {
            const data = await this.storage.get('trainingChartDateType');
            return data !== null ? data : undefined;
        } catch (e: unknown) {
            return Promise.reject(e);
        }
    }

}
