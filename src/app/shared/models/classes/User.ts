import {IUser} from '../interfaces/IUser';
import {Device} from './Device';

export class User implements IUser {
    public id: string;
    public email: string;
    public firstName: string;
    public lastName: string;
    public devices?: Device[];

    public constructor(id: string = '', email: string = '', firstName: string = '', lastName: string = '', devices?: Device[]) {
        this.id = id;
        this.email = email;
        this.lastName = lastName;
        this.firstName = firstName;
        this.devices = devices ? devices.map(d => {
            const temp = new Device();
            temp.copy(d);
            return d;
        }) : undefined;
    }

    public copy(user: User): void {
        this.id = user?.id;
        this.email = user?.email;
        this.lastName = user?.lastName;
        this.firstName = user?.firstName;
        this.devices = user.devices ? user.devices.map(d => {
            const temp = new Device();
            temp.copy(d);
            return d;
        }) : undefined;
    }

    public getCurrentlyUsedDevice(): Device | null {
        if (!this.devices) { return null; }
        else if (this.devices.length === 1) { return this.devices[0]; }
        else {
            this.devices.sort(this.sortDevicesByLastUsedDateDesc);
        }
        return this.devices[0];
    }

    public sortDevicesByLastUsedDateDesc(a: Device, b: Device): number {
        return new Date(b.lastUsedDate).getTime() - new Date(a.lastUsedDate).getTime();
    }

    public getFullName(type: string = "en"): string {
        if (type.toLowerCase() == "hu") {
            return this.lastName + " " + this.firstName;
        }

        return this.firstName + " " + this.lastName;
    }

}
