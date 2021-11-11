import {CharacteristicInterface} from '../interfaces/Characteristic.interface';
import {Descriptor} from './Descriptor.class';
import {Property} from './Property.class';

export class Characteristic implements CharacteristicInterface {
  public name: string;
  public properties: Property[];
  public uuid: string;
  public descriptor?: Descriptor;

  public constructor(name: string, properties: Property[], uuid: string, descriptor?: Descriptor) {
    this.name = name;
    this.properties = properties;
    this.uuid = uuid;
    this.descriptor = descriptor;
  }
}
