// @ts-ignore
import * as crypto from 'crypto-browserify';
import { Injectable } from '@angular/core';
import { AndroidGattTransportMode, BluetoothLE, DeviceInfo, OperationResult, ScanStatus } from '@ionic-native/bluetooth-le/ngx';
import { Platform } from '@ionic/angular';
import { BehaviorSubject, first, Observer, Subject } from 'rxjs';
import { Buffer } from 'buffer';
import { FirebaseAuthService } from '../../firebase/auth/firebase-auth.service';
import { filter, timeout } from 'rxjs/operators';
import { PermissionService } from '../../permission/permission.service';
import { MiBand3 } from '../../../shared/models/classes/MiBand3';
import { Device } from '../../../shared/models/classes/Device';
import { ConnectionInfo } from '../../../shared/models/classes/ConnectionInfo';
import { ScanInfo } from '../../../shared/models/classes/ScanInfo';
import { ScanResult } from '../../../shared/models/classes/ScanResult';
import { LogHelper } from '../../../shared/models/classes/LogHelper';
import { IDevice } from '../../../shared/models/interfaces/IDevice';
import { BLEConnectionStatus, BLEScanStatus, BLEStatus, BLESubscriptionStatus } from '../../../shared/enums/ble.enum';
import { User } from '@angular/fire/auth';

@Injectable({
    providedIn: 'root'
})
export class BleConnectionService {
    private readonly logHelper: LogHelper;
    private readonly miBand3: MiBand3;
    private connectionInfo: ConnectionInfo;
    private sentEncryptionKeyAgain: boolean;
    public blStatusSubject: Subject<string>;
    public connectionInfoSubject: Subject<ConnectionInfo>;
    public scanInfoSubject: BehaviorSubject<ScanInfo>;

    public constructor(
        private ble: BluetoothLE,
        private platform: Platform,
        private authService: FirebaseAuthService,
        private permissionService: PermissionService
    ) {
        this.platform.ready().then(() => this.initializeBL());
        this.logHelper = new LogHelper(BleConnectionService.name);
        this.miBand3 = MiBand3.getInstance();
        this.sentEncryptionKeyAgain = false;
        this.blStatusSubject = new Subject<string>();
        this.connectionInfo = new ConnectionInfo();
        this.connectionInfoSubject = new BehaviorSubject<ConnectionInfo>(this.connectionInfo);
        this.scanInfoSubject = new BehaviorSubject<ScanInfo>(new ScanInfo());
        this.connectionInfoSubject.subscribe(connectionInfo => this.connectionInfo = connectionInfo);
        this.authService.authUserSubject.subscribe(async (user: User | undefined) => {
            // reset stats after user logout
            if (user === undefined) {
                this.logHelper.logDefault('authUserSubject', 'Resetting data after logout');
                // disconnect device when user logs out
                if (this.connectionInfo.isConnected() && this.connectionInfo.device) {
                    this.logHelper.logDefault('authUserSubject', 'Disconnecting device after logout');
                    await this.disconnectAndClose(this.connectionInfo.device);
                }
                this.scanInfoSubject.next(new ScanInfo());
            }
        });
    }

    // request = true / false (default) - Should user be prompted to enable Bluetooth
    //
    // statusReceiver = true / false (default) - Should change in Bluetooth status notifications be sent.
    //
    // restoreKey = A unique string to identify your app. Bluetooth Central background mode is required to use this,
    //              but background mode doesn't seem to require specifying the restoreKey.
    private initializeBL(request = false, statusReceiver = true, restoreKey = 'miband3companion'): void {
        // init bluetooth and subscribe to bluetooth status changes
        this.ble.initialize({ request, statusReceiver, restoreKey }).subscribe({
            next: (data: { status: 'enabled' | 'disabled' }) => {
                this.logHelper.logDefault('initializeBL', 'Bluetooth status', { value: data.status });
                this.blStatusSubject.next(data.status);
                // reset stats when bl get disabled
                if (data.status === BLEStatus.DISABLED) {
                    this.logHelper.logDefault('initializeBL', 'Resetting service data after disabling BL');
                    this.scanInfoSubject.next(new ScanInfo());
                    this.connectionInfoSubject.next(new ConnectionInfo());
                }
            },
            error: (e: unknown) => Promise.reject(this.logHelper.getUnknownMsg(e))
            // TODO: localize error messages
            /*{
                if (typeof e === 'string' || e instanceof Error) {
                    return Promise.reject(this.logHelper.getUnknownMsg(e));
                } else {
                    return Promise.reject(this.logHelper.getUnknownMsg((e as BLEError).message));
                }
                return Promise.reject(this.logHelper.getUnknownMsg(e));
            }*/
        });
        this.logHelper.logDefault('initializeBL', ' Bluetooth has been initialized!');
    }

