import { IAuthSecurity } from '../interfaces/IAuthSecurity';
import { equals } from '../../functions/comparison.functions';
import { FireTimestamp } from './FireTimestamp';
import { IFireTimestamp } from '../interfaces/IFireTimestamp';
import { copyProperty, instantiate } from '../../functions/parser.functions';
import { DocumentData, FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions, WithFieldValue } from '@angular/fire/firestore';

export class AuthSecurity implements IAuthSecurity {
    public id: string;
    public uuid: string;
    public lastAccountCreationDate: FireTimestamp | undefined;
    public lastEmailVerificationRequestDate: FireTimestamp | undefined;
    public lastPasswordChangeRequestDate: FireTimestamp | undefined;

    public static getFirestoreConverter(): FirestoreDataConverter<AuthSecurity> {
        return {
            toFirestore: (instance: WithFieldValue<AuthSecurity> | Partial<AuthSecurity>): DocumentData => ({
                id: instance.id,
                uuid: instance.uuid,
                lastAccountCreationDate: (instance.lastAccountCreationDate as FireTimestamp | undefined)?.toDate(),
                lastEmailVerificationRequestDate: (instance.lastEmailVerificationRequestDate as FireTimestamp | undefined)?.toDate(),
                lastPasswordChangeRequestDate: (instance.lastPasswordChangeRequestDate as FireTimestamp | undefined)?.toDate()
            }),
            fromFirestore: (snapshot: QueryDocumentSnapshot, options?: SnapshotOptions): AuthSecurity =>
                instantiate(snapshot.data(options) as IAuthSecurity, AuthSecurity)
        };
    }

    public constructor(
        id: string = 'undefined',
        uuid: string = 'undefined',
        lastAccountCreationDate?: IFireTimestamp,
        lastEmailVerificationRequestDate?: IFireTimestamp,
        lastPasswordChangeRequestDate?: IFireTimestamp
    ) {
        this.id = id;
        this.uuid = uuid;
        copyProperty<IAuthSecurity, AuthSecurity, 'lastAccountCreationDate', IFireTimestamp, FireTimestamp>
        (this, { lastAccountCreationDate }, 'lastAccountCreationDate', FireTimestamp);
        copyProperty<IAuthSecurity, AuthSecurity, 'lastEmailVerificationRequestDate', IFireTimestamp, FireTimestamp>
        (this, { lastEmailVerificationRequestDate }, 'lastEmailVerificationRequestDate', FireTimestamp);
        copyProperty<IAuthSecurity, AuthSecurity, 'lastPasswordChangeRequestDate', IFireTimestamp, FireTimestamp>
        (this, { lastPasswordChangeRequestDate }, 'lastPasswordChangeRequestDate', FireTimestamp);
    }

    public copy(other: IAuthSecurity): void {
        if (!this.isEqual(other)) {
            this.id = other.id ?? 'undefined';
            this.uuid = other.uuid;
            copyProperty<IAuthSecurity, AuthSecurity, 'lastAccountCreationDate', IFireTimestamp, FireTimestamp>
            (this, other, 'lastAccountCreationDate', FireTimestamp);
            copyProperty<IAuthSecurity, AuthSecurity, 'lastEmailVerificationRequestDate', IFireTimestamp, FireTimestamp>
            (this, other, 'lastEmailVerificationRequestDate', FireTimestamp);
            copyProperty<IAuthSecurity, AuthSecurity, 'lastPasswordChangeRequestDate', IFireTimestamp, FireTimestamp>
            (this, other, 'lastPasswordChangeRequestDate', FireTimestamp);
        }
    }

    public toString(): string {
        return 'id: ' + this.id + ', uuid: ' + this.uuid + ', lastAccountCreationDate: ' + this.lastAccountCreationDate?.toDate().toISOString()
            + ', lastEmailVerificationRequestDate: ' + this.lastEmailVerificationRequestDate?.toString()
            + ', lastPasswordChangeRequestDate: ' + this.lastPasswordChangeRequestDate?.toString();
    }

    public isEqual(other: IAuthSecurity | undefined): boolean {
        return this !== other ? this.id === other?.id && this.uuid === other.uuid
            && equals<IFireTimestamp | undefined>(this.lastEmailVerificationRequestDate, other.lastEmailVerificationRequestDate)
            && equals<IFireTimestamp | undefined>(this.lastAccountCreationDate, other.lastAccountCreationDate)
            && equals<IFireTimestamp | undefined>(this.lastPasswordChangeRequestDate, other.lastPasswordChangeRequestDate) : true;
    }

}
