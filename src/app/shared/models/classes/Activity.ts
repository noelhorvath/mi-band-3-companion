import {IActivity} from "../interfaces/IActivity";
import {Device} from "./Device";

export class Activity implements IActivity {
    id: string;
    calories: number;
    distance: number;
    steps: number;
    device?: Device;

    constructor(id: string = '', calories: number = 0, distance: number = 0, steps: number = 0, device?: Device) {
        this.id = id ?? null;
        this.calories = calories;
        this.distance = distance;
        this.steps = steps;
        this.device = new Device();
        this.device.copy(device);
    }

    public copy(activity: Activity): void {
        this.id = activity?.id;
        this.calories = activity?.calories;
        this.distance = activity?.distance;
        this.steps = activity?.steps;
        this.device = new Device();
        this.device.copy(activity?.device);
    }
}
