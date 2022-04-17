import { IFireTimestamp } from '../models/interfaces/IFireTimestamp';
import { FireTimestamp } from '../models/classes/FireTimestamp';
import { instantiate } from './parser.functions';
import { Interval } from '../models/classes/Interval';
import { IntervalType } from '../types/custom.types';

export const getDaysInMonth = (date: Date | IFireTimestamp): number => {
    let dateObj: Date;
    if (date instanceof Date) {
        dateObj = date;
    } else {
        dateObj = date instanceof FireTimestamp ? date.toDate() : instantiate(date, FireTimestamp).toDate();
    }
    return new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0).getDate();
};

export const timeDifferenceInSeconds = (a: IFireTimestamp, b: IFireTimestamp): number =>
    (a instanceof FireTimestamp ? a : instantiate(a, FireTimestamp)).seconds
    - (b instanceof FireTimestamp ? b : instantiate(b, FireTimestamp)).seconds;


export const getInterval = (intervalType: IntervalType): Interval => {
    const current = new Date();
    let startDate: Date = new Date();
    let endDate: Date = new Date();
    switch (intervalType) {
        case 'today':
            const tzOffset = new Date().getTimezoneOffset() / 60;
            startDate = new Date(Date.UTC(current.getFullYear(), current.getMonth(), current.getDate(), tzOffset, 0, 0, 0));
            endDate = new Date(Date.UTC(current.getFullYear(), current.getMonth(), current.getDate(), 23 + tzOffset, 0, 0, 0));
            return new Interval(FireTimestamp.fromDate(startDate), FireTimestamp.fromDate(endDate));
        case 'this_week':
            const currentDay = current.getDay() === 0 ? 6 : current.getDay() - 1;
            startDate = new Date(Date.UTC(current.getFullYear(), current.getMonth(), current.getDate() - currentDay, 0, 0, 0, 0));
            endDate = new Date(Date.UTC(current.getFullYear(), current.getMonth(), current.getDate() + (6 - currentDay), 23, 0, 0, 0));
            return new Interval(FireTimestamp.fromDate(startDate), FireTimestamp.fromDate(endDate));
        case 'this_month':
            const daysInMonth = getDaysInMonth(startDate);
            startDate = new Date(Date.UTC(current.getFullYear(), current.getMonth(), 1, 0, 0, 0, 0));
            endDate = new Date(Date.UTC(current.getFullYear(), current.getMonth(), daysInMonth, 23, 0, 0, 0));
            return new Interval(FireTimestamp.fromDate(startDate), FireTimestamp.fromDate(endDate));
        case 'this_year':
            startDate = new Date(Date.UTC(current.getFullYear(), 0, 1, 0, 0, 0, 0));
            endDate = new Date(Date.UTC(current.getFullYear(), 11, 31, 23, 0, 0, 0));
            return new Interval(FireTimestamp.fromDate(startDate), FireTimestamp.fromDate(endDate));
        default:
            return new Interval(FireTimestamp.fromDate(startDate), FireTimestamp.fromDate(endDate));
    }
};

export const isLeapYear = (date: Date | IFireTimestamp): boolean => {
    const dateObj = date instanceof FireTimestamp ? date.toDate() : ('seconds' in date ? instantiate(date, FireTimestamp).toDate() : date);
    return new Date(dateObj.getFullYear(), 1, 29).getDate() === 29;
};
