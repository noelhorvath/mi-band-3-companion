import { IEntityModel } from './IEntityModel';
import { IFireTimestamp } from './IFireTimestamp';

export interface IBatteryInfo extends IEntityModel<IBatteryInfo> {
    batteryLevel: number;
    isCharging: boolean;
    id?: string;
    deviceRef?: string | undefined;
    lastChargeDate?: IFireTimestamp | undefined;
    lastNumOfCharges?: number | undefined;
    lastChargeLevel?: number | undefined;
    prevChargeDate?: IFireTimestamp | undefined;
    prevNumOfCharges?: number | undefined;
    // unknown_value?: number | undefined
}
