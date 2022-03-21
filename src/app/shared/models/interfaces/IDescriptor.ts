import { IEntityModel } from './IEntityModel';

export interface IDescriptor extends IEntityModel<IDescriptor> {
    uuid: string;
}
