import { ICharacteristic } from '../interfaces/ICharacteristic';
import { Descriptor } from './Descriptor';
import { Property } from './Property';
import { UUIDExtension } from './UUIDExtension';
import { IProperty } from '../interfaces/IProperty';
import { IDescriptor } from '../interfaces/IDescriptor';
import { copyProperty, isArrayPropertyEqual } from '../../functions/parser.functions';
import { compareNumericStrings, compareStrings } from '../../functions/comparison.functions';
import { OrderByDirection } from '@angular/fire/firestore';
import { PropertyName } from '../../types/custom.types';

export class Characteristic extends UUIDExtension implements ICharacteristic {
    public name: string;
    public properties!: Property[];
    public descriptor: Descriptor | undefined;

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
        descriptor?: IDescriptor
    ) {
        super(uuid);
        this.name = name;
        copyProperty(this, { properties }, 'properties', Property);
        copyProperty(this, { descriptor }, 'descriptor', Descriptor);
    }

    public copy(other: ICharacteristic): void {
        if (!this.isEqual(other)) {
            this.uuid = other.uuid;
            this.name = other.name;
            copyProperty(this, other, 'properties', Property);
            copyProperty(this, other, 'descriptor', Descriptor);
        }
    }

    public override toString(): string {
        return 'uuid: ' + this.uuid + ', name: ' + this.name + ', descriptor: '
            + (this.descriptor !== undefined ? '{' + this.descriptor.toString() + '}' : this.descriptor) + ', properties: '
            + (this.properties !== undefined ? '[' + this.properties.map((p: Property) => p.toString()).toString() + ']' : this.properties);
    }

    public isEqual(other: ICharacteristic | undefined): boolean {
        if (this === other) {
            return true;
        } else if (other === undefined) {
            return false;
        } else {
            const res = this.uuid === (other instanceof Characteristic ? other.uuid : other.uuid.toLowerCase())
                && (this.descriptor !== other.descriptor ? this.descriptor?.isEqual(other.descriptor) ?? false : true);
            return !res ? res : isArrayPropertyEqual(this, other, Characteristic, 'properties', Property.getCompareFunction, 'uuid', 'asc');
        }
    }

    public hasProperty(name: PropertyName): boolean {
        return this.properties.find((prop: Property) => prop.name.toLowerCase() === name.toLowerCase()) !== undefined;
    }
}
