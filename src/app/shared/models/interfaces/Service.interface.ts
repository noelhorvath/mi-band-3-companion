import {CharacteristicInterface} from './Characteristic.interface';

export interface ServiceInterface {
  name?: string;
  uuid: string;
  characteristics: CharacteristicInterface[];
}
