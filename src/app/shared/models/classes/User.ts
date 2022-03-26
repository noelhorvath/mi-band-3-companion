import { IUser } from '../interfaces/IUser';
import { Device } from './Device';
import { IDevice } from '../interfaces/IDevice';
import { copyProperty, isArrayPropertyEqual } from '../../functions/parser.functions';

export class User implements IUser {
    public id: string;
    public email: string;
    public firstName: string;
    public lastName: string;
    public devices?: Device[] | undefined;

    public constructor(
        id: string = 'undefined',
        email: string = 'undefined',
        firstName: string = 'undefined',
        lastName: string = 'undefined',
        devices?: IDevice[])
    {
        this.id = id;
        this.email = email;
        this.lastName = lastName;
        this.firstName = firstName;
        copyProperty(this, { devices } as Partial<User>, 'devices', Device);
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
        return 'id: ' + this.id + ', email: ' + this.email + ', firstName: ' + this.firstName + ', lastName: ' + this.lastName
            + ', devices: ' + (this.devices !== undefined ? '[' + this.devices.map((d: Device) => d.toString()).toString() + ']' : this.devices);
    }

    public copy(other: IUser): void {
        if (!this.isEqual(other)) {
            this.id = other.id ?? 'undefined';
            this.email = other.email;
            this.lastName = other.lastName;
            this.firstName = other.firstName;
            copyProperty(this, other, 'devices', Device);
        }
    }

    public isEqual(other: IUser | undefined): boolean {
        if (this === other) {
            return true;
        } else if (other === undefined) {
            return false;
        } else {
            const res = this.id === other.id && this.email === other.email && this.firstName === other.firstName && this.lastName === other.lastName;
            return !res ? res : isArrayPropertyEqual(this, other, User, 'devices', Device.getCompareFunction, 'macAddress', 'asc');
        }
    }
}
