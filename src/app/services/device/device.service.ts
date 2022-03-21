import { Injectable } from '@angular/core';
import { LogHelper } from '../../shared/models/classes/LogHelper';
import { Device } from '@capacitor/device';
import { DevicePlatform } from '../../shared/types/custom.types';

@Injectable({
    providedIn: 'root'
})
export class DeviceService {
    private readonly logHelper: LogHelper;

    public constructor() {
        this.logHelper = new LogHelper(DeviceService.name);
    }

    private static getOSMainVersionFromString(version: string): number {
        if (!isNaN(Number(version))) {
            return Number(version);
        } else {
            if (version.includes('.')) {
                const versionSplit = version.split('.');
                let result = '';
                for (let i = 0; i < versionSplit.length; i++) {
                    if (!isNaN(Number(version[i]))) {
                        result += version[i] + '.';
                    } else {
                        if (result.endsWith('.')) {
                            result.substring(0, result.length - 2);
                        }
                        return result.length === 0 ? -1 : Number(result);
                    }
                }
            } else {
                let result = '';
                for (const char of version) {
                    if (!isNaN(Number(char))) {
                        result += char;
                    } else {
                        return result.length === 0 ? -1 : Number(result);
                    }
                }
            }
        }
        return -1;
    }

    public async getOSMainVersion(): Promise<number> {
        try {
            return Promise.resolve(DeviceService.getOSMainVersionFromString((await Device.getInfo()).osVersion));
        } catch (e: unknown) {
            this.logHelper.logError(this.getOSMainVersion.name, e);
        }
        return Promise.resolve(-2);
    }

    public async getPlatform(): Promise<DevicePlatform> {
        try {
            return Promise.resolve((await Device.getInfo()).platform);
        } catch (e: unknown) {
            this.logHelper.logError(this.getOSMainVersion.name, e);
        }
        return Promise.resolve('unknown');
    }

    public async getUUID(): Promise<string> {
        try {
            return Promise.resolve((await Device.getId()).uuid);
        } catch (e: unknown) {
            this.logHelper.logError(this.getUUID.name, e);
            return Promise.reject(e);
        }
    }
}
