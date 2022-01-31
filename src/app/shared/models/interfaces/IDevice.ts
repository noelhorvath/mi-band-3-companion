import {IService} from "./IService";

export interface IDevice {
    name: string;
    macAddress: string;
    lastUsedDate?: string;
    services?: IService[];
}
