import { ILogInfo } from '../interfaces/ILogInfo';
import { LogHelper } from './LogHelper';
import { LogOptions } from '../../types/custom.types';

export class LogInfo implements ILogInfo {
    private _message: unknown | string;
    private _options: LogOptions | undefined;
    public mainId: string;
    public secondaryId: string;

    public constructor(
        mainId: string = 'undefined',
        secondaryId: string = 'undefined',
        message: unknown | string = 'undefined',
        options?: LogOptions)
    {
        this.mainId = mainId;
        this.secondaryId = secondaryId;
        this.message = message;
        this.options = options;
    }

    public get message(): string {
        return LogHelper.getUnknownMsg(this._message);
    }

    public set message(message: string | unknown) {
        this._message = message;
    }

    public get options(): LogOptions | undefined {
        return this._options;
    }

    public set options(options: LogOptions | undefined) {
        this._options = options;
    }

    public getValue(): string | undefined {
        return this._options !== undefined ? LogHelper.getUnknownMsg(this._options.value) : this._options;
    }

    public copy(other: ILogInfo): void {
        if (!this.isEqual(other)) {
            this.mainId = other.mainId;
            this.secondaryId = other.secondaryId;
            this.message = other.message;
            this.options = other.options;
        }
    }

    public toString(): string {
        return this.mainId + ' -> ' + this.secondaryId + ': ' + this.message + (this._options !== undefined ? ' => ' + this.getValue() : '');
    }

    public isEqual(other: ILogInfo | undefined): boolean {
        return this !== other ? this.mainId === other?.mainId && this.secondaryId === other.secondaryId
            && this.message === (other instanceof LogInfo ? other.message : LogHelper.getUnknownMsg(other.message))
            && JSON.stringify(this.options?.value) === JSON.stringify(other.options?.value) : true;
    }
}
