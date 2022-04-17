import miBand3Data from 'resources/MiBand3BLEServices.json';
import { Service } from './Service';
import { Device } from './Device';
import { parseJSON } from '../../functions/parser.functions';
import { IService } from '../interfaces/IService';

export class MiBand3 extends Device {
    public override readonly name: string;
    public override readonly services: Service[];
    private static instance: MiBand3;

    private constructor() {
        super();
        this.name = 'Mi Band 3';
        this.services = parseJSON(miBand3Data.services as unknown as IService, Service) as Array<Service> ?? [];
    }

    public static getInstance(): MiBand3 {
        if (!MiBand3.instance) {
            this.instance = new MiBand3();
        }
        return this.instance;
    }

    public getServiceByName(name: string): Service | undefined {
        return this.services.find((s: Service) => s.name !== undefined && s.name.toLowerCase().includes(name.toLowerCase()));
    }

    public getServiceByUUID(uuid: string): Service | undefined {
        return this.services.find((s: Service) => s.uuid === uuid.toLowerCase() || s.getShortenedUUID() === uuid.toLowerCase());
    }
}
