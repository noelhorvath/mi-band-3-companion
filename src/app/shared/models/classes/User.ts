import { IUser } from '../interfaces/IUser';
import { Device } from './Device';
import { IDevice } from '../interfaces/IDevice';
import { copyProperty, instantiate, isArrayPropertyEqual } from '../../functions/parser.functions';
import { Gender } from '../../types/custom.types';
import { IFireTimestamp } from '../interfaces/IFireTimestamp';
import { FireTimestamp } from './FireTimestamp';
import { equals } from '../../functions/comparison.functions';
import { DocumentData, FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions, WithFieldValue } from '@angular/fire/firestore';

export class User implements IUser {
    public id: string;
    public email: string;
    public firstName: string;
    public lastName: string;
    public birthDate!: FireTimestamp;
    public gender: Gender;
    public weight: number;
    public height: number;
    public bandUserId: number;
    public devices: Device[] | undefined;

    public static getFirestoreConverter(): FirestoreDataConverter<User> {
        return {
            toFirestore: (instance: WithFieldValue<User> | Partial<User>): DocumentData => ({
                id: instance.id,
                email: instance.email,
                firstName: instance.firstName,
                lastName: instance.lastName,
                birthDate: (instance.birthDate as FireTimestamp | undefined)?.toDate(),
                gender: instance.gender,
                weight: instance.weight,
                height: instance.height,
                bandUserId: instance.bandUserId,
                devices: (instance.devices as (Device[] | undefined))?.map( (device: Device) =>
                    Device.getFirestoreConverter().toFirestore(device))
            }),
            fromFirestore: (snapshot: QueryDocumentSnapshot, options?: SnapshotOptions): User =>
                instantiate(snapshot.data(options) as IUser, User)
        };
    }

    public constructor(
        id: string = 'undefined',
        email: string = 'undefined',
        firstName: string = 'undefined',
        lastName: string = 'undefined',
        birthDate: IFireTimestamp = FireTimestamp.now(),
        gender: Gender = 'other',
        weight: number = 0,
        height: number = 0,
        bandUserId: number = -1,
        devices?: IDevice[]
    ) {
        this.id = id;
        this.email = email;
        this.lastName = lastName;
        this.firstName = firstName;
        copyProperty<IUser, User, 'birthDate', IFireTimestamp, FireTimestamp>
        (this, { birthDate }, 'birthDate', FireTimestamp);
        this.gender = gender;
        this.weight = weight;
        this.height = height;
        this.bandUserId = bandUserId;
        copyProperty(this, { devices }, 'devices', Device);
    }


    public getCurrentlyUsedDevice(): Device | undefined {
        if (!this.devices) {
            return undefined;
        } else if (this.devices.length > 1) {
            this.devices.sort(Device.getCompareFunction('lastUsedDate', 'desc'));
        }
        return this.devices[0];
    }

    public getFullName(langCode: string = 'en'): string {
        if (langCode.toLowerCase() === 'hu') {
            return this.lastName + ' ' + this.firstName;
        } else if (langCode.toLowerCase() === 'en') {
            return this.firstName + ' ' + this.lastName;
        } else {
            throw new Error('unknown langCode type');
        }
    }

    public toString(): string {
        return 'id: ' + this.id + ', email: ' + this.email + ', firstName: ' + this.firstName
            + ', lastName: ' + this.lastName + ', birthDate: ' + this.birthDate.toString()
            + ', gender: ' + this.gender + ', weight: ' + this.weight + ', height: ' + this.height + ', bandUserId: ' + this.bandUserId
            + ', devices: ' + (this.devices !== undefined ? '[' + this.devices.map((d: Device) => d.toString()).toString() + ']' : this.devices);
    }

    public copy(other: IUser): void {
        if (!this.isEqual(other)) {
            this.id = other.id ?? 'undefined';
            this.email = other.email;
            this.lastName = other.lastName;
            this.firstName = other.firstName;
            copyProperty<IUser, User, 'birthDate', IFireTimestamp, FireTimestamp>
            (this, other, 'birthDate', FireTimestamp);
            this.gender = other.gender;
            this.weight = other.weight;
            this.height = other.height;
            this.bandUserId = other.bandUserId;
            copyProperty(this, other, 'devices', Device);
        }
    }

    public isEqual(other: IUser | undefined): boolean {
        if (this === other) {
            return true;
        } else if (other === undefined) {
            return false;
        } else {
            const res = this.id === other.id && this.email === other.email && this.firstName === other.firstName
                && this.lastName === other.lastName && this.gender === other.gender && this.height === other.height
                && this.weight === other.weight && this.bandUserId === other.bandUserId && equals<IFireTimestamp>(this.birthDate, other.birthDate);
            return !res ? res : isArrayPropertyEqual(this, other, User, 'devices', Device.getCompareFunction, 'macAddress', 'asc');
        }
    }
}