    public async isConnected(deviceData: string | IDevice): Promise<boolean> {
        try {
            await this.blAndPermissionChecks();
            const wasConnected = await this.wasConnected(deviceData);
            return wasConnected ? Promise.resolve(
                (await this.ble.isConnected({
                    address: typeof deviceData === 'string' ? deviceData : deviceData.macAddress
                })).isConnected
            ) : Promise.resolve(false);
        } catch (e: unknown) {
            return Promise.reject(this.logHelper.getUnknownMsg(e));
        }
    }

    public async wasConnected(deviceData: string | IDevice): Promise<boolean> {
        try {
            await this.blAndPermissionChecks();
            return (await this.ble.wasConnected({ address: typeof deviceData === 'string' ? deviceData : deviceData.macAddress })).wasConnected;
        } catch (e: unknown) {
            return Promise.reject(this.logHelper.getUnknownMsg(e));
        }
    }

    public async enableBL(maxWaitTime: number = 5000): Promise<boolean> {
        try {
            this.logHelper.logDefault(this.enableBL.name, 'startTime', { value: new Date().toISOString() });
            let isBLEnabled = await this.isBLEnabled();
            this.logHelper.logDefault(this.enableBL.name, 'isEnabled', { value: isBLEnabled });
            if (isBLEnabled) {
                return true;
            }
            this.blStatusSubject.next(BLEStatus.ENABLING);
            this.ble.enable();
            await this.createTimeoutForEnableBL(maxWaitTime); // wait for BL to initialize and/or for user interacting with BL dialog
            this.logHelper.logDefault(this.enableBL.name, 'waitTime end', { value: new Date().toISOString() });
            isBLEnabled = await this.isBLEnabled();
            this.logHelper.logDefault(this.enableBL.name, 'Is BL enabled after enabling', { value: isBLEnabled });
            if (!isBLEnabled) {
                this.blStatusSubject.next(BLEStatus.DISABLED);
            }
            return Promise.resolve(isBLEnabled);
        } catch (e: unknown) {
            return Promise.reject(this.logHelper.getUnknownMsg(e));
        }
    }

    public createTimeoutForEnableBL(ms: number): Promise<void> {
        this.logHelper.logDefault(this.createTimeoutForEnableBL.name, 'timeout start', { value: new Date().toISOString() });
        return new Promise<void>(res => setTimeout(() => {
            this.logHelper.logDefault(this.createTimeoutForEnableBL.name, 'timeout end', { value: new Date().toISOString() });
            res();
        }, ms));
    }

    public async isBLEnabled(): Promise<boolean> {
        try {
            return Promise.resolve((await this.ble.isEnabled()).isEnabled);
        } catch (e: unknown) {
            this.logHelper.logError(this.isBLEnabled.name, e);
            return Promise.resolve(false);
        }
    }

    // TODO: fix no connecting after BL enable/check

    public async blAndPermissionChecks(): Promise<void> {
        try {
            await this.permissionService.checkForBluetoothScanPermissions();
            this.logHelper.logDefault(this.blAndPermissionChecks.name, 'Checking Bluetooth status');
            const isEnabled = await this.enableBL();
            return isEnabled ? Promise.resolve() : Promise.reject('BLUETOOTH_IS_DISABLED');
        } catch (e: unknown) {
            return Promise.reject(this.logHelper.getUnknownMsg(e));
        }
    }

