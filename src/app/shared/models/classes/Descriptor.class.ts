import {DescriptorInterface} from '../interfaces/Descriptor.interface';

export class Descriptor implements DescriptorInterface {
  public uuid: string;

  public constructor(uuid: string) {
    this.uuid = uuid;
  }
}


