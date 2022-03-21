import { IService } from '../interfaces/IService';
import { Characteristic } from './Characteristic';
import { UUIDExtension } from './UUIDExtension';
import { ICharacteristic } from '../interfaces/ICharacteristic';
import { objectToClass } from '../../functions/parser.functions';
import { compareNumericStrings, compareStrings } from '../../functions/comparison.functions';
import { OrderByDirection } from '@angular/fire/firestore';

export class Service extends UUIDExtension implements IService {
    public characteristics: Characteristic[];
    public name?: string;

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
        characteristic: ICharacteristic[] = [],
        name?: string)
    {
        super(uuid);
        this.characteristics = characteristic.map((c: ICharacteristic) => objectToClass<Characteristic>(c as Characteristic, Characteristic));
        this.name = name ?? 'undefined';
    }

    public getCharacteristic(name: string): Characteristic | undefined {
        return this.characteristics.find((c: Characteristic) => c.name.toLowerCase().includes(name.toLowerCase().trim()));
    }

    public copy(other: IService): void {
        if (!this.isEqual(other)) {
            this.characteristics = other.characteristics.map((c: ICharacteristic) => objectToClass<Characteristic>(c as Characteristic, Characteristic));
            this.uuid = other.uuid;
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
            if (!res) {
                return res;
            }
            let areCharacteristicsEqual = false;
            if (this.characteristics === other.characteristics) {
                areCharacteristicsEqual = true;
            } else if (this.characteristics.length !== other.characteristics.length) {
                areCharacteristicsEqual = false;
            } else {
                const charsThis = objectToClass<Service>(this, Service).characteristics.sort(Characteristic.getCompareFunction('uuid', 'asc'));
                const charsOther = objectToClass<Service>(other as Service, Service).characteristics.sort(Characteristic.getCompareFunction('uuid', 'asc'));
                for (let i = 0; i < charsThis.length; i++) {
                    if (!charsThis[i].isEqual(charsOther[i])) {
                        break;
                    }

                    if (i === charsThis.length - 1) {
                        areCharacteristicsEqual = true;
                    }
                }
            }
            return areCharacteristicsEqual;
        }
    }
}