    // Android prevents applications from starting and stopping scans more than 5 times in 30 seconds
    // if it happens then BL scanning will be disabled for 30s
    // to prevent the abuse of scanning wait at least 7 seconds after each scan
    public async scanForDevices(scanTime: number = 1000): Promise<void> {
        try {
            await this.blAndPermissionChecks();
        } catch (e: unknown) {
            this.scanInfoSubject.error(this.logHelper.getUnknownMsg(e));
            this.scanInfoSubject.next(new ScanInfo());
        }
        const scanResults: ScanResult[] = [];
        this.scanInfoSubject.next(new ScanInfo(BLEScanStatus.SCANNING, true));
        this.ble.startScan({
            services: [],
            // allowDuplicates: false, // iOS only
            scanMode: this.ble.SCAN_MODE_LOW_LATENCY,
            matchMode: this.ble.MATCH_MODE_AGGRESSIVE,
            matchNum: this.ble.MATCH_NUM_MAX_ADVERTISEMENT,
            callbackType: this.ble.CALLBACK_TYPE_ALL_MATCHES,
        }).subscribe({
            next: (scanData: ScanStatus) => {
                if (scanData.name?.toLowerCase().includes(this.miBand3.name.toLowerCase())) {
                    const res: ScanResult = new ScanResult(scanData.address, scanData.name, scanData.rssi);
                    const resIndex = scanResults.findIndex((s: ScanResult) => s.address === res.address);
                    if (resIndex === -1) { // ignore duplicates
                        scanResults.push(res);
                    } else { // update rssi if device is already added
                        scanResults[resIndex].rssi = res.rssi;
                    }
                }
            },
            error: (e: unknown) => {
                this.scanInfoSubject.error(this.logHelper.getUnknownMsg(e));
                this.scanInfoSubject.next(new ScanInfo());
            }
        });

        // stop scanning
        try {
            const isScanning = (await this.ble.isScanning()).isScanning;
            if (isScanning) {
                setTimeout(async () => {
                    try {
                        await this.ble.stopScan();
                        scanResults.sort(ScanResult.getCompareFunction('rssi', 'desc'));
                        this.scanInfoSubject.next(new ScanInfo(BLEScanStatus.FINISHED, true, scanResults));
                    } catch (e: unknown) {
                        this.scanInfoSubject.error(this.logHelper.getUnknownMsg(e));
                        this.scanInfoSubject.next(new ScanInfo());
                    }
                }, scanTime);
            }
        } catch (error: unknown) {
            this.scanInfoSubject.error(this.logHelper.getUnknownMsg(error));
            this.scanInfoSubject.next(new ScanInfo());
        }
    }

    // address = The address/identifier provided by the scan's return object
    //
    // autoConnect = Automatically connect as soon as the remote device becomes available (Android)
    //
    // transport set to TRANSPORT_LE is the safest for ble (auto can cause issues)
    //
    // firstTime = if true skip (2. auth step) sending encryption key during auth process
    // TODO: fix autoConnect handling => fix reconnect
    public async connect(device: IDevice, autoConnect: boolean = false): Promise<void> {
        try {
            await this.blAndPermissionChecks();
            const wasConnected: boolean = await this.wasConnected(device);
            this.logHelper.logDefault(this.connect.name, 'wasConnected', { value: wasConnected.valueOf() });
            this.connectionInfoSubject.next(new ConnectionInfo(BLEConnectionStatus.CONNECTING, false, device));
            if (wasConnected.valueOf()) {
                await this.ble.close({ address: device.macAddress });
                this.ble.connect({
                    address: device.macAddress,
                    autoConnect,
                    transport: AndroidGattTransportMode.TRANSPORT_LE
                }).subscribe(this.getConnectObserver());
            } else {
                // scan is needed before connecting
                this.ble.startScan({
                    services: [],
                    allowDuplicates: false,
                    scanMode: this.ble.SCAN_MODE_LOW_LATENCY,
                    matchMode: this.ble.MATCH_MODE_AGGRESSIVE,
                    matchNum: this.ble.MATCH_NUM_MAX_ADVERTISEMENT,
                    callbackType: this.ble.CALLBACK_TYPE_ALL_MATCHES,
                }).pipe(timeout(5000), filter(s => s.address === device.macAddress), first()).subscribe({
                    next: async () => {
                        await this.ble.stopScan();
                        this.ble.connect({
                            address: device.macAddress,
                            autoConnect,
                            transport: AndroidGattTransportMode.TRANSPORT_LE
                        }).subscribe(this.getConnectObserver());
                    },
                    error: (e: unknown) => {
                        this.connectionInfoSubject.error(this.logHelper.getUnknownMsg(e));
                        this.connectionInfoSubject.next(new ConnectionInfo());
                    }
                });
            }
        } catch (e: unknown) {
            this.connectionInfoSubject.error(this.logHelper.getUnknownMsg(e));
            this.connectionInfoSubject.next(new ConnectionInfo());
        }
    }

