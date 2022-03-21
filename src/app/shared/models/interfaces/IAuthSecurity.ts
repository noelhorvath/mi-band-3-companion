import { IEntityModel } from './IEntityModel';

export interface IAuthSecurity extends IEntityModel<IAuthSecurity> {
    id?: string;
    uuid: string;
    lastAccountCreationDate?: string | undefined;
    lastPasswordChangeRequestDate?: string | undefined;
    lastEmailVerificationRequestDate?: string | undefined;
}
