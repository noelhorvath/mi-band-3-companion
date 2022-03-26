import { IFireTimestamp } from '../models/interfaces/IFireTimestamp';
import { FireTimestamp } from '../models/classes/FireTimestamp';
import { instantiate } from './parser.functions';

export const getDaysInCurrentMonth = (date: Date | IFireTimestamp): number => {
    let dateObj: Date;
    if (date instanceof Date) {
        dateObj = date;
    } else {
        dateObj = date instanceof FireTimestamp ? date.toDate() : instantiate(date, FireTimestamp).toDate();
    }
    return new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0).getDate();
};

export const getNumOfWeeksInCurrentMonth = (date: Date | IFireTimestamp): number => {
    let dateObj: Date;
    if (date instanceof Date) {
        dateObj = date;
    } else {
        dateObj = date instanceof FireTimestamp ? date.toDate() : instantiate(date, FireTimestamp).toDate();
    }
    const monthStartDay = new Date(dateObj.getFullYear(), dateObj.getMonth(), 1).getDay() === 0 ? 7 : new Date(dateObj.getFullYear(), dateObj.getMonth(), 1).getDay();
    return Math.ceil((getDaysInCurrentMonth(date) - 7 + monthStartDay) / 7) + 1;
};
export const generateArrayOfNumbers = (start: number, end: number): number[] => {
    const array: number[] = [];
    for (let i = start; i < end; i++) {
        array.push(i);
    }
    return array;
};
export const generateStringArrayOfNumbers = (start: number, end: number): string[] => {
    const array: string[] = [];
    for (let i = start; i < end; i++) {
        array.push(i.toString(10));
    }
    return array;
};

export const timeDifferenceInSeconds = (a: IFireTimestamp, b: IFireTimestamp): number =>
    (a instanceof FireTimestamp ? a : instantiate(a, FireTimestamp)).seconds
    - (b instanceof FireTimestamp ? b : instantiate(b, FireTimestamp)).seconds;
