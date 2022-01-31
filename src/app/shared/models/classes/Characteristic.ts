import {ICharacteristic} from '../interfaces/ICharacteristic';
import {Descriptor} from './Descriptor';
import {Property} from './Property';
import {UUIDExtension} from "./UUIDExtension";

export class Characteristic extends UUIDExtension implements ICharacteristic {
    public name: string;
    public properties: Property[];
    public descriptor?: Descriptor;

    public constructor(name: string = "", properties: Property[] = [], uuid?: string, descriptor?: Descriptor) {
        super(uuid);
        this.name = name;
        this.properties = properties ? properties.map( p => {
            const temp = new Property();
            temp.copy(p);
            return temp
        }) : properties;
        this.descriptor = descriptor;
    }

    copy(characteristic: Characteristic): void {
        this.name = characteristic?.name;
        this.properties = characteristic.properties ? characteristic.properties.map( p => {
            const temp = new Property();
            temp.copy(p);
            return temp;
        }) : undefined;
        this.uuid = characteristic?.uuid;
        this.descriptor = characteristic?.descriptor;
    }
}
