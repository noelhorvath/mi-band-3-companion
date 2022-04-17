import { IFireTimestamp } from './IFireTimestamp';
import { IEntityModel } from './IEntityModel';

export interface IActivityInfo extends IEntityModel<IActivityInfo> {
    id: string;
    lastSynced: IFireTimestamp;
}
