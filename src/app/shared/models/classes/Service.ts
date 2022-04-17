import { IService } from '../interfaces/IService';
import { Characteristic } from './Characteristic';
import { UUIDExtension } from './UUIDExtension';
import { ICharacteristic } from '../interfaces/ICharacteristic';
import { copyProperty, isArrayPropertyEqual } from '../../functions/parser.functions';
import { compareNumericStrings, compareStrings } from '../../functions/comparison.functions';
import { OrderByDirection } from '@angular/fire/firestore';

export class Service extends UUIDExtension implements IService {
    public characteristics!: Characteristic[];
    public name: string | undefined;

    private static sortByUUIDAsc(a: IService, b: IService): number {
        return (a instanceof Service ? a.uuid : a.uuid.toLowerCase()) === (b instanceof Service ? b.uuid : b.uuid.toLowerCase())
            ? Service.sortByNameAsc(a, b) : compareNumericStrings(a instanceof Service ? a.uuid : a.uuid.toLowerCase(), b instanceof Service ? b.uuid : b.uuid.toLowerCase());
    }

    private static sortByUUIDDesc(a: IService, b: IService): number {
        return (b instanceof Service ? b.uuid : b.uuid.toLowerCase()) === (a instanceof Service ? a.uuid : a.uuid.toLowerCase())
            ? Service.sortByNameDesc(a, b) : compareNumericStrings(b instanceof Service ? b.uuid : b.uuid.toLowerCase(), a instanceof Service ? a.uuid : a.uuid.toLowerCase());
    }

    private static sortByNameAsc(a: IService, b: IService): number {
        return compareStrings(a.name ?? 'undefined', b.name ?? 'undefined');
    }

    private static sortByNameDesc(a: IService, b: IService): number {
        return compareStrings(b.name ?? 'undefined', a.name ?? 'undefined');
    }

    public static getCompareFunction(propertyName: string, direction: OrderByDirection): (a: IService, b: IService) => number {
        if (propertyName === 'uuid') {
            return direction === 'asc' ? Service.sortByUUIDAsc : Service.sortByUUIDDesc;
        } else if (propertyName === 'name') {
            return direction === 'asc' ? Service.sortByNameAsc : Service.sortByNameDesc;
        }
        throw new Error('Property is either invalid or no compare function is defined for it');
    }

    public constructor(
        uuid: string = 'undefined',
        characteristics: ICharacteristic[] = [],
        name?: string
    ) {
        super(uuid);
        copyProperty(this, { characteristics }, 'characteristics', Characteristic);
        this.name = name ?? 'undefined';
    }

    public getCharacteristicByName(name: string): Characteristic | undefined {
        return this.characteristics.find((c: Characteristic) => c.name.toLowerCase().includes(name.toLowerCase().trim()));
    }

    public getCharacteristicByUUID(uuid: string): Characteristic | undefined {
        return this.characteristics.find((c: Characteristic) => c.uuid === uuid.toLowerCase() || c.getShortenedUUID() === uuid.toLowerCase());
    }

    public copy(other: IService): void {
        if (!this.isEqual(other)) {
            this.uuid = other.uuid;
            copyProperty(this, other, 'characteristics', Characteristic);
            this.name = other.name ?? 'undefined';
        }
    }

    public override toString(): string {
        return 'name: ' + this.name + ', characteristics: ' + '[' + this.characteristics.map(char => char.toString()).toString() + ']';
    }

    public isEqual(other: IService | undefined): boolean {
        if (this === other) {
            return true;
        } else if (other === undefined) {
            return false;
        } else {
            const res = this.name === other.name && this.uuid === (other instanceof Service ? other.uuid : other.uuid.toLowerCase());
            return !res ? res : isArrayPropertyEqual(this, other, Service, 'characteristics', Characteristic.getCompareFunction, 'uuid', 'asc');
        }
    }
}
