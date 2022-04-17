import { IScanResult } from '../interfaces/IScanResult';
import { compareNumbers, compareStrings } from '../../functions/comparison.functions';
import { OrderByDirection } from '@angular/fire/firestore';

export class ScanResult implements IScanResult {
    public address: string;
    public name: string;
    public rssi: number;

    private static sortByAddressAsc(a: IScanResult, b: IScanResult): number {
        return a.address === b.address ? ScanResult.sortByNameAsc(a, b) : compareStrings(a.address, b.address);
    }

    private static sortByAddressDesc(a: IScanResult, b: IScanResult): number {
        return b.address === a.address ? ScanResult.sortByNameDesc(a, b) : compareStrings(b.address, a.address);
    }

    private static sortByNameAsc(a: IScanResult, b: IScanResult): number {
        return a.name === b.name ? ScanResult.sortByRssiAsc(a, b) : compareStrings(a.name, b.name);
    }

    private static sortByNameDesc(a: IScanResult, b: IScanResult): number {
        return b.name === a.name ? ScanResult.sortByRssiDesc(a, b) : compareStrings(b.name, a.name);
    }

    private static sortByRssiAsc(a: IScanResult, b: IScanResult): number {
        return compareNumbers(a.rssi, b.rssi);
    }

    private static sortByRssiDesc(a: IScanResult, b: IScanResult): number {
        return compareNumbers(b.rssi, a.rssi);
    }

    public static getCompareFunction(propertyName: string, direction: OrderByDirection): (a: IScanResult, b: IScanResult) => number {
        if (propertyName === 'address') {
            return direction === 'asc' ? ScanResult.sortByAddressAsc : ScanResult.sortByAddressDesc;
        } else if (propertyName === 'name') {
            return direction === 'asc' ? ScanResult.sortByNameAsc : ScanResult.sortByNameDesc;
        } else if (propertyName === 'rssi') {
            return direction === 'asc' ? ScanResult.sortByRssiAsc : ScanResult.sortByRssiDesc;
        }
        throw new Error('Invalid property name');
    }

    public constructor(
        address: string = 'undefined',
        name: string = 'undefined',
        rssi: number = 0
    ) {
        this.address = address;
        this.name = name;
        this.rssi = rssi;
    }

    public toString(): string {
        return 'address: ' + this.address + ', name: ' + this.name + ', rssi: ' + this.rssi;
    }

    public copy(other: IScanResult): void {
        if (!this.isEqual(other)) {
            this.address = other.address;
            this.name = other.name;
            this.rssi = other.rssi;
        }
    }

    public isEqual(other: IScanResult | undefined): boolean {
        return this !== other ? this.address === other?.address && this.name === other.name
            && this.rssi === other.rssi : true;
    }
}
