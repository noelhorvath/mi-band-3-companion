import { IEntityModel } from './IEntityModel';
import { IFireTimestamp } from './IFireTimestamp';

export interface IAuthSecurity extends IEntityModel<IAuthSecurity> {
    uuid: string;
    id?: string;
    lastAccountCreationDate?: IFireTimestamp | undefined;
    lastPasswordChangeRequestDate?: IFireTimestamp | undefined;
    lastEmailVerificationRequestDate?: IFireTimestamp | undefined;
}
