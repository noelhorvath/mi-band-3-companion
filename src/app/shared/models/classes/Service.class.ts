import {ServiceInterface} from '../interfaces/Service.interface';
import {Characteristic} from './Characteristic.class';

export class Service implements ServiceInterface {
  public characteristics: Characteristic[];
  public uuid: string;
  public name?: string;

  public constructor(characteristic: Characteristic[], uuid: string, name?: string) {
    this.characteristics = characteristic;
    this.uuid = uuid;
    if (name) {
      this.name = name;
    }
  }

  public getCharacteristic(characteristicName: string): Characteristic {
    const index = this.characteristics.findIndex(x => x.name.toLowerCase().trim() === characteristicName.toLowerCase().trim());
    if (index !== -1) {
      return this.characteristics[index];
    } else {
      throw Error("Characteristic doesn't exist with the name: " + characteristicName + " in this service!");
    }
  }
}
