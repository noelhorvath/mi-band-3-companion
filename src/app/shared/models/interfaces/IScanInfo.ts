import { IEntityModel } from './IEntityModel';
import { IScanResult } from './IScanResult';
import { ScanStatus } from '../../types/custom.types';

export interface IScanInfo extends IEntityModel<IScanInfo> {
    status: ScanStatus;
    isDisabled: boolean;
    results?: IScanResult[] | undefined;
    id?: string;

    isScanning?(): boolean;

    isFinished?(): boolean;
}
