import { DateType } from '../../types/custom.types';
import { IEntityModel } from './IEntityModel';
import { IFireTimestamp } from './IFireTimestamp';

export interface IMeasurementInfo extends IEntityModel<IMeasurementInfo> {
    type: DateType;
    date: IFireTimestamp;
    deviceRef: string;
}

