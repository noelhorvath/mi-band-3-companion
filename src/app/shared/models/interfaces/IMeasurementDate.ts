import { DateType } from '../../types/custom.types';
import { IEntityModel } from './IEntityModel';
import { IFireTimestamp } from './IFireTimestamp';

export interface IMeasurementDate extends IEntityModel<IMeasurementDate> {
    dateType: DateType;
    uploadDate: IFireTimestamp;
}

