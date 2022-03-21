import { IEntityModel } from './IEntityModel';
import { LogOptions } from '../../types/custom.types';

export interface ILogInfo extends IEntityModel<ILogInfo> {
    mainId: string;
    secondaryId: string;
    message: unknown | string;
    options?: LogOptions | undefined;
}
