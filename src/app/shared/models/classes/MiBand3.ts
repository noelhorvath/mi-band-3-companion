import {Service} from './Service';
import {Device} from "./Device";
import {IService} from "../interfaces/IService";
import {miBand3BLEData} from "../constants/MiBand3BLEData";

export class MiBand3 extends Device {
    public readonly name: string;
    public readonly services: Service[];
    private static instance: MiBand3;

    private constructor() {
        super('Mi Band 3');
        this.services = this.jsonArrayToClasses<IService, Service>(miBand3BLEData(), Service);
    }

    public static getInstance() {
        if (!MiBand3.instance) { this.instance = new MiBand3() }
        return this.instance;
    }

    private jsonArrayToClasses<K, T extends K & { copy(k: K): void }>(text: string, type: { new(): T }): T[] {
        const obj = JSON.parse(text);
        console.log(JSON.stringify(obj));
        console.log(JSON.stringify(obj[0]));
        return obj.map( s => {
            console.log(JSON.stringify(s))
            const temp: T = new type();
            temp.copy(s);
            return temp;
        });
    }

    public getService(name: string): Service | null {
        if (!name) { return null; }
        return this.services.find( s => s && s.name && s.name.toLowerCase().includes(name.toLowerCase()))
    }
}
