import { LogInfo } from './LogInfo';
import { LogOptions, LogType } from '../../types/custom.types';
import { ILogInfo } from '../interfaces/ILogInfo';
import { instantiate } from '../../functions/parser.functions';

export class LogHelper {
    private _logInfo: LogInfo;

    public constructor(mainId: string) {
        this._logInfo = new LogInfo();
        this.setMainId(mainId);
        this.setSecondaryId('');
        this.setMessage('');
        this.setOptions(undefined);
    }

    private get logInfo(): LogInfo {
        return this._logInfo;
    }

    private set logInfo(logInfo: ILogInfo) {
        this._logInfo = logInfo instanceof LogInfo ? logInfo : instantiate(logInfo, LogInfo);
    }

    private setOptions(options: LogOptions | undefined): void {
        this._logInfo.options = options;
    }

    public getOptions(): LogOptions | undefined {
        return this._logInfo.options;
    }

    private setMainId(mainId: string): void {
        this._logInfo.mainId = mainId;
    }

    private setSecondaryId(secondaryId: string): void {
        this._logInfo.secondaryId = secondaryId;
    }

    public getSecondaryId(): string {
        return this._logInfo.secondaryId;
    }

    private setMessage(message: unknown | string): void {
        this._logInfo.message = message;
    }

    public getMessage(): string {
        return this._logInfo.message;
    }

    public getValue(): unknown {
        return this._logInfo.getValue();
    }

    public static log(logInfo: ILogInfo, type: LogType = 'log'): void {
        const logMsg = logInfo instanceof LogInfo ? logInfo.toString() : instantiate(logInfo, LogInfo).toString();
        return type === 'log' ? console.log(logMsg) : console.error(logMsg);
    }

    public static getUnknownMsg(message: unknown): string {
        if (message instanceof Error) {
            return message.message;
        } else if (typeof message === 'string') {
            return message;
        } else if (typeof message === 'number' || typeof message === 'bigint') {
            return message.toString();
        } else if (typeof message === 'boolean') {
            return `${ message.valueOf() }`;
        } else if (message === undefined) {
            return 'undefined';
        } else if (message === null) {
            return 'null';
        } else if (typeof message === 'object') {
            return typeof message.toString === 'function' && message.toString() !== '[object Object]' ? message.toString() : JSON.stringify(message);
        } else {
            return JSON.stringify(message);
        }
    }

    public getUnknownMsg(message: unknown): string {
        return LogHelper.getUnknownMsg(message);
    }


    private log(id: string, message: unknown, options?: LogOptions, type: LogType = 'log'): void {
        this.setSecondaryId(id);
        this.setMessage(message);
        this.setOptions(options);
        LogHelper.log(this.logInfo, type);
    }

    public logDefault(id: string, message: string | unknown, options?: LogOptions): void {
        this.log(id, message, options, 'log');
    }

    public logError(id: string, message: string | unknown, options?: LogOptions): void {
        this.log(id, message, options, 'error');
    }
}
