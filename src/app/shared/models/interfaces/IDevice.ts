import { IService } from './IService';
import { IEntityModel } from './IEntityModel';

export interface IDevice extends IEntityModel<IDevice> {
    name: string;
    macAddress: string;
    lastUsedDate: string;
    services?: IService[] | undefined;
}
