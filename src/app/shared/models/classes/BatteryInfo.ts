import { IBatteryInfo } from '../interfaces/IBatteryInfo';
import { copyProperty, instantiate } from '../../functions/parser.functions';
import { FireTimestamp } from './FireTimestamp';
import { IFireTimestamp } from '../interfaces/IFireTimestamp';
import { equals } from '../../functions/comparison.functions';
import { DocumentData, FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions, WithFieldValue } from '@angular/fire/firestore';

export class BatteryInfo implements IBatteryInfo {
    public id: string;
    public batteryLevel: number;
    public isCharging: boolean;
    public deviceRef: string | undefined;
    public lastChargeDate: FireTimestamp | undefined;
    public lastNumOfCharges: number | undefined;
    public lastChargeLevel: number | undefined;
    public prevChargeDate: FireTimestamp | undefined;
    public prevNumOfCharges: number | undefined;
    // public unknown_value?: number | undefined;

    public static getFirestoreConverter(): FirestoreDataConverter<BatteryInfo> {
        return {
            toFirestore: (instance: WithFieldValue<BatteryInfo> | Partial<BatteryInfo>): DocumentData => ({
                id: instance.id,
                batteryLevel: instance.batteryLevel,
                isCharging: instance.isCharging,
                deviceRef: instance.deviceRef,
                lastChargeDate: (instance.lastChargeDate as FireTimestamp | undefined)?.toDate(),
                lastChargeLevel: instance.lastChargeLevel,
                lastNumOfCharges: instance.lastNumOfCharges,
                prevChargeDate: (instance.prevChargeDate as FireTimestamp | undefined)?.toDate(),
                prevNumOfCharges: instance.prevNumOfCharges
            }),
            fromFirestore: (snapshot: QueryDocumentSnapshot, options?: SnapshotOptions): BatteryInfo =>
                instantiate(snapshot.data(options) as IBatteryInfo, BatteryInfo)
        };
    }

    public constructor(
        id: string = 'undefined',
        batteryLevel: number = 0,
        isCharging: boolean = false,
        deviceRef?: string,
        lastChargeDate?: IFireTimestamp,
        lastChargeLevel?: number,
        lastNumOfCharges?: number,
        prevChargeDate?: IFireTimestamp,
        prevNumOfCharges?: number
    ) {
        this.id = id;
        this.batteryLevel = batteryLevel;
        this.isCharging = isCharging;
        this.deviceRef = deviceRef;
        copyProperty<IBatteryInfo, BatteryInfo, 'lastChargeDate', IFireTimestamp, FireTimestamp>
        (this, { lastChargeDate }, 'lastChargeDate', FireTimestamp);
        this.lastChargeLevel = lastChargeLevel;
        this.prevNumOfCharges = prevNumOfCharges;
        copyProperty<IBatteryInfo, BatteryInfo, 'prevChargeDate', IFireTimestamp, FireTimestamp>
        (this, { prevChargeDate }, 'prevChargeDate', FireTimestamp);
        this.lastNumOfCharges = lastNumOfCharges;
    }


    public copy(other: IBatteryInfo): void {
        if (!this.isEqualTo(other)) {
            this.id = other.id ?? 'undefined';
            this.batteryLevel = other.batteryLevel;
            this.isCharging = other.isCharging;
            this.deviceRef = other.deviceRef;
            copyProperty<IBatteryInfo, BatteryInfo, 'lastChargeDate', IFireTimestamp, FireTimestamp>(this, other, 'lastChargeDate', FireTimestamp);
            this.lastNumOfCharges = other.lastNumOfCharges;
            this.lastChargeLevel = other.lastChargeLevel;
            copyProperty<IBatteryInfo, BatteryInfo, 'prevChargeDate', IFireTimestamp, FireTimestamp>(this, other, 'prevChargeDate', FireTimestamp);
            this.prevNumOfCharges = other.prevNumOfCharges;
        }
    }

    public toString(): string {
        return 'id: ' + this.id + ', deviceRef: ' + this.deviceRef
            + ', batteryLevel: ' + this.batteryLevel + ', isCharging: ' + this.isCharging
            + ', prevChargeDate: ' + this.prevChargeDate?.toString()
            + ', prevNumOfCharges: ' + this.prevNumOfCharges
            + ', lastChargeDate: ' + this.lastChargeDate?.toString()
            + ', lastNumOfCharges: ' + this.lastNumOfCharges + ', lastChargeLevel: ' + this.lastChargeLevel;
    }

    public isEqualTo(other: IBatteryInfo | undefined): boolean {
        return this !== other ? this.id === other?.id && this.batteryLevel === other.batteryLevel && this.isCharging === other.isCharging
            && this.deviceRef === other.deviceRef && equals<IFireTimestamp | undefined>(this.lastChargeDate, other.lastChargeDate)
            && this.lastNumOfCharges === other.lastNumOfCharges && this.lastChargeLevel === other.lastChargeLevel
            && this.prevNumOfCharges === other.prevNumOfCharges && equals<IFireTimestamp | undefined>(this.prevChargeDate, other.prevChargeDate) : true;
    }
}

