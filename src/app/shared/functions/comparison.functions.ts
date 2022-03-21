export const compareNumbers = (a: number, b: number): number => a - b;
export const compareStrings = (a: string, b: string): number => a.localeCompare(b);
export const compareNumericStrings = (a: string, b: string): number => a.localeCompare(b, undefined, { numeric: true });
export const compareDates = (a: Date | number | string, b: Date | number | string): number => (a instanceof Date && b instanceof Date)
    ? compareNumbers(a.getTime(), b.getTime()) : compareNumbers(new Date(a).getTime(), new Date(b).getTime());

// TODO: improve generic equality checking
export const equals = <T>(a: T, b: T): boolean => {
    if (a instanceof Date && b instanceof Date) {
        return compareDates(a, b) === 0;
    } else {
        return a === b;
    }
};
