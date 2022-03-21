import { IDevice } from './IDevice';
import { IEntityModel } from './IEntityModel';

export interface IUser extends IEntityModel<IUser> {
    email: string;
    firstName: string;
    lastName: string;
    id?: string;
    devices?: IDevice[] | undefined;

    getFullName?(): string;

    getCurrentlyUsedDevice?(): IDevice | undefined;
}

