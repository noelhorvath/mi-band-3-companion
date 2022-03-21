import { ScanResult } from './ScanResult';
import { IScanInfo } from '../interfaces/IScanInfo';
import { ScanStatus } from '../../types/custom.types';
import { IScanResult } from '../interfaces/IScanResult';
import { objectToClass } from '../../functions/parser.functions';
import { BLEScanStatus } from '../../enums/ble.enum';

export class ScanInfo implements IScanInfo {
    public status: ScanStatus;
    public isDisabled: boolean;
    public results?: ScanResult[] | undefined;

    public constructor(
        status: ScanStatus = BLEScanStatus.NOT_SCANNING,
        isDisabled: boolean = false,
        results?: IScanResult[])
    {
        this.status = status;
        this.isDisabled = isDisabled;
        this.results = results?.map((scanResult: IScanResult) => objectToClass<ScanResult>(scanResult as ScanResult, ScanResult));
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
            this.results = other.results?.map((scanResult: IScanResult) => objectToClass<ScanResult>(scanResult as ScanResult, ScanResult));
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
            if (!res) {
                return res;
            }
            let areScanResultsEqual = false;
            if (this.results === other.results) {
                areScanResultsEqual = true;
            } else if (this.results === undefined || other.results === undefined || this.results.length !== other.results.length) {
                areScanResultsEqual = false;
            } else {
                const resultsThis = objectToClass<ScanInfo>(this, ScanInfo).results?.sort(ScanResult.getCompareFunction('address', 'asc'));
                const resultsOther = objectToClass<ScanInfo>(other as ScanInfo, ScanInfo).results?.sort(ScanResult.getCompareFunction('address', 'asc'));
                if (resultsThis !== undefined && resultsOther !== undefined) {
                    for (let i = 0; i < resultsThis.length; i++) {
                        if (!resultsThis[i].isEqual(resultsOther[i])) {
                            break;
                        }

                        if (i === resultsThis.length - 1) {
                            areScanResultsEqual = true;
                        }
                    }
                }
            }
            return areScanResultsEqual;
        }
    }
}
