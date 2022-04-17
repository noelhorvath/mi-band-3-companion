import { IActivity } from '../interfaces/IActivity';
import { MeasurementInfo } from './MeasurementInfo';
import { IMeasurementInfo } from '../interfaces/IMeasurementInfo';
import { copyProperty, instantiate } from '../../functions/parser.functions';
import { DocumentData, FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions, WithFieldValue } from '@angular/fire/firestore';
import { MeasurementValue } from './MeasurementValue';

export class Activity implements IActivity {
    public id: string;
    public steps: number;
    public distance: number;
    public calories: number;
    public intensity!: MeasurementValue;
    public measurementInfo!: MeasurementInfo;

    public static getFirestoreConverter(): FirestoreDataConverter<Activity> {
        return {
            toFirestore: (instance: WithFieldValue<Activity> | Partial<Activity>): DocumentData => ({
                id: instance.id,
                steps: instance.steps,
                distance: instance.distance,
                calories: instance.calories,
                intensity: instance.intensity !== undefined
                    ? MeasurementValue.getFirestoreConverter().toFirestore(instance.intensity as MeasurementValue)
                    : instance.intensity,
                measurementInfo: instance.measurementInfo !== undefined
                    ? MeasurementInfo.getFirestoreConverter().toFirestore(instance.measurementInfo as MeasurementInfo)
                    : instance.measurementInfo
            }),
            fromFirestore: (snapshot: QueryDocumentSnapshot, options?: SnapshotOptions): Activity =>
                instantiate(snapshot.data(options) as IActivity, Activity)
        };
    }

    public constructor(
        id: string = 'undefined',
        steps: number = 0,
        distance: number = -1,
        calories: number = -1,
        intensity: MeasurementValue = new MeasurementValue(),
        measurementInfo: IMeasurementInfo = new MeasurementInfo()
    ) {
        this.id = id;
        this.steps = steps;
        this.distance = distance;
        this.calories = calories;
        copyProperty(this, { intensity }, 'intensity', MeasurementValue);
        copyProperty(this, { measurementInfo }, 'measurementInfo', MeasurementInfo);
    }

    public copy(other: IActivity): void {
        if (!this.isEqual(other)) {
            this.id = other.id ?? 'undefined';
            this.steps = other.steps ?? -1;
            this.distance = other.distance ?? -1;
            this.calories = other.calories ?? -1;
            copyProperty(this, other, 'intensity', MeasurementValue);
            copyProperty(this, other, 'measurementInfo', MeasurementInfo);
        }
    }

    public toString(): string {
        return 'id: ' + this.id + ', calories: ' + this.calories + ', distance: ' + this.distance
            + ', steps: ' + this.steps + ', intensity: ' + '{' + this.intensity.toString() + '}'
            + ', measurementInfo: ' + '{' + this.measurementInfo.toString() + '}';
    }

    public isEqual(other: IActivity | undefined): boolean {
        return this !== other ? this.id === other?.id && this.calories === other.calories && this.distance === other.distance
            && this.steps === other.steps && this.intensity.isEqual(other.intensity)
            && this.measurementInfo.isEqual(other.measurementInfo) : true;
    }
}
