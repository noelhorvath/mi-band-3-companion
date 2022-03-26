import { IHeartRate } from '../interfaces/IHeartRate';
import { Device } from './Device';
import { IDevice } from '../interfaces/IDevice';
import { MeasurementDate } from './MeasurementDate';
import { IMeasurementDate } from '../interfaces/IMeasurementDate';
import { copyProperty } from '../../functions/parser.functions';

export class HeartRate implements IHeartRate {
    public id: string;
    public bpm: number;
    public device: Device | undefined;
    public measurementDate: MeasurementDate | undefined;

    public constructor(
        id: string = 'undefined',
        bpm: number = 0,
        device?: IDevice,
        measurementDate?: IMeasurementDate)
    {
        this.id = id;
        this.bpm = bpm;
        copyProperty(this, { device } as Partial<IHeartRate>, 'device', Device);
        copyProperty(this, { measurementDate } as Partial<IHeartRate>, 'measurementDate', MeasurementDate);
    }

    public copy(other: IHeartRate): void {
        if (!this.isEqual(other)) {
            this.id = other.id ?? 'undefined';
            this.bpm = other.bpm;
            copyProperty(this, other, 'device', Device);
            copyProperty(this, other, 'measurementDate', MeasurementDate);
        }
    }

    public toString(): string {
        return 'id: ' + this.id + ', bpm: ' + this.bpm + ', device: ' + (this.device ? '{' + this.device.toString() + '}' : this.device)
            + 'measurementDate: ' + (this.measurementDate ? '{' + this.measurementDate.toString() + '}' : this.measurementDate);
    }

    public isEqual(other: IHeartRate | undefined): boolean {
        return this !== other ? this.id === other?.id && this.bpm === other.bpm
            && (this.device !== other.device ? this.device?.isEqual(other.device) ?? false : true)
            && (this.measurementDate !== other.measurementDate ? this.measurementDate?.isEqual(other.measurementDate) ?? false : true) : true;
    }
}
