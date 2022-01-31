import {IDevice} from "./IDevice";
import {IEntityModel} from "./IEntityModel";

export interface IUser extends IEntityModel<IUser> {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    devices?: IDevice[];
}

