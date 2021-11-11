import {PropertyInterface} from '../interfaces/Property.interface';

export class Property implements PropertyInterface {
  public name: string;

  public constructor(name: string) {
    this.name = name;
  }
}
