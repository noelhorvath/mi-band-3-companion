import { IEntityModel } from './IEntityModel';
import { PropertyName } from '../../types/custom.types';

export interface IProperty extends IEntityModel<IProperty> {
    name: PropertyName;
}
