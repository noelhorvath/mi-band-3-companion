import { ITaskProgressInfo } from '../interfaces/ITaskProgressInfo';
import { ProgressStatus } from '../../types/custom.types';
import { ProgressStatusEnum } from '../../enums/progress-status.enum';

export class TaskProgressInfo implements ITaskProgressInfo {
    public status: ProgressStatus;
    public total: number | undefined;
    public processed: number | undefined;

    public constructor(
        status: ProgressStatus = ProgressStatusEnum.STARTED,
        total?,
        processed?
    ) {
        this.status = status;
        this.total = total;
        this.processed = processed;
    }

    public copy(other: ITaskProgressInfo): void {
        if (!this.isEqual(other)) {
            this.status = other.status;
            this.total = other.total;
            this.processed = other.processed;
        }
    }

    public isEqual(other: ITaskProgressInfo | undefined): boolean {
        return this.status === other?.status && this.total === other.total && this.processed === other.processed;
    }

    public toString(): string {
        return 'status: ' + this.status + ', total: ' + this.total + ', processed: ' + this.processed;
    }
}
