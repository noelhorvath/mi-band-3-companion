import { IEntityModel } from './IEntityModel';
import { ProgressStatus } from '../../types/custom.types';

export interface ITaskProgressInfo extends IEntityModel<ITaskProgressInfo> {
    status: ProgressStatus;
    total?: number | undefined;
    processed?: number | undefined;
}
