import {IEntityModel} from "./IEntityModel";
import {IDevice} from "./IDevice";

export interface IBatteryInfo extends IEntityModel<IBatteryInfo>{
    id: string;
    batteryLevel: number;
    isCharging: boolean;
    unknown_value?: number;
    prevChargeDate?: string;
    prevNumOfCharges?: number;
    lastChargeDate?: string;
    lastNumOfCharges?: number;
    lastChargeLevel?: number;
    device?: IDevice;
}
