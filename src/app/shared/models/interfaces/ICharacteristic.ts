import { IProperty } from './IProperty';
import { IDescriptor } from './IDescriptor';
import { IEntityModel } from './IEntityModel';

export interface ICharacteristic extends IEntityModel<ICharacteristic> {
    uuid: string;
    name: string;
    properties: IProperty[];
    descriptor?: IDescriptor | undefined;
}