    private getConnectObserver(): Partial<Observer<DeviceInfo>> {
        return {
            next: async (connectionData: DeviceInfo): Promise<void> => {
                try {
                    this.logHelper.logDefault(this.getConnectObserver.name, 'connection info', { value: connectionData });
                    const conInfo = new ConnectionInfo(connectionData.status as BLEConnectionStatus);
                    if (connectionData.status === BLEConnectionStatus.CONNECTED) {
                        this.logHelper.logDefault(this.getConnectObserver.name + 'connection status', 'Connected to device!');
                        await this.ble.discover({ address: connectionData.address, clearCache: false }); // discover services
                        conInfo.device = new Device(this.miBand3.name, connectionData.address);
                        this.connectionInfoSubject.next(conInfo);
                        this.authenticateMiBand(conInfo.device); // start auth process
                    } else if (connectionData.status === BLEConnectionStatus.DISCONNECTED) {
                        this.logHelper.logDefault(this.getConnectObserver.name + 'connection status', 'Unexpectedly disconnected!');
                        // free BL resource if auth failed and gets disconnected
                        try {
                            await this.ble.close({ address: connectionData.address });
                        } catch (e: unknown) {
                            this.logHelper.logError(this.getConnectObserver.name, e);
                        }
                        this.connectionInfoSubject.next(conInfo);
                    }
                } catch (e: unknown) {
                    this.connectionInfoSubject.error(this.logHelper.getUnknownMsg(e));
                    this.connectionInfoSubject.next(new ConnectionInfo());
                }
            },
            error: (e: unknown): void => {
                this.connectionInfoSubject.error(this.logHelper.getUnknownMsg(e));
                this.connectionInfoSubject.next(new ConnectionInfo());
            }
        };
    }

    public async disconnectAndClose(deviceData: string | IDevice): Promise<void> {
        try {
            const address = typeof deviceData === 'string' ? deviceData : deviceData.macAddress;
            await this.ble.disconnect({ address });
            await this.ble.close({ address });
            this.logHelper.logDefault(this.disconnectAndClose.name, 'Disconnected successfully!');
        } catch (e: unknown) {
            this.connectionInfoSubject.error(this.logHelper.getUnknownMsg(e));
        } finally {
            this.connectionInfoSubject.next(new ConnectionInfo());
        }
    }

