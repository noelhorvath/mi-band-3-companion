import { IService } from './IService';
import { IEntityModel } from './IEntityModel';
import { IFireTimestamp } from './IFireTimestamp';

export interface IDevice extends IEntityModel<IDevice> {
    name: string;
    macAddress: string;
    lastUsedDate: IFireTimestamp;
    services?: IService[] | undefined;
}
