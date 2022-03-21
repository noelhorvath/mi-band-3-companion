import { DateType } from '../../types/custom.types';
import { IEntityModel } from './IEntityModel';

export interface IMeasurementDate extends IEntityModel<IMeasurementDate> {
    dateType: DateType;
    uploadDate: string;
}
