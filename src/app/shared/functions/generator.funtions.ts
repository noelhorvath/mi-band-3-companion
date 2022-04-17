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
