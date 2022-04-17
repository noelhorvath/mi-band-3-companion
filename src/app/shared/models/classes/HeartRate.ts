import { IHeartRate } from '../interfaces/IHeartRate';
import { MeasurementInfo } from './MeasurementInfo';
import { IMeasurementInfo } from '../interfaces/IMeasurementInfo';
import { copyProperty, instantiate } from '../../functions/parser.functions';
import { DocumentData, FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions, WithFieldValue } from '@angular/fire/firestore';
import { MeasurementValue } from './MeasurementValue';

export class HeartRate implements IHeartRate {
    public id: string;
    public bpm!: MeasurementValue;
    public measurementInfo!: MeasurementInfo;

    public static getFirestoreConverter(): FirestoreDataConverter<HeartRate> {
        return {
            toFirestore: (instance: WithFieldValue<HeartRate> | Partial<HeartRate>): DocumentData => ({
                id: instance.id,
                bpm: instance.bpm !== undefined
                    ? MeasurementValue.getFirestoreConverter().toFirestore(instance.bpm as MeasurementValue)
                    : instance.bpm,
                measurementInfo: instance.measurementInfo !== undefined
                    ? MeasurementInfo.getFirestoreConverter().toFirestore(instance.measurementInfo as MeasurementInfo)
                    : instance.measurementInfo
            }),
            fromFirestore: (snapshot: QueryDocumentSnapshot, options?: SnapshotOptions): HeartRate =>
                instantiate(snapshot.data(options) as IHeartRate, HeartRate)
        };
    }

    public constructor(
        id: string = 'undefined',
        bpm: MeasurementValue = new MeasurementValue(),
        measurementInfo: IMeasurementInfo = new MeasurementInfo()
    ) {
        this.id = id;
        copyProperty(this, { bpm }, 'bpm', MeasurementValue);
        copyProperty(this, { measurementInfo }, 'measurementInfo', MeasurementInfo);
    }

    public copy(other: IHeartRate): void {
        if (!this.isEqual(other)) {
            this.id = other.id ?? 'undefined';
            copyProperty(this, other, 'bpm', MeasurementValue);
            copyProperty(this, other, 'measurementInfo', MeasurementInfo);
        }
    }

    public toString(): string {
        return 'id: ' + this.id + ', bpm: ' + '{' + this.measurementInfo.toString() + '}'
            + ', measurementInfo: ' + '{' + this.measurementInfo.toString() + '}';
    }

    public isEqual(other: IHeartRate | undefined): boolean {
        return this !== other ? this.id === other?.id && this.bpm?.isEqual(other.bpm)
            && this.measurementInfo?.isEqual(other.measurementInfo) : true;
    }
}
