import { IDevice } from './IDevice';
import { IEntityModel } from './IEntityModel';
import { IFireTimestamp } from './IFireTimestamp';
import { Gender } from '../../types/custom.types';

export interface IUser extends IEntityModel<IUser> {
    email: string;
    firstName: string;
    lastName: string;
    birthDate: IFireTimestamp;
    gender: Gender;
    weight: number;
    height: number;
    bandUserId: number;
    id?: string;
    devices?: IDevice[] | undefined;
    getFullName?(langCode?: string): string;
    getCurrentlyUsedDevice?(): IDevice | undefined;
}