    private authenticateMiBand(device: IDevice): void {
        const serviceUUID: string = this.miBand3.getService('authentication')?.uuid ?? 'unknown';
        const characteristicUUID: string = this.miBand3.getService('authentication')?.getCharacteristic('auth')?.uuid ?? 'unknown';
        // Authentication steps
        this.ble.subscribe({ // 1. set notify on (by sending 2 bytes request (0x01, 0x00) to the Descriptor === subscribe)
            address: device.macAddress,
            service: serviceUUID,
            characteristic: characteristicUUID
        }).subscribe({
            next: async (data: OperationResult) => {
                try {
                    if (data.status === BLESubscriptionStatus.SUBSCRIBED) {
                        this.logHelper.logDefault(this.authenticateMiBand.name, 'Subscribed to auth');
                        // authentication sub will fail immediately if the encryption key is same as on the Mi Band 3
                        // it is better to start with requesting a random key first
                        // if the device has different encryption/secret key => 100304 => send encryption key => back to 100101
                        const writeData = Buffer.from([2, 0]); // 2. Request random key by sending 2 bytes: 0x02 + 0x00
                        await this.write(device, serviceUUID, characteristicUUID, writeData, 'noResponse');
                    } else {
                        if (data.value !== undefined) {
                            const response = Buffer.from(this.ble.encodedStringToBytes(data.value)).slice(0, 3).toString('hex'); // get the first 3 bytes to know what to do
                            this.logHelper.logDefault(this.authenticateMiBand.name, 'auth response', { value: response });
                            if (response === '100101') { // if user did press the button on the Mi Band
                                // authentication level 1
                                this.logHelper.logDefault(this.authenticateMiBand.name, 'Sent key ok');
                                this.logHelper.logDefault(this.authenticateMiBand.name, 'Paired successfully');
                                const writeData = Buffer.from([2, 0]); // 3. Request random key by sending 2 bytes: 0x02 + 0x00
                                await this.write(device, serviceUUID, characteristicUUID, writeData, 'noResponse');
                                this.logHelper.logDefault(this.authenticateMiBand.name, 'Request sent for a random key');
                            } else if (response === '100102') { // if user did not press button on the Mi Band after sending the encryption key
                                this.connectionInfoSubject.error('Pairing failed!\nPlease press the button on Mi Band to confirm pairing!');
                                this.connectionInfoSubject.next(new ConnectionInfo(BLEConnectionStatus.CONNECTED, false, device));
                                await this.sendEncryptionKey(device, serviceUUID, characteristicUUID); // send encryption key again
                            } else if (response === '100104') {
                                this.connectionInfoSubject.error('Encryption key sending failed!');
                                // re-send encryption key once if sending failed
                                if (!this.sentEncryptionKeyAgain) {
                                    this.connectionInfoSubject.next(new ConnectionInfo(BLEConnectionStatus.CONNECTED, false, device));
                                    await this.sendEncryptionKey(device, serviceUUID, characteristicUUID); // send encryption key again
                                    this.sentEncryptionKeyAgain = true;
                                } else {
                                    await this.disconnectAndClose(device);
                                }
                            } else if (response === '100201') { // 4. Encrypt the random 16 bytes number with AES/ECB/NoPadding with the encryption key that was sent at 2. step
                                // authentication level 2
                                this.logHelper.logDefault(this.authenticateMiBand.name, 'Requested random key received');
                                const randomData = Buffer.from(this.ble.encodedStringToBytes(data.value)).slice(3, 19); // remove the first 3 bytes
                                const algorithm = 'aes-128-ecb';
                                const cipher = crypto.createCipheriv(algorithm, this.getEncryptionKey(), '').setAutoPadding(false); // create encryptor + disable auto padding
                                const encryptedData = cipher.update(randomData); // encrypt data
                                cipher.final(); // stop cipher
                                const writeData = Buffer.concat([Buffer.from([3, 0]), encryptedData]); // 5. Send 2 bytes 0x03 + 0x00 + encrypted data
                                await this.write(device, serviceUUID, characteristicUUID, writeData, 'noResponse');
                            } else if (response === '100204') { // data request failed
                                this.connectionInfoSubject.error('Requesting data failed!');
                                await this.disconnectAndClose(device);
                            } else if (response === '100301') { // 6. Authentication done
                                this.logHelper.logDefault(this.authenticateMiBand.name, 'Authenticated successfully');
                                device.lastUsedDate = new Date().toISOString();
                                this.connectionInfoSubject.next(new ConnectionInfo(BLEConnectionStatus.CONNECTED, true, device));
                                await this.ble.unsubscribe({ address: device.macAddress, service: serviceUUID, characteristic: characteristicUUID });
                            } else if (response === '100304') { // encryption fails, because the device probably has a different secret key
                                this.logHelper.logError(this.authenticateMiBand.name, 'Encryption failed, sending new encryption key!');
                                await this.sendEncryptionKey(device, serviceUUID, characteristicUUID); // write 2 bytes (0x01 + 0x00)  + encryption key (16 bytes)
                            } else {
                                this.logHelper.logError(this.authenticateMiBand.name, 'Authentication code', { value: response });
                                await this.disconnectAndClose(device);
                            }
                        }
                    }
                } catch (error: unknown) {
                    this.connectionInfoSubject.error(this.logHelper.getUnknownMsg(error));
                    const isConnected = await this.isConnected(device);
                    if (isConnected) {
                        await this.disconnectAndClose(device);
                    }
                }
            },
            error: (e: unknown) => {
                this.logHelper.logError(this.authenticateMiBand.name, e);
            }
        });
    }

    private async sendEncryptionKey(
        deviceData: string | IDevice,
        service: string,
        characteristic: string
    ): Promise<OperationResult> {
        const writeData = Buffer.concat([Buffer.from([1, 0]), this.getEncryptionKey()], 18); // 0x01 + 0x00 + encryption key => 18 bytes
        return this.write(
            typeof deviceData === 'string' ? deviceData : deviceData.macAddress,
            service,
            characteristic,
            writeData,
            'noResponse'
        );
    }

    public getEncryptionKey(): Buffer {
        return Buffer.from([30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45]);
    }

    private write(
        deviceData: string | IDevice,
        service: string, characteristic: string,
        value: Buffer,
        type?: string
    ): Promise<OperationResult> {
        return this.ble.write({
            address: typeof deviceData === 'string' ? deviceData : deviceData.macAddress,
            service,
            characteristic,
            value: this.ble.bytesToEncodedString(value),
            type: type ?? ''
        });
    }
}
