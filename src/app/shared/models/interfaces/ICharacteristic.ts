import {IProperty} from './IProperty';
import {IDescriptor} from './IDescriptor';

export interface ICharacteristic {
    uuid: string;
    name: string;
    properties: IProperty[];
    descriptor?: IDescriptor;
}
