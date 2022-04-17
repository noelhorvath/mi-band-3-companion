import { Injectable } from '@angular/core';
import { BluetoothLE, OperationResult, UnsubscribeResult } from '@ionic-native/bluetooth-le/ngx';
import { IDevice } from '../../../shared/models/interfaces/IDevice';
import { Service } from '../../../shared/models/classes/Service';
import { Characteristic } from '../../../shared/models/classes/Characteristic';
import { Buffer } from 'buffer';
import { BLEProperty } from '../../../shared/enums/ble.enum';
import { MiBand3 } from '../../../shared/models/classes/MiBand3';
import { IFireTimestamp } from '../../../shared/models/interfaces/IFireTimestamp';
import { FireTimestamp } from '../../../shared/models/classes/FireTimestamp';
import { instantiate } from '../../../shared/functions/parser.functions';
import { Observer } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export abstract class BleBaseService {
    protected readonly miBand3: MiBand3;

    protected constructor(protected readonly ble: BluetoothLE) {
        this.miBand3 = MiBand3.getInstance();
    }

    protected async write(
        deviceData: string | IDevice,
        service: string | Service,
        characteristic: string | Characteristic,
        value: Buffer | Uint8Array,
        type?: string
    ): Promise<OperationResult> {
        const serviceInstance = typeof service === 'string' ? this.miBand3.getServiceByUUID(service) : service;
        const characteristicInstance = typeof characteristic === 'string' ? serviceInstance?.getCharacteristicByUUID(characteristic) : characteristic;
        if (serviceInstance === undefined) {
            throw new Error('Failed to get service');
        } else if (characteristicInstance === undefined) {
            throw new Error('Failed to get characteristic');
        }

        return this.ble.write({
            address: typeof deviceData === 'string' ? deviceData : deviceData.macAddress,
            service: serviceInstance.uuid,
            characteristic: characteristicInstance.uuid,
            value: this.ble.bytesToEncodedString(value),
            type: type !== undefined ? type : characteristicInstance.hasProperty(BLEProperty.WRITE_WITHOUT_RESPONSE) ? 'noResponse' : ''
        });
    }

    protected async read(deviceData: string | IDevice, service: string | Service, characteristic: string | Characteristic): Promise<OperationResult> {
        const serviceInstance = typeof service === 'string' ? this.miBand3.getServiceByUUID(service) : service;
        const characteristicInstance = typeof characteristic === 'string' ? serviceInstance?.getCharacteristicByUUID(characteristic) : characteristic;
        if (serviceInstance === undefined) {
            throw new Error('Failed to get service');
        } else if (characteristicInstance === undefined) {
            throw new Error('Failed to get characteristic');
        }

        return this.ble.read({
            address: typeof deviceData === 'string' ? deviceData : deviceData.macAddress,
            service: serviceInstance.uuid,
            characteristic: characteristicInstance.uuid
        });
    }

    protected subscribe(
        deviceData: string | IDevice,
        service: string | Service,
        characteristic: string | Characteristic,
        observer: Partial<Observer<OperationResult>>): void {
        const serviceInstance = typeof service === 'string' ? this.miBand3.getServiceByUUID(service) : service;
        const characteristicInstance = typeof characteristic === 'string' ? serviceInstance?.getCharacteristicByUUID(characteristic) : characteristic;
        if (serviceInstance === undefined) {
            throw new Error('Failed to get service');
        } else if (characteristicInstance === undefined) {
            throw new Error('Failed to get characteristic');
        }

        this.ble.subscribe({
            address: typeof deviceData === 'string' ? deviceData : deviceData.macAddress,
            service: serviceInstance.uuid,
            characteristic: characteristicInstance.uuid
        }).subscribe(observer);
    }

    protected async unsubscribe(device: string | IDevice, service: string | Service, characteristic: string | Characteristic): Promise<UnsubscribeResult> {
        const serviceInstance = typeof service === 'string' ? this.miBand3.getServiceByUUID(service) : service;
        const characteristicInstance = typeof characteristic === 'string' ? serviceInstance?.getCharacteristicByUUID(characteristic) : characteristic;
        if (serviceInstance === undefined) {
            throw new Error('Failed to get service');
        } else if (characteristicInstance === undefined) {
            throw new Error('Failed to get characteristic');
        }

        return this.ble.unsubscribe({
            address: typeof device === 'string' ? device : device.macAddress,
            service: serviceInstance.uuid,
            characteristic: characteristicInstance.uuid
        });
    }

    public bytesToInt(bytes: Uint8Array): number {
        if (bytes.length === 0) {
            throw new Error('Failed to convert bytes to int: bytes array is empty!');
        }
        let res = 0;
        for (let i = bytes.length - 1; 0 <= i; i--) {
            res = res * 256 + bytes[i];
        }
        return res;
    }

    public bytesFromInt(num: number, size?: number): Uint8Array {
        const bytes = new Array<number>();
        let div = num;
        for (let i = 0; i <= Math.floor(Math.log2(num) / 8 /* === Math.log2(256) */); i++) {
            if (div < 256) {
                bytes[i] = div;
            } else {
                const tmp = div;
                div = Math.floor(div / 256);
                bytes[i] = tmp - div * 256;
            }
        }
        // add zero(s)
        if (size !== undefined && size > bytes.length) {
            const times = size - bytes.length;
            for (let i = 0; i < times; i++) {
                bytes.push(0);
            }
        }
        return Uint8Array.from(bytes);
    }


    public dateTimeFromBytes(bytes: Uint8Array, startIndex: number = 0): FireTimestamp | undefined {
        const date = new Date();
        if (bytes.length < 7) {
            return undefined;
        }
        date.setFullYear(
            this.bytesToInt(bytes.subarray(startIndex, startIndex + 2)),
            (bytes.at(startIndex + 2) as number) - 1,
            bytes.at(startIndex + 3)
        );
        date.setHours(
            bytes.at(startIndex + 4) as number,
            bytes.at(startIndex + 5),
            bytes.at(startIndex + 6),
            0
        );
        return FireTimestamp.fromDate(date);
    }

    public dateTimeToBytes(
        dateTime: Date | IFireTimestamp = new Date(),
        options?: {
            dayOfWeek?: boolean;
            fractions256?: boolean;
            DTSOffset?: boolean;
            timezone?: boolean;
            all?: boolean;
        }
    ): Uint8Array {
        const tmpDateTime = dateTime instanceof Date ? dateTime : (typeof (dateTime as FireTimestamp).toDate === 'function'
            ? (dateTime as FireTimestamp).toDate() : instantiate(dateTime, FireTimestamp).toDate());
        const tmp = [
            ...this.bytesFromInt(tmpDateTime.getFullYear(), 2),
            tmpDateTime.getMonth() + 1,
            tmpDateTime.getDate(),
            tmpDateTime.getHours(),
            tmpDateTime.getMinutes(),
            tmpDateTime.getSeconds()
        ];
        if (options !== undefined) {
            if (options.all?.valueOf()) {
                tmp.push(tmpDateTime.getDay() === 0 ? 7 : tmpDateTime.getDay()); // day of week
                tmp.push(0); // fractions256 off
                tmp.push(0); // DTS offset
                tmp.push(tmpDateTime.getTimezoneOffset() / -15); // timezone
            } else {
                if (options.dayOfWeek?.valueOf()) {
                    tmp.push(tmpDateTime.getDay() === 0 ? 7 : tmpDateTime.getDay());
                }
                if (options.fractions256?.valueOf()) {
                    tmp.push(0);
                }
                if (options.DTSOffset?.valueOf()) {
                    tmp.push(0);
                }
                if (options.timezone?.valueOf()) {
                    tmp.push(tmpDateTime.getTimezoneOffset() / -15);
                }
            }
        }
        return Uint8Array.from(tmp);
    }

}
