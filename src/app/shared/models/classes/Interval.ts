import { IInterval } from '../interfaces/IInterval';
import { FireTimestamp } from './FireTimestamp';
import { IFireTimestamp } from '../interfaces/IFireTimestamp';
import { copyProperty } from '../../functions/parser.functions';
import { equals } from '../../functions/comparison.functions';

export class Interval implements IInterval {
    public start!: FireTimestamp;
    public end!: FireTimestamp;

    public constructor(start: IFireTimestamp = { seconds: 0, nanoseconds: 0 }, end: IFireTimestamp = new FireTimestamp()) {
        copyProperty<IInterval, Interval, 'start', IFireTimestamp, FireTimestamp>(this, { start }, 'start', FireTimestamp);
        copyProperty<IInterval, Interval, 'end', IFireTimestamp, FireTimestamp>(this, { end }, 'end', FireTimestamp);
    }

    public copy(other: IInterval): void {
        if (!this.isEqual(other)) {
            copyProperty<IInterval, Interval, 'start', IFireTimestamp, FireTimestamp>(this, other, 'start', FireTimestamp);
            copyProperty<IInterval, Interval, 'end', IFireTimestamp, FireTimestamp>(this, other, 'end', FireTimestamp);
        }
    }

    public isEqual(other: IInterval | undefined): boolean {
        return this !== other ? equals<IFireTimestamp | undefined>(this.start, other?.start)
            && equals<IFireTimestamp | undefined>(this.end, other?.end) : true;
    }

    public toString(): string {
        return 'start: ' + this.start.toString() + ', end: ' + this.end.toString();
    }
}
