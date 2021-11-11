import {PropertyInterface} from './Property.interface';
import {DescriptorInterface} from './Descriptor.interface';

export interface CharacteristicInterface {
  name: string;
  uuid: string;
  properties: PropertyInterface[];
  descriptor?: DescriptorInterface;
}
