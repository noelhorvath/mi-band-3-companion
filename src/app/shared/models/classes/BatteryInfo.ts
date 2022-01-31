import {IBatteryInfo} from "../interfaces/IBatteryInfo";
import {Device} from "./Device";

export class BatteryInfo implements IBatteryInfo {
    id: string;
    batteryLevel: number;
    isCharging: boolean;
    device: Device;
    lastChargeDate?: string;
    lastChargeLevel?: number;
    lastNumOfCharges?: number;
    prevChargeDate?: string;
    prevNumOfCharges?: number;
    // unknown_value?: number


    constructor(id: string = "", batteryLevel: number = 0, isCharging: boolean = false, device?: Device, lastChargeDate?: string, lastChargeLevel?: number, lastNumOfCharges?: number, prevChargeDate?: string, prevNumOfCharges?: number) {
        this.id = id;
        this.batteryLevel = batteryLevel;
        this.isCharging = isCharging;
        this.device = new Device();
        this.device.copy(device);
        this.lastChargeDate = lastChargeDate;
        this.lastChargeLevel = lastChargeLevel;
        this.lastNumOfCharges = lastNumOfCharges;
        this.prevChargeDate = prevChargeDate;
        this.prevNumOfCharges = prevNumOfCharges;
    }



    public copy(batteryInfo: BatteryInfo): void {
        this.id = batteryInfo.id;
        this.batteryLevel = batteryInfo?.batteryLevel;
        this.isCharging = batteryInfo?.isCharging
        this.device = new Device();
        this.device.copy(batteryInfo.device);
        this.lastChargeDate = batteryInfo?.lastChargeDate;
        this.lastChargeLevel = batteryInfo?.lastChargeLevel;
        this.lastNumOfCharges = batteryInfo?.lastNumOfCharges;
        this.prevChargeDate = batteryInfo?.prevChargeDate;
        this.prevNumOfCharges = batteryInfo?.prevNumOfCharges;
    }
}

