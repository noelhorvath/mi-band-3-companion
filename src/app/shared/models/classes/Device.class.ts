import {DeviceInterface} from '../interfaces/Device.interface';
import {Service} from './Service.class';

export class Device implements DeviceInterface {
  public name: string;
  public services: Service[];

  public constructor(name: string, services: Service[]) {
    this.name = name;
    this.services = services;
  }
}
