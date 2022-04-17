import { IActivityInfo } from '../interfaces/IActivityInfo';
import { FireTimestamp } from './FireTimestamp';
import { IFireTimestamp } from '../interfaces/IFireTimestamp';
import { copyProperty, instantiate } from '../../functions/parser.functions';
import { equals } from '../../functions/comparison.functions';
import { DocumentData, FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions, WithFieldValue } from '@angular/fire/firestore';

export class ActivityInfo implements IActivityInfo {
    public id: string;
    public lastSynced!: FireTimestamp;

    public static getFirestoreConverter(): FirestoreDataConverter<ActivityInfo> {
        return {
            toFirestore: (instance: WithFieldValue<ActivityInfo> | Partial<ActivityInfo>): DocumentData => ({
                id: instance.id,
                lastSynced: (instance.lastSynced as FireTimestamp | undefined)?.toDate()
            }),
            fromFirestore: (snapshot: QueryDocumentSnapshot, options?: SnapshotOptions): ActivityInfo =>
                instantiate(snapshot.data(options) as IActivityInfo, ActivityInfo)
        };
    }

    public constructor(
        id: string = 'undefined',
        lastSynced: IFireTimestamp = FireTimestamp.fromDate(new Date(0))
    ) {
        this.id = id;
        copyProperty<IActivityInfo, ActivityInfo, 'lastSynced', IFireTimestamp, FireTimestamp>
            (this, { lastSynced }, 'lastSynced', FireTimestamp);
    }

    public isEqual(other: IActivityInfo | undefined): boolean {
        return this !== other ? this.id !== other?.id && equals<IFireTimestamp | undefined>(this.lastSynced, other?.lastSynced) : true;
    }

    public copy(other: IActivityInfo): void {
        if (!this.isEqual(other)) {
            this.id = other.id;
            copyProperty<IActivityInfo, ActivityInfo, 'lastSynced', IFireTimestamp, FireTimestamp>(this, other, 'lastSynced', FireTimestamp);
        }
    }

    public toString(): string {
        return ', id: ' + this.id + ', lastSynced: ' + this.lastSynced.toString();
    }
}
