import {ICharacteristic} from './ICharacteristic';

export interface IService {
    uuid: string;
    characteristics: ICharacteristic[];
    name?: string;
}
