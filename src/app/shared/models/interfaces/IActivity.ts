import { IEntityModel } from './IEntityModel';
import { IMeasurementInfo } from './IMeasurementInfo';
import { IMeasurementValue } from './IMeasurementValue';

export interface IActivity extends IEntityModel<IActivity> {
    steps: number;
    measurementInfo: IMeasurementInfo;
    id?: string;
    distance?: number;
    calories?: number;
    intensity?: IMeasurementValue;
}
