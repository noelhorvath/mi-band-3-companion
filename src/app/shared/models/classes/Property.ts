import { IProperty } from '../interfaces/IProperty';
import { PropertyName } from '../../types/custom.types';
import { compareStrings } from '../../functions/comparison.functions';
import { OrderByDirection } from '@angular/fire/firestore';

export class Property implements IProperty {
    public name: PropertyName;

    private static sortByNameAsc(a: IProperty, b: IProperty): number {
        return compareStrings(a.name, b.name);
    }

    private static sortByNameDesc(a: IProperty, b: IProperty): number {
        return compareStrings(b.name, a.name);
    }

    public static getCompareFunction(propertyName: string, direction: OrderByDirection): (a: IProperty, b: IProperty) => number {
        if (propertyName === 'name') {
            return direction === 'asc' ? Property.sortByNameAsc : Property.sortByNameDesc;
        }
        throw new Error('Invalid property name');
    }

    public constructor(name: PropertyName = 'READ') {
        this.name = name;
    }

    public copy(other: IProperty): void {
        if (!this.isEqual(other)) {
            this.name = other.name;
        }
    }

    public toString(): string {
        return 'name: ' + this.name;
    }

    public isEqual(other: IProperty | undefined): boolean {
        return this !== other ? this.name === other?.name : true;
    }
}
