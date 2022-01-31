import {IDescriptor} from '../interfaces/IDescriptor';
import {UUIDExtension} from "./UUIDExtension";

export class Descriptor extends UUIDExtension implements IDescriptor {

    public constructor(uuid: string = '') {
        super(uuid);
    }

    copy(descriptor: IDescriptor): void {
        this.uuid = descriptor?.uuid;
    }
}


