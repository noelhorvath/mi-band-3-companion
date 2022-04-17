import { ScanResult } from './ScanResult';
import { IScanInfo } from '../interfaces/IScanInfo';
import { ScanStatus } from '../../types/custom.types';
import { IScanResult } from '../interfaces/IScanResult';
import { copyProperty, isArrayPropertyEqual } from '../../functions/parser.functions';
import { BLEScanStatus } from '../../enums/ble.enum';

export class ScanInfo implements IScanInfo {
    public status: ScanStatus;
    public isDisabled: boolean;
    public results: ScanResult[] | undefined;

    public constructor(
        status: ScanStatus = BLEScanStatus.NOT_SCANNING,
        isDisabled: boolean = false,
        results?: IScanResult[]
    ) {
        this.status = status;
        this.isDisabled = isDisabled;
        copyProperty(this, { results }, 'results', ScanResult);
    }

    public isScanning(): boolean {
        return this.status === BLEScanStatus.SCANNING && this.results === undefined;
    }

    public isFinished(): boolean {
        return this.status === BLEScanStatus.FINISHED && this.results !== undefined;
    }

    public copy(other: IScanInfo): void {
        if (!this.isEqual(other)) {
            this.status = other.status;
            this.isDisabled = other.isDisabled;
            copyProperty(this, other, 'results', ScanResult);
        }
    }

    public toString(): string {
        return 'status: ' + this.status + ', isDisabled: ' + this.isDisabled + ', results: '
            + (this.results !== undefined ? '[' + this.results.map((r: ScanResult) => r.toString()).toString() + ']' : this.results);
    }

    public isEqual(other: IScanInfo | undefined): boolean {
        if (this === other) {
            return true;
        } else if (other === undefined) {
            return false;
        } else {
            const res = this.status === other.status && this.isDisabled === other.isDisabled;
            return !res ? res : isArrayPropertyEqual(this, other, ScanInfo, 'results', ScanResult.getCompareFunction, 'address', 'asc');
        }
    }
}
