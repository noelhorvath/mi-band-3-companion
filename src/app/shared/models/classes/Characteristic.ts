import { ICharacteristic } from '../interfaces/ICharacteristic';
import { Descriptor } from './Descriptor';
import { Property } from './Property';
import { UUIDExtension } from './UUIDExtension';
import { IProperty } from '../interfaces/IProperty';
import { IDescriptor } from '../interfaces/IDescriptor';
import { objectToClass } from '../../functions/parser.functions';
import { compareNumericStrings, compareStrings } from '../../functions/comparison.functions';
import { OrderByDirection } from '@angular/fire/firestore';

export class Characteristic extends UUIDExtension implements ICharacteristic {
    public name: string;
    public properties: Property[];
    public descriptor?: Descriptor | undefined;

    private static sortByUUIDAsc(a: ICharacteristic, b: ICharacteristic): number {
        return (a instanceof Characteristic ? a.uuid : a.uuid.toLowerCase()) === (b instanceof Characteristic ? b.uuid : b.uuid.toLowerCase())
            ? Characteristic.sortByNameAsc(a, b)
            : compareNumericStrings(a instanceof Characteristic ? a.uuid : a.uuid.toLowerCase(), b instanceof Characteristic ? b.uuid : b.uuid.toLowerCase());
    }

    private static sortByUUIDDesc(a: ICharacteristic, b: ICharacteristic): number {
        return (b instanceof Characteristic ? b.uuid : b.uuid.toLowerCase()) === (a instanceof Characteristic ? a.uuid : a.uuid.toLowerCase())
            ? Characteristic.sortByNameDesc(a, b)
            : compareNumericStrings(b instanceof Characteristic ? b.uuid : b.uuid.toLowerCase(), a instanceof Characteristic ? a.uuid : a.uuid.toLowerCase());
    }

    private static sortByNameAsc(a: ICharacteristic, b: ICharacteristic): number {
        return compareStrings(a.name, b.name);
    }

    private static sortByNameDesc(a: ICharacteristic, b: ICharacteristic): number {
        return compareStrings(b.name, a.name);
    }

    public static getCompareFunction(propertyName: string, direction: OrderByDirection): (a: ICharacteristic, b: ICharacteristic) => number {
        if (propertyName === 'uuid') {
            return direction === 'asc' ? Characteristic.sortByUUIDAsc : Characteristic.sortByUUIDDesc;
        } else if (propertyName === 'name') {
            return direction === 'asc' ? Characteristic.sortByNameAsc : Characteristic.sortByNameDesc;
        }
        throw new Error('Property is either invalid or no compare function is defined for it');
    }

    public constructor(
        uuid: string = 'undefined',
        name: string = 'undefined',
        properties: IProperty[] = [],
        descriptor?: IDescriptor)
    {
        super(uuid);
        this.name = name;
        this.properties = properties.map((p: IProperty) => objectToClass<Property>(p as Property, Property));
        this.descriptor = descriptor !== undefined ? objectToClass<Descriptor>(descriptor as Descriptor, Descriptor) : descriptor;
    }

    public copy(characteristic: ICharacteristic): void {
        if (!this.isEqual(characteristic)) {
            this.uuid = characteristic.uuid;
            this.name = characteristic.name;
            this.properties = characteristic.properties.map((p: IProperty) => objectToClass<Property>(p as Property, Property));

            if (this.descriptor !== undefined && characteristic.descriptor !== undefined) {
                this.descriptor.copy(characteristic.descriptor);
            } else {
                this.descriptor = characteristic.descriptor !== undefined ? objectToClass<Descriptor>(characteristic.descriptor as Descriptor, Descriptor) : characteristic.descriptor;
            }
        }
    }

    public override toString(): string {
        return 'uuid: ' + this.uuid + ', name: ' + this.name + ', descriptor: ' + (this.descriptor !== undefined ? '{' + this.descriptor.toString() + '}' : this.descriptor) + ', properties: '
            + (this.properties !== undefined ? '[' + this.properties.map((p: Property) => p.toString()).toString() + ']' : this.properties);
    }

    public isEqual(characteristic: ICharacteristic | undefined): boolean {
        if (this === characteristic) {
            return true;
        } else if (characteristic === undefined) {
            return false;
        } else {
            const res = this.uuid === (characteristic instanceof Characteristic ? characteristic.uuid : characteristic.uuid.toLowerCase())
                && (this.descriptor !== characteristic.descriptor ? this.descriptor?.isEqual(characteristic.descriptor) ?? false : true);
            if (!res) {
                return res;
            }
            let arePropertiesEqual = false;
            if (this.properties === characteristic.properties) {
                arePropertiesEqual = true;
            } else if (this.properties.length !== characteristic.properties.length) {
                arePropertiesEqual = false;
            } else {
                const props1 = objectToClass<Characteristic>(this, Characteristic).properties.sort(Property.getCompareFunction('name', 'asc'));
                const props2 = objectToClass<Characteristic>(characteristic as Characteristic, Characteristic).properties.sort(Property.getCompareFunction('name', 'asc'));
                for (let i = 0; i < props1.length; i++) {
                    if (!props1[i].isEqual(props2[i])) {
                        break;
                    }

                    if (i === props1.length - 1) {
                        arePropertiesEqual = true;
                    }
                }
            }
            return arePropertiesEqual;
        }
    }
}
