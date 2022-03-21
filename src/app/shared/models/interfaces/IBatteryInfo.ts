import { IEntityModel } from './IEntityModel';
import { IDevice } from './IDevice';

export interface IBatteryInfo extends IEntityModel<IBatteryInfo> {
    batteryLevel: number;
    isCharging: boolean;
    id?: string;
    device?: IDevice | undefined;
    lastChargeDate?: string | undefined;
    lastNumOfCharges?: number | undefined;
    lastChargeLevel?: number | undefined;
    prevChargeDate?: string | undefined;
    prevNumOfCharges?: number | undefined;
    // unknown_value?: number | undefined
}
