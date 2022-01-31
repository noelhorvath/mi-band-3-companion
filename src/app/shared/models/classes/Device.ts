import {IDevice} from '../interfaces/IDevice';
import {Service} from "./Service";

export class Device implements IDevice {
    public name: string;
    public macAddress: string;
    public lastUsedDate: string;
    public services?: Service[];

    public constructor(name: string = '', macAddress: string = '', lastUsedDate: string = new Date().toISOString(), services?: Service[]) {
        this.name = name;
        this.macAddress = macAddress;
        this.lastUsedDate = lastUsedDate;
        this.services = services ? services.map(s => {
            const temp = new Service();
            temp.copy(s);
            return s;
        }) : services;

    }

    public copy(device: Device): void {
        if (!device) { return; }
        this.name = device?.name;
        this.macAddress = device?.macAddress;
        this.lastUsedDate = device?.lastUsedDate;
        this.services = device.services ? device.services.map(s => {
            const temp = new Service();
            temp.copy(s);
            return s;
        }) : undefined;
    }

}
