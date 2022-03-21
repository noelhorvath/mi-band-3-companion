import { IEntityModel } from './IEntityModel';

export interface IScanResult extends IEntityModel<IScanResult> {
    name: string;
    address: string;
    rssi: number;
}
