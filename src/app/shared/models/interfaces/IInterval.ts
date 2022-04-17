import { IFireTimestamp } from './IFireTimestamp';
import { IEntityModel } from './IEntityModel';

export interface IInterval extends IEntityModel<IInterval> {
    start: IFireTimestamp;
    end: IFireTimestamp;
}
