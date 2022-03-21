import { IDevice } from '../interfaces/IDevice';
import { Service } from './Service';
import { IService } from '../interfaces/IService';
import { objectToClass } from '../../functions/parser.functions';
import { compareDates, compareNumericStrings } from '../../functions/comparison.functions';
import { OrderByDirection } from '@angular/fire/firestore';

export class Device implements IDevice {
    public name: string;
    public macAddress: string;
    public lastUsedDate: string;
    public services?: Service[] | undefined;

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
        return compareDates(a.lastUsedDate, b.lastUsedDate);
    }

    private static sortByLastUsedDateDesc(a: IDevice, b: IDevice): number {
        return compareDates(b.lastUsedDate, a.lastUsedDate);
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
        lastUsedDate: string | Date = new Date(),
        services?: IService[])
    {
        this.name = name;
        this.macAddress = macAddress;
        this.lastUsedDate = typeof lastUsedDate === 'string' ? lastUsedDate : lastUsedDate.toISOString();
        this.services = services?.map((s: IService) => objectToClass<Service>(s as Service, Service));
    }

    public copy(other: IDevice): void {
        if (!this.isEqual(other)) {
            this.name = other.name;
            this.macAddress = other.macAddress;
            this.lastUsedDate = other.lastUsedDate ?? new Date();
            this.services = other.services?.map((s: IService) => objectToClass<Service>(s as Service, Service));
        }
    }

    public toString(): string {
        return 'name: ' + this.name + ', macAddress: ' + this.macAddress + ', lastUsed: ' + this.lastUsedDate
            + ', services: ' + (this.services !== undefined ? '[' + this.services.map((s: Service) => s.toString()).toString() + ']' : this.services);
    }

    public isEqual(other: IDevice | undefined): boolean {
        if (this === other) {
            return true;
        } else if (other === undefined) {
            return false;
        } else {
            const res = this.name === other.name && this.macAddress === other.macAddress && this.lastUsedDate === other.lastUsedDate;
            if (!res) {
                return res;
            }
            let areServicesEqual = false;
            if (this.services === other.services) {
                areServicesEqual = true;
            } else if (this.services === undefined || other.services === undefined || this.services.length !== other.services.length) {
                areServicesEqual = false;
            } else {
                const servicesThis = objectToClass<Device>(this, Device).services?.sort(Service.getCompareFunction('uuid', 'asc'));
                const servicesOther = objectToClass<Device>(other as Device, Device).services?.sort(Service.getCompareFunction('uuid', 'asc'));
                if (servicesThis !== undefined && servicesOther !== undefined) {
                    for (let i = 0; i < servicesThis.length; i++) {
                        if (!servicesThis[i].isEqual(servicesOther[i])) {
                            break;
                        }

                        if (i === servicesThis.length - 1) {
                            areServicesEqual = true;
                        }
                    }
                }
            }
            return areServicesEqual;
        }
    }
}
