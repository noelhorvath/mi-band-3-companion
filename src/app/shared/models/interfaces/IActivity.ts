import {IEntityModel} from "./IEntityModel";
import {IDevice} from "./IDevice";

export interface IActivity extends IEntityModel<IActivity> {
    id: string;
    steps: number;
    distance: number;
    calories: number;
    device?: IDevice;
}
