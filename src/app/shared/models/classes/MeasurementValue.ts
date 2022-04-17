import { IMeasurementValue } from '../interfaces/IMeasurementValue';
import { DocumentData, FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions, WithFieldValue } from '@angular/fire/firestore';
import { instantiate } from '../../functions/parser.functions';

export class MeasurementValue implements IMeasurementValue {
    public avg: number;
    public max: number;
    public min: number;

    public static getFirestoreConverter(): FirestoreDataConverter<MeasurementValue> {
        return {
            toFirestore: (instance: WithFieldValue<MeasurementValue> | Partial<MeasurementValue>): DocumentData => ({
                avg: instance.avg,
                max: instance.max,
                min: instance.min
            }),
            fromFirestore: (snapshot: QueryDocumentSnapshot, options?: SnapshotOptions): MeasurementValue =>
                instantiate(snapshot.data(options) as IMeasurementValue, MeasurementValue)
        };
    }

    public constructor(avg: number = 0, max: number = Number.MIN_SAFE_INTEGER, min: number = Number.MAX_SAFE_INTEGER) {
        this.avg = avg;
        this.max = max;
        this.min = min;
    }

    public isEqual(other: IMeasurementValue | undefined): boolean {
        return this !== other ? this.avg === other?.avg && this.max === other.max && this.min === other.min : true;
    }

    public copy(other: IMeasurementValue): void {
        if (!this.isEqual(other)) {
            this.avg = other.avg ?? 0;
            this.max = other.max ?? 0;
            this.min = other.min ?? 0;
        }
    }

    public toString(): string {
        return 'avg: ' + this.avg + ', max: ' + this.max + ', min: ' + this.min;
    }
}
