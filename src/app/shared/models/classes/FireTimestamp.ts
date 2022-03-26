import { Timestamp } from '@angular/fire/firestore';
import { IFireTimestamp } from '../interfaces/IFireTimestamp';

export class FireTimestamp extends Timestamp implements IFireTimestamp {
    public override readonly seconds;
    public override readonly nanoseconds;

    public constructor(timestamp: IFireTimestamp = FireTimestamp.now()) {
        super(timestamp.seconds, timestamp.nanoseconds);
    }

    public static override fromDate(date: Date): FireTimestamp {
        return new FireTimestamp(Timestamp.fromDate(date));
    }

    public static override now(): FireTimestamp {
        return new FireTimestamp(Timestamp.now());
    }

    public static override fromMillis(milliseconds: number): FireTimestamp {
        return new FireTimestamp(Timestamp.fromMillis(milliseconds));
    }

    public override isEqual(other: IFireTimestamp | undefined): boolean {
        return other !== undefined ? super.isEqual(new FireTimestamp(other)) : false;
    }

    public override toString(): string {
        return this.toDate().toISOString();
    }

    public override toDate(): Date {
        return super.toDate();
    }

    public override toJSON(): IFireTimestamp {
        return super.toJSON();
    }

    public override toMillis(): number {
        return super.toMillis();
    }

    public override valueOf(): string {
        return super.valueOf();
    }
}
