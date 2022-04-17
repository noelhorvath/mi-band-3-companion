import { IFireTimestamp } from '../models/interfaces/IFireTimestamp';

export const compareNumbers = (a: number, b: number): number => a - b;

export const compareStrings = (a: string, b: string): number => a.localeCompare(b);

export const compareNumericStrings = (a: string, b: string): number => a.localeCompare(b, undefined, { numeric: true });

export const compareDates = (a: Date | number | string, b: Date | number | string): number => (a instanceof Date && b instanceof Date)
    ? compareNumbers(a.getTime(), b.getTime()) : compareNumbers(new Date(a).getTime(), new Date(b).getTime());

export const compareTimestamps = (a: IFireTimestamp, b: IFireTimestamp): number => {
    const res = compareNumbers(a.seconds, b.seconds);
    return res === 0 ? compareNumbers(a.nanoseconds, b.nanoseconds) : res;
};

export const equals = <T>(a: T, b: T): boolean => {
    if (a === b) {
        return a === b;
    } else if (a === undefined || b === undefined) {
        return a === b;
    } else if (a instanceof Date && b instanceof Date) {
        return compareDates(a, b) === 0;
    } else if ('seconds' in a && 'nanoseconds' in a && 'seconds' in b && 'nanoseconds' in b) {
        return compareTimestamps(a as unknown as IFireTimestamp, b as unknown as IFireTimestamp) === 0;
    } else {
        return a === b;
    }
};
