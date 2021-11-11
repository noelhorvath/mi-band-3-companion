import {ServiceInterface} from './Service.interface';

export interface DeviceInterface {
  name: string;
  services: ServiceInterface[];
}
