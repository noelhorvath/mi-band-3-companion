export const getDaysInCurrentMonth = (date: Date): number => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
export const getNumOfWeeksInCurrentMonth = (date: Date): number => {
    const monthStartDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay() === 0 ? 7 : new Date(date.getFullYear(), date.getMonth(), 1).getDay();
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

export const timePassedSinceDate = (date: Date | string | number): number =>
    typeof date === 'object' ? new Date().getTime() - date.getTime() : new Date().getTime() - new Date(date).getTime();
