import { IUUIDExtension } from '../interfaces/IUUIDExtension';

export abstract class UUIDExtension implements IUUIDExtension {
    private _uuid!: string;

    protected constructor(uuid: string = 'undefined') {
        this.uuid = uuid;
    }

    public get uuid(): string {
        return this._uuid ? this._uuid.toLowerCase() : 'undefined';
    }

    public set uuid(uuid: string) {
        this._uuid = uuid ? uuid.toLowerCase() : 'undefined';
    }

    public getShortenedUUID(): string {
        return this.uuid.includes('0000-1000-8000-00805f9b34fb') ? this.uuid.substring(4, 8) : this.uuid;
    }
}
