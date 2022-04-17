import { IEntityModel } from './IEntityModel';

export interface IMeasurementValue extends IEntityModel<IMeasurementValue> {
    avg: number;
    min: number;
    max: number;
}
