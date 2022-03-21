import { IHeartRate } from '../interfaces/IHeartRate';
import { Device } from './Device';
import { objectToClass } from '../../functions/parser.functions';
import { IDevice } from '../interfaces/IDevice';
import { MeasurementDate } from './MeasurementDate';
import { IMeasurementDate } from '../interfaces/IMeasurementDate';

export class HeartRate implements IHeartRate {
    public id: string;
    public bpm: number;
    public device?: Device | undefined;
    public measurementDate?: MeasurementDate | undefined;

    public constructor(
        id: string = 'undefined',
        bpm: number = 0,
        device?: IDevice,
        measurementDate?: IMeasurementDate)
    {
        this.id = id;
        this.bpm = bpm;
        this.device = device !== undefined ? objectToClass<Device>(device as Device, Device) : device;
        this.measurementDate = measurementDate !== undefined ? objectToClass<MeasurementDate>(measurementDate as MeasurementDate, MeasurementDate) : measurementDate;
    }

    public copy(other: IHeartRate): void {
        if (!this.isEqual(other)) {
            this.id = other.id ?? 'undefined';
            this.bpm = other.bpm;

            if (this.device !== undefined && other.device !== undefined) {
                this.device.copy(other.device);
            } else {
                this.device = other.device !== undefined ? objectToClass<Device>(other.device as Device, Device) : other.device;
            }

            if (this.measurementDate !== undefined && other.measurementDate !== undefined) {
                this.measurementDate.copy(other.measurementDate);
            } else {
                this.measurementDate = other.measurementDate !== undefined ? objectToClass<MeasurementDate>(other.measurementDate as MeasurementDate, MeasurementDate) : other.measurementDate;
            }
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
