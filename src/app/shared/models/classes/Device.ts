import { IDevice } from '../interfaces/IDevice';
import { Service } from './Service';
import { IService } from '../interfaces/IService';
import { copyProperty, isArrayPropertyEqual } from '../../functions/parser.functions';
import { compareNumericStrings, compareTimestamps, equals } from '../../functions/comparison.functions';
import { OrderByDirection } from '@angular/fire/firestore';
import { FireTimestamp } from './FireTimestamp';
import { IFireTimestamp } from '../interfaces/IFireTimestamp';

export class Device implements IDevice {
    public name: string;
    public macAddress: string;
    public lastUsedDate!: FireTimestamp;
    public services: Service[] | undefined;

    private static sortByMacAddressAsc(a: IDevice, b: IDevice): number {
        return a.macAddress === b.macAddress ? Device.sortByNameAsc(a, b) : compareNumericStrings(a.macAddress, b.macAddress);
    }

    private static sortByMacAddressDesc(a: IDevice, b: IDevice): number {
        return b.macAddress === a.macAddress ? Device.sortByNameDesc(a, b) : compareNumericStrings(b.macAddress, a.macAddress);
    }

    private static sortByNameAsc(a: IDevice, b: IDevice): number {
        return a.name === b.name ? Device.sortByLastUsedDateAsc(a, b) : compareNumericStrings(a.name, b.name);
    }

    private static sortByNameDesc(a: IDevice, b: IDevice): number {
        return b.name === a.name ? Device.sortByLastUsedDateDesc(a, b) : compareNumericStrings(b.name, a.name);
    }

    private static sortByLastUsedDateAsc(a: IDevice, b: IDevice): number {
        return compareTimestamps(a.lastUsedDate, b.lastUsedDate);
    }

    private static sortByLastUsedDateDesc(a: IDevice, b: IDevice): number {
        return compareTimestamps(b.lastUsedDate, a.lastUsedDate);
    }

    public static getCompareFunction(propertyName: string, direction: OrderByDirection): (a: IDevice, b: IDevice) => number {
        if (propertyName === 'macAddress') {
            return direction === 'asc' ? Device.sortByMacAddressAsc : Device.sortByMacAddressDesc;
        } else if (propertyName === 'name') {
            return direction === 'asc' ? Device.sortByNameAsc : Device.sortByNameDesc;
        } else if (propertyName === 'lastUsedDate') {
            return direction === 'asc' ? Device.sortByLastUsedDateAsc : Device.sortByLastUsedDateDesc;
        }
        throw new Error('Property is either invalid or no compare function is defined for it');
    }

    public constructor(
        name: string = 'undefined',
        macAddress: string = 'undefined',
        lastUsedDate: IFireTimestamp = FireTimestamp.now(),
        services?: IService[])
    {
        this.name = name;
        this.macAddress = macAddress;
        copyProperty<IDevice, Device, 'lastUsedDate', IFireTimestamp, FireTimestamp>(this, { lastUsedDate } as Partial<Device>, 'lastUsedDate', FireTimestamp);
        copyProperty(this, { services } as Partial<IDevice>, 'services', Service);
    }

    public copy(other: IDevice): void {
        if (!this.isEqual(other)) {
            this.name = other.name;
            this.macAddress = other.macAddress;
            copyProperty<IDevice, Device, 'lastUsedDate', IFireTimestamp, FireTimestamp>(this, other, 'lastUsedDate', FireTimestamp);
            copyProperty(this, other, 'services', Service);
        }
    }

    public toString(): string {
        return 'name: ' + this.name + ', macAddress: ' + this.macAddress + ', lastUsed: ' + this.lastUsedDate.toString()
            + ', services: ' + (this.services !== undefined ? '[' + this.services.map((s: Service) => s.toString()).toString() + ']' : this.services);
    }

    public isEqual(other: IDevice | undefined): boolean {
        if (this === other) {
            return true;
        } else if (other === undefined) {
            return false;
        } else {
            const res = this.name === other.name && this.macAddress === other.macAddress && equals<IFireTimestamp>(this.lastUsedDate, other.lastUsedDate);
            return !res ? res : isArrayPropertyEqual(this, other, Device, 'services', Service.getCompareFunction, 'uuid', 'asc');
        }
    }
}
