import { IBatteryInfo } from '../interfaces/IBatteryInfo';
import { Device } from './Device';
import { IDevice } from '../interfaces/IDevice';
import { objectToClass } from '../../functions/parser.functions';

export class BatteryInfo implements IBatteryInfo {
    public id: string;
    public batteryLevel: number;
    public isCharging: boolean;
    public device?: Device | undefined;
    public lastChargeDate?: string | undefined;
    public lastNumOfCharges?: number | undefined;
    public lastChargeLevel?: number | undefined;
    public prevChargeDate?: string | undefined;
    public prevNumOfCharges?: number | undefined;

    // public unknown_value?: number | undefined;

    public constructor(
        id: string = 'undefined',
        batteryLevel: number = 0,
        isCharging: boolean = false,
        device?: IDevice,
        lastChargeDate?: string | Date,
        lastChargeLevel?: number,
        lastNumOfCharges?: number,
        prevChargeDate?: string | Date,
        prevNumOfCharges?: number)
    {
        this.id = id;
        this.batteryLevel = batteryLevel;
        this.isCharging = isCharging;
        this.device = device !== undefined ? objectToClass<Device>(device as Device, Device) : device;
        this.lastChargeLevel = lastChargeLevel;
        this.lastChargeDate = lastChargeDate?.toString();
        this.lastNumOfCharges = lastNumOfCharges;
        this.prevChargeDate = prevChargeDate?.toString();
        this.prevNumOfCharges = prevNumOfCharges;
    }


    public copy(other: IBatteryInfo): void {
        if (!this.isEqualTo(other)) {
            this.id = other.id ?? 'undefined';
            this.batteryLevel = other.batteryLevel;
            this.isCharging = other.isCharging;

            if (this.device !== undefined && other.device !== undefined) {
                this.device.copy(other.device);
            } else {
                this.device = other.device !== undefined ? objectToClass<Device>(other.device as Device, Device) : other.device;
            }

            this.lastChargeDate = other.lastChargeDate;
            this.lastNumOfCharges = other.lastNumOfCharges;
            this.lastChargeLevel = other.lastChargeLevel;
            this.prevNumOfCharges = other.prevNumOfCharges;
            this.prevChargeDate = other.prevChargeDate;
        }
    }

    public toString(): string {
        return 'id: ' + this.id + ', device: ' + (this.device ? '{' + this.device.toString() + '}' : this.device) + ', batteryLevel: ' + this.batteryLevel
            + ', isCharging: ' + this.isCharging + ', prevChargeDate: ' + this.prevChargeDate + ', prevNumOfCharges: ' + this.prevNumOfCharges
            + ', lastChargeDate: ' + this.lastChargeDate + ', lastNumOfCharges: ' + this.lastNumOfCharges + ', lastChargeLevel: ' + this.lastChargeLevel;
    }

    public isEqualTo(other: IBatteryInfo | undefined): boolean {
        return this !== other ? this.id === other?.id && this.batteryLevel === other.batteryLevel && this.isCharging === other.isCharging
            && (this.device !== other.device ? this.device?.isEqual(other.device) ?? false : true) && this.lastChargeDate === other.lastChargeDate
            && this.lastNumOfCharges === other.lastNumOfCharges && this.lastChargeLevel === other.lastChargeLevel
            && this.prevNumOfCharges === other.prevNumOfCharges && this.prevChargeDate === other.prevChargeDate : true;
    }
}

