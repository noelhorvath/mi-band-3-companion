import { IAuthSecurity } from '../interfaces/IAuthSecurity';

export class AuthSecurity implements IAuthSecurity {
    public id: string;
    public uuid: string;
    public lastAccountCreationDate: string | undefined;
    public lastEmailVerificationRequestDate: string | undefined;
    public lastPasswordChangeRequestDate: string | undefined;

    public constructor(
        id: string = 'undefined',
        uuid: string = 'unknown',
        lastAccountCreationDate?: string | Date,
        lastEmailVerificationRequestDate?: string | Date,
        lastPasswordChangeRequestDate?: string | Date)
    {
        this.id = id;
        this.uuid = uuid;
        this.lastAccountCreationDate = lastAccountCreationDate?.toString();
        this.lastEmailVerificationRequestDate = lastEmailVerificationRequestDate?.toString();
        this.lastPasswordChangeRequestDate = lastPasswordChangeRequestDate?.toString();
    }

    public copy(other: IAuthSecurity): void {
        if (!this.isEqual(other)) {
            this.id = other.id ?? 'undefined';
            this.uuid = other.uuid;
            this.lastAccountCreationDate = other.lastAccountCreationDate;
            this.lastEmailVerificationRequestDate = other.lastEmailVerificationRequestDate;
            this.lastPasswordChangeRequestDate = other.lastPasswordChangeRequestDate;
        }
    }

    public isEqual(other: IAuthSecurity | undefined): boolean {
        return this !== other ? this.id === other?.id && this.uuid === other.uuid && this.lastEmailVerificationRequestDate === other.lastEmailVerificationRequestDate
            && this.lastAccountCreationDate === other.lastAccountCreationDate && this.lastPasswordChangeRequestDate === other.lastPasswordChangeRequestDate : true;
    }

}
