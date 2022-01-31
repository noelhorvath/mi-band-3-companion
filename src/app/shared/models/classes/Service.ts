import {IService} from '../interfaces/IService';
import {Characteristic} from './Characteristic';
import {UUIDExtension} from "./UUIDExtension";

export class Service extends UUIDExtension implements IService {
    public characteristics: Characteristic[];
    public name?: string;

    public constructor(uuid: string = '', characteristic: Characteristic[] = [], name?: string) {
        super(uuid);
        this.characteristics = characteristic ? characteristic.map( c => {
            const temp = new Characteristic();
            temp.copy(c);
            return temp;
        }) : undefined;
        this.name = name;
    }

    public getCharacteristic(name: string): Characteristic | null {
        if (!name) { return null; }
        return this.characteristics.find( c => c && c.name && c.name.toLowerCase().includes(name.toLowerCase().trim()));
    }

    copy(service: Service): void {
        this.characteristics = service.characteristics ? service.characteristics.map( c => {
            const temp = new Characteristic();
            temp.copy(c);
            return temp;
        }) : undefined;
        this.uuid = service?.uuid;
        this.name = service?.name;
    }
}
