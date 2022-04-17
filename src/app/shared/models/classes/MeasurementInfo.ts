import { IMeasurementInfo } from '../interfaces/IMeasurementInfo';
import { DateTypeEnum } from '../../enums/date.enum';
import { IFireTimestamp } from '../interfaces/IFireTimestamp';
import { FireTimestamp } from './FireTimestamp';
import { copyProperty, instantiate } from '../../functions/parser.functions';
import { equals } from '../../functions/comparison.functions';
import { DateType } from '../../types/custom.types';
import { DocumentData, FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions, WithFieldValue } from '@angular/fire/firestore';

export class MeasurementInfo implements IMeasurementInfo {
    public deviceRef: string;
    public type: DateType;
    public date!: FireTimestamp;

    public static getFirestoreConverter(): FirestoreDataConverter<MeasurementInfo> {
        return {
            toFirestore: (instance: WithFieldValue<MeasurementInfo> | Partial<MeasurementInfo>): DocumentData => ({
                deviceRef: instance.deviceRef,
                type: instance.type,
                date: (instance.date as FireTimestamp | undefined)?.toDate()
            }),
            fromFirestore: (snapshot: QueryDocumentSnapshot, options?: SnapshotOptions): MeasurementInfo =>
                instantiate(snapshot.data(options) as IMeasurementInfo, MeasurementInfo)
        };
    }

    public constructor(
        deviceRef: string = 'undefined',
        date: IFireTimestamp = FireTimestamp.now(),
        type: DateTypeEnum = DateTypeEnum.PER_MINUTE,
    ) {
        this.type = type;
        copyProperty<IMeasurementInfo, MeasurementInfo, 'date', IFireTimestamp, FireTimestamp>(this, { date }, 'date', FireTimestamp);
        this.deviceRef = deviceRef;
    }

    public copy(other: IMeasurementInfo): void {
        if (!this.isEqual(other)) {
            this.type = other.type;
            copyProperty<IMeasurementInfo, MeasurementInfo, 'date', IFireTimestamp, FireTimestamp>(this, other, 'date', FireTimestamp);
            this.deviceRef = other.deviceRef;
        }
    }

    public toString(): string {
        return 'type: ' + this.date + ', date: ' + this.date.toString() + '. deviceRef: ' + this.deviceRef;
    }

    public isEqual(other: IMeasurementInfo | undefined): boolean {
        return this !== other ? this.type === other?.type && this.deviceRef === other.deviceRef
            && equals<IFireTimestamp>(this.date, other.date) : true;
    }
}
