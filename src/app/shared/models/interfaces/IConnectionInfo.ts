import { IDevice } from './IDevice';
import { IEntityModel } from './IEntityModel';
import { ConnectionStatus } from '../../types/custom.types';

export interface IConnectionInfo extends IEntityModel<IConnectionInfo> {
    status: ConnectionStatus;
    isAuthenticated: boolean;
    id?: string;
    device?: IDevice | undefined;

    isConnected?(): boolean;

    isConnecting?(): boolean;

    isDisconnected?(): boolean;

    isConnectionError?(): boolean;

    isAuthenticating?(): boolean;

    isConnectingOrAuthenticating?(): boolean;

    isReady?(): boolean;
}
