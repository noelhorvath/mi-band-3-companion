import { Constructor, Copyable, EqualityChecker, NamedProperty, SortFunction } from '../types/custom.types';
import { OrderByDirection } from '@angular/fire/firestore';

// class must have a default constructor and a copy method or a copy constructor
export const instantiate = <T extends Copyable<T>, K extends T>(obj: T, factory: Constructor<K>): K => {
    const instance = new factory();
    if (typeof instance.copy === 'function') { // copy object if the class has copy method
        instance.copy(obj);
        return instance;
    } else {
        return new factory(obj); // call copy constructor
    }
};

export const parseJSON = <T extends Copyable<T>, K extends T>(data: Array<T> | T, factory: Constructor<K>): K[] | K =>
    data instanceof Array ? data.map((s: T) => instantiate(s, factory) ?? new factory()) : instantiate(data, factory) ?? new factory();

export const copyProperty =
    <IMainType extends NamedProperty<PropertyName, (IPropertyType | Array<IPropertyType>)> & Copyable<IMainType>,
        MainType extends IMainType,
        PropertyName extends string,
        IPropertyType extends Copyable<IPropertyType>,
        PropertyType extends IPropertyType>
    (_this: MainType, other: Partial<IMainType> | IMainType | MainType, propName: PropertyName, propFactory: Constructor<PropertyType>): void => {
        if (other[propName] instanceof Array) {
            (_this[propName] as IPropertyType[] | undefined) = (other[propName] as Array<IPropertyType>)?.map((item: IPropertyType) => instantiate<IPropertyType, PropertyType>(item, propFactory));
        } else if (_this[propName] && other[propName] && typeof _this.copy === 'function' && typeof (_this[propName] as IPropertyType).copy === 'function') {
            (_this[propName] as (IPropertyType & { copy: (other: IPropertyType) => void })).copy(other[propName] as IPropertyType);
        } else {
            if (other !== undefined && typeof other[propName] === 'object') {
                (_this[propName] as IPropertyType) = instantiate(other[propName] as IPropertyType, propFactory);
            } else {
                (_this[propName] as unknown) = other[propName];
            }
        }
    };

export const isArrayPropertyEqual =
    <IMainType extends NamedProperty<PropertyName, Array<IPropertyType>> & Copyable<IMainType>,
        MainType extends IMainType,
        PropertyName extends string,
        IPropertyType,
        PropertyType extends IPropertyType & EqualityChecker<IPropertyType>>(
        _this: MainType,
        other: IMainType,
        mainFactory: Constructor<MainType>,
        propName: PropertyName,
        sortFunction: (propName: string, order: OrderByDirection) => SortFunction<IPropertyType>,
        sortByPropName: string,
        sortByOrder: OrderByDirection): boolean => {
        let isEqual = false;
        if (_this[propName] === other[propName]) {
            isEqual = true;
        } else if ((_this[propName] as Array<IPropertyType> | undefined)?.length !== (other[propName] as Array<IPropertyType> | undefined)?.length) {
            isEqual = false;
        } else {
            const thisInstance = 'isEqual' in _this ? _this : instantiate(_this, mainFactory);
            const thisPropArray = (thisInstance[propName] as PropertyType[] | undefined)?.sort(sortFunction(sortByPropName, sortByOrder));
            const otherInstance = 'isEqual' in other ? other : instantiate(other, mainFactory);
            const otherPropArray = (otherInstance[propName] as PropertyType[] | undefined)?.sort(sortFunction(sortByPropName, sortByOrder));
            if (thisPropArray !== undefined && otherPropArray !== undefined) {
                for (let i = 0; i < thisPropArray.length; i++) {
                    if (!(thisPropArray[i] as PropertyType).isEqual(otherPropArray[i] as PropertyType)) {
                        break;
                    }

                    if (i === thisPropArray.length - 1) {
                        isEqual = true;
                    }
                }
            }
        }
        return isEqual;
    };
