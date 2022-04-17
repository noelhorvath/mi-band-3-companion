import { IEntityModel } from './IEntityModel';
import { IMeasurementInfo } from './IMeasurementInfo';
import { IMeasurementValue } from './IMeasurementValue';

export interface IHeartRate extends IEntityModel<IHeartRate> {
    bpm: IMeasurementValue;
    measurementInfo: IMeasurementInfo;
    id?: string;
}
