import { ICharacteristic } from './ICharacteristic';
import { IEntityModel } from './IEntityModel';

export interface IService extends IEntityModel<IService> {
    uuid: string;
    characteristics: ICharacteristic[];
    name?: string;
}
