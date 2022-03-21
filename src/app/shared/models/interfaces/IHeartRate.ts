import { IEntityModel } from './IEntityModel';
import { IDevice } from './IDevice';
import { IMeasurementDate } from './IMeasurementDate';

export interface IHeartRate extends IEntityModel<IHeartRate> {
    bpm: number;
    id?: string;
    device?: IDevice | undefined;
    measurementDate?: IMeasurementDate | undefined;
}
