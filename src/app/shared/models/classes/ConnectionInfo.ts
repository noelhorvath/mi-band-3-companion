import { IConnectionInfo } from '../interfaces/IConnectionInfo';
import { Device } from './Device';
import { ConnectionStatus } from '../../types/custom.types';
import { BLEConnectionStatus } from '../../enums/ble.enum';
import { IDevice } from '../interfaces/IDevice';
import { objectToClass } from '../../functions/parser.functions';

export class ConnectionInfo implements IConnectionInfo {
    private _status!: ConnectionStatus;
    public isAuthenticated: boolean;
    public device?: Device | undefined;

    public constructor(
        status: ConnectionStatus = BLEConnectionStatus.DISCONNECTED,
        isAuthenticated: boolean = false,
        device?: IDevice)
    {
        this.status = status;
        this.isAuthenticated = isAuthenticated;
        this.device = device !== undefined ? objectToClass<Device>(device as Device, Device) : device;
    }

    public set status(status: ConnectionStatus) {
        this._status = status;
        if (status === BLEConnectionStatus.DISCONNECTED) {
            this.isAuthenticated = false;
            this.device = undefined;
        }
    }

    public get status(): ConnectionStatus {
        return this._status;
    }

    public isConnecting(): boolean {
        return this.status === BLEConnectionStatus.CONNECTING && this.device !== undefined;
    }

    public isDisconnected(): boolean {
        return this.status === BLEConnectionStatus.DISCONNECTED && this.device === undefined;
    }

    public isConnected(): boolean {
        return this.status === BLEConnectionStatus.CONNECTED && this.device !== undefined;
    }

    public isConnectionError(): boolean {
        return this.status !== BLEConnectionStatus.CONNECTION_ERROR;
    }

    public isAuthenticating(): boolean {
        return this.isConnected() && !this.isAuthenticated && this.device !== undefined;
    }

    public isConnectingOrAuthenticating(): boolean {
        return this.isConnecting() || this.isAuthenticating();
    }

    public isReady(): boolean {
        return this.isConnected() && this.isAuthenticated && this.device !== undefined;
    }

    public copy(other: IConnectionInfo): void {
        if (!this.isEqual(other)) {
            this.status = other.status;
            this.isAuthenticated = other.isAuthenticated;

            if (this.device !== undefined && other.device !== undefined) {
                this.device.copy(other.device);
            } else {
                this.device = other.device !== undefined ? objectToClass<Device>(other.device as Device, Device) : other.device;
            }
        }
    }

    public toString(): string {
        return 'status: ' + this.status + ', authenticated: ' + this.isAuthenticated + ', device: '
            + (this.device ? '{' + this.device.toString() + '}' : this.device);
    }

    public isEqual(other: IConnectionInfo | undefined): boolean {
        return this !== other ? this.status === other?.status && this.isAuthenticated === other.isAuthenticated
            && (this.device !== other.device ? this.device?.isEqual(other.device) ?? false : true) : true;
    }
}
