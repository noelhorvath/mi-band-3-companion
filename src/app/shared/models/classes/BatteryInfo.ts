import { IBatteryInfo } from '../interfaces/IBatteryInfo';
import { Device } from './Device';
import { IDevice } from '../interfaces/IDevice';
import { copyProperty } from '../../functions/parser.functions';
import { FireTimestamp } from './FireTimestamp';
import { IFireTimestamp } from '../interfaces/IFireTimestamp';
import { equals } from '../../functions/comparison.functions';

export class BatteryInfo implements IBatteryInfo {
    public id: string;
    public batteryLevel: number;
    public isCharging: boolean;
    public device: Device | undefined;
    public lastChargeDate: FireTimestamp | undefined;
    public lastNumOfCharges: number | undefined;
    public lastChargeLevel: number | undefined;
    public prevChargeDate: FireTimestamp | undefined;
    public prevNumOfCharges: number | undefined;
    // public unknown_value?: number | undefined;

    public constructor(
        id: string = 'undefined',
        batteryLevel: number = 0,
        isCharging: boolean = false,
        device?: IDevice,
        lastChargeDate?: IFireTimestamp,
        lastChargeLevel?: number,
        lastNumOfCharges?: number,
        prevChargeDate?: IFireTimestamp,
        prevNumOfCharges?: number)
    {
        this.id = id;
        this.batteryLevel = batteryLevel;
        this.isCharging = isCharging;
        copyProperty(this, { device } as Partial<IBatteryInfo>, 'device', Device);
        copyProperty<IBatteryInfo, BatteryInfo, 'lastChargeDate', IFireTimestamp, FireTimestamp>
            (this, { lastChargeDate } as Partial<IBatteryInfo>, 'lastChargeDate', FireTimestamp);
        this.lastChargeLevel = lastChargeLevel;
        this.prevNumOfCharges = prevNumOfCharges;
        copyProperty<IBatteryInfo, BatteryInfo, 'prevChargeDate', IFireTimestamp, FireTimestamp>
            (this, { prevChargeDate } as Partial<IBatteryInfo>, 'prevChargeDate', FireTimestamp);
        this.lastNumOfCharges = lastNumOfCharges;
    }


    public copy(other: IBatteryInfo): void {
        if (!this.isEqualTo(other)) {
            this.id = other.id ?? 'undefined';
            this.batteryLevel = other.batteryLevel;
            this.isCharging = other.isCharging;
            copyProperty(this, other, 'device', Device);
            copyProperty<IBatteryInfo, BatteryInfo, 'lastChargeDate', IFireTimestamp, FireTimestamp>(this, other, 'lastChargeDate', FireTimestamp);
            this.lastNumOfCharges = other.lastNumOfCharges;
            this.lastChargeLevel = other.lastChargeLevel;
            copyProperty<IBatteryInfo, BatteryInfo, 'prevChargeDate', IFireTimestamp, FireTimestamp>(this, other, 'prevChargeDate', FireTimestamp);
            this.prevNumOfCharges = other.prevNumOfCharges;
        }
    }

    public toString(): string {
        return 'id: ' + this.id + ', device: ' + (this.device ? '{' + this.device.toString() + '}' : this.device)
            + ', batteryLevel: ' + this.batteryLevel + ', isCharging: ' + this.isCharging
            + ', prevChargeDate: ' + this.prevChargeDate?.toString()
            + ', prevNumOfCharges: ' + this.prevNumOfCharges
            + ', lastChargeDate: ' + this.lastChargeDate?.toString()
            + ', lastNumOfCharges: ' + this.lastNumOfCharges + ', lastChargeLevel: ' + this.lastChargeLevel;
    }

    public isEqualTo(other: IBatteryInfo | undefined): boolean {
        return this !== other ? this.id === other?.id && this.batteryLevel === other.batteryLevel && this.isCharging === other.isCharging
            && (this.device !== other.device ? this.device?.isEqual(other.device) ?? false : true)
            && equals<IFireTimestamp | undefined>(this.lastChargeDate, other.lastChargeDate)
            && this.lastNumOfCharges === other.lastNumOfCharges && this.lastChargeLevel === other.lastChargeLevel
            && this.prevNumOfCharges === other.prevNumOfCharges && equals<IFireTimestamp | undefined>(this.prevChargeDate, other.prevChargeDate) : true;
    }
}

