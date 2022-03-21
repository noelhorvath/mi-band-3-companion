import { IDescriptor } from '../interfaces/IDescriptor';
import { UUIDExtension } from './UUIDExtension';

export class Descriptor extends UUIDExtension implements IDescriptor {

    public constructor(uuid: string = 'undefined') {
        super(uuid);
    }

    public copy(other: IDescriptor): void {
        if (!this.isEqual(other)) {
            this.uuid = other.uuid;
        }
    }

    public override toString(): string {
        return 'uuid: ' + this.uuid;
    }

    public isEqual(other: IDescriptor | undefined): boolean {
        return this !== other ? this.uuid === (other instanceof Descriptor ? other.uuid : other?.uuid.toLowerCase()) : true;
    }
}


