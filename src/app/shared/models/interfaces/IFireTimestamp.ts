import { IEntityModel } from './IEntityModel';

export interface IFireTimestamp extends IEntityModel<IFireTimestamp> {
    seconds: number;
    nanoseconds: number;
}
