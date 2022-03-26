import { IActivity } from '../interfaces/IActivity';
import { Device } from './Device';
import { IDevice } from '../interfaces/IDevice';
import { MeasurementDate } from './MeasurementDate';
import { IMeasurementDate } from '../interfaces/IMeasurementDate';
import { copyProperty } from '../../functions/parser.functions';

export class Activity implements IActivity {
    public id: string;
    public steps: number;
    public distance: number;
    public calories: number;
    public device: Device | undefined;
    public measurementDate: MeasurementDate | undefined;

    public constructor(
        id: string = 'undefined',
        calories: number = 0,
        distance: number = 0,
        steps: number = 0,
        device?: IDevice | undefined,
        measurementDate?: IMeasurementDate)
    {
        this.id = id;
        this.steps = steps;
        this.distance = distance;
        this.calories = calories;
        copyProperty(this, { device } as Partial<IActivity>, 'device', Device);
        copyProperty(this, { measurementDate } as Partial<IActivity>, 'measurementDate', MeasurementDate);
    }

    public copy(other: IActivity): void {
        if (!this.isEqual(other)) {
            this.id = other.id ?? 'undefined';
            this.steps = other.steps;
            this.distance = other.distance;
            this.calories = other.calories;
            copyProperty(this, other, 'device', Device);
            copyProperty(this, other, 'measurementDate', MeasurementDate);
        }
    }

    public toString(): string {
        return 'id: ' + this.id + ', calories: ' + this.calories + ', distance: ' + this.distance + ', steps: ' + this.steps
            + ', device: ' + (this.device ? '{' + this.device.toString() + '}' : this.device)
            + ', measurementDate: ' + (this.measurementDate ? '{' + this.measurementDate.toString() + '}' : this.measurementDate);
    }

    public isEqual(other: IActivity | undefined): boolean {
        return this !== other ? this.id === other?.id && this.calories === other.calories && this.distance === other.distance
            && this.steps === other.steps && (this.device !== other.device ? this.device?.isEqual(other.device) ?? false : true)
            && (this.measurementDate !== other?.measurementDate ? this.measurementDate?.isEqual(other.measurementDate) ?? false : true) : true;
    }
}
