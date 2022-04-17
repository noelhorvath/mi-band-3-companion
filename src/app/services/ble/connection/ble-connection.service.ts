import * as crypto from 'crypto-browserify';
import { Injectable } from '@angular/core';
import { AndroidGattTransportMode, BluetoothLE, DeviceInfo, OperationResult, ScanStatus } from '@ionic-native/bluetooth-le/ngx';
import { Platform } from '@ionic/angular';
import { BehaviorSubject, first, Observer, Subject } from 'rxjs';
import { Buffer } from 'buffer';
import { FirebaseAuthService } from '../../firebase/auth/firebase-auth.service';
import { filter, timeout } from 'rxjs/operators';
import { PermissionService } from '../../permission/permission.service';
import { Device } from '../../../shared/models/classes/Device';
import { ConnectionInfo } from '../../../shared/models/classes/ConnectionInfo';
import { ScanInfo } from '../../../shared/models/classes/ScanInfo';
import { ScanResult } from '../../../shared/models/classes/ScanResult';
import { LogHelper } from '../../../shared/models/classes/LogHelper';
import { IDevice } from '../../../shared/models/interfaces/IDevice';
import { BLEConnectionStatus, BLEScanStatus, BLEStatus, BLESubscriptionStatus } from '../../../shared/enums/ble.enum';
import { User } from '@angular/fire/auth';
import { FireTimestamp } from '../../../shared/models/classes/FireTimestamp';
import { Characteristic } from '../../../shared/models/classes/Characteristic';
import { Service } from '../../../shared/models/classes/Service';
import { BleBaseService } from '../base/ble-base.service';

@Injectable({
    providedIn: 'root'
})
export class BleConnectionService extends BleBaseService {
    private readonly logHelper: LogHelper;
    private connectionInfo: ConnectionInfo;
    private sentEncryptionKeyAgain: boolean;
    public blStatusSubject: Subject<string>;
    public connectionInfoSubject: Subject<ConnectionInfo>;
    public scanInfoSubject: BehaviorSubject<ScanInfo>;
    public deviceSettingsSubject: BehaviorSubject<Device>;

    public constructor(
        ble: BluetoothLE,
        private platform: Platform,
        private authService: FirebaseAuthService,
        private permissionService: PermissionService
    ) {
        super(ble);
        this.platform.ready().then(() => this.initializeBL());
        this.logHelper = new LogHelper(BleConnectionService.name);
        this.sentEncryptionKeyAgain = false;
        this.blStatusSubject = new Subject<string>();
        this.deviceSettingsSubject = new BehaviorSubject<Device>(new Device());
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
                this.deviceSettingsSubject.next(new Device());
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
            scanMode: this.ble.SCAN_MODE_LOW_LATENCY,
            matchMode: this.ble.MATCH_MODE_AGGRESSIVE,
            matchNum: this.ble.MATCH_NUM_MAX_ADVERTISEMENT,
            callbackType: this.ble.CALLBACK_TYPE_ALL_MATCHES,
        }).subscribe({
            next: (scanData: ScanStatus) => {
                if (scanData.name?.toLowerCase().includes(this.miBand3.name.toLowerCase())) {
                    const res = new ScanResult(scanData.address, scanData.name, scanData.rssi);
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
    public async connect(device: IDevice, autoConnect: boolean = false): Promise<void> {
        try {
            await this.blAndPermissionChecks();
            const wasConnected = await this.wasConnected(device);
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
                    scanMode: this.ble.SCAN_MODE_LOW_LATENCY,
                    matchMode: this.ble.MATCH_MODE_AGGRESSIVE,
                    matchNum: this.ble.MATCH_NUM_MAX_ADVERTISEMENT,
                    callbackType: this.ble.CALLBACK_TYPE_ALL_MATCHES,
                }).pipe(filter(s => s.address === device.macAddress), timeout(15000), first()).subscribe({
                    next: async () => {
                        await this.ble.stopScan();
                        this.ble.connect({
                            address: device.macAddress,
                            autoConnect,
                            transport: AndroidGattTransportMode.TRANSPORT_LE
                        }).subscribe(this.getConnectObserver());
                    },
                    error: async (e: unknown) => {
                        if (e instanceof Error && e.message !== 'Timeout has occurred') {
                            this.connectionInfoSubject.error(this.logHelper.getUnknownMsg(e));
                        }
                        const res = await this.ble.isScanning();
                        if (res.isScanning) {
                           await this.ble.stopScan();
                        }
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
        const service = this.miBand3.getServiceByName('authentication');
        const characteristic = service?.getCharacteristicByName('auth');
        if (service === undefined) {
            throw new Error('Failed to get authentication service');
        } else if (characteristic === undefined) {
            throw new Error('Failed to get authentication characteristic');
        }
        // Authentication steps
        // 1. set notify on (by sending 2 bytes request (0x01, 0x00) to the Descriptor === subscribe)
        this.subscribe(
            device,
            service,
            characteristic,
            {
                next: async (data: OperationResult) => {
                    try {
                        if (this.connectionInfo.device !== undefined) {
                            if (data.status === BLESubscriptionStatus.SUBSCRIBED) {
                                this.logHelper.logDefault(this.authenticateMiBand.name, 'Subscribed to auth');
                                // authentication sub will fail immediately if the encryption key is same as on the Mi Band 3
                                // it is better to start with requesting a random key first
                                // if the device has different encryption/secret key => 100304 => send encryption key => back to 100101
                                // 2. Request random key by sending 2 bytes: 0x02 + 0x00
                                await this.write(data.address, data.service, data.characteristic, Buffer.from([0x02, 0x00]));
                            } else {
                                if (data.value !== undefined) {
                                    const response = Buffer.from(this.ble.encodedStringToBytes(data.value)).subarray(0, 3).toString('hex'); // get the first 3 bytes to know what to do
                                    this.logHelper.logDefault(this.authenticateMiBand.name, 'auth response', { value: response });
                                    switch (response) {
                                        case '100101':
                                            // if user did press the button on the Mi Band
                                            // authentication level 1
                                            this.logHelper.logDefault(this.authenticateMiBand.name, 'Sent key ok');
                                            this.logHelper.logDefault(this.authenticateMiBand.name, 'Paired successfully');
                                            // 3. Request random key by sending 2 bytes: 0x02 + 0x00
                                            await this.write(data.address, data.service, data.characteristic, Buffer.from([0x02, 0x00]));
                                            this.logHelper.logDefault(this.authenticateMiBand.name, 'Request sent for a random key');
                                            break;
                                        case '100102':
                                            this.connectionInfoSubject.error('Pairing failed!\nPlease press the button on Mi Band to confirm pairing!');
                                            this.connectionInfoSubject.next(new ConnectionInfo(BLEConnectionStatus.CONNECTED, false, device));
                                            await this.sendEncryptionKey(data.address, data.service, data.characteristic); // send encryption key again
                                            break;
                                        case '100104':
                                            this.connectionInfoSubject.error('Encryption key sending failed!');
                                            // re-send encryption key once if sending failed
                                            if (!this.sentEncryptionKeyAgain) {
                                                this.connectionInfoSubject.next(new ConnectionInfo(BLEConnectionStatus.CONNECTED, false, device));
                                                await this.sendEncryptionKey(data.address, data.service, data.characteristic); // send encryption key again
                                                this.sentEncryptionKeyAgain = true;
                                            } else {
                                                await this.disconnectAndClose(data.address);
                                            }
                                            break;
                                        case '100201':
                                            // 4. Encrypt the random 16 bytes number with AES/ECB/NoPadding with the encryption key that was sent at 2. step
                                            // authentication level 2
                                            this.logHelper.logDefault(this.authenticateMiBand.name, 'Requested random key received');
                                            const randomData = Buffer.from(this.ble.encodedStringToBytes(data.value)).subarray(3, 19); // remove the first 3 bytes
                                            const algorithm = 'aes-128-ecb';
                                            const cipher = crypto.createCipheriv(algorithm, this.getEncryptionKey(), '').setAutoPadding(false); // create encryptor + disable auto padding
                                            const encryptedData = cipher.update(randomData); // encrypt data
                                            cipher.final(); // stop cipher
                                            // 5. Send 2 bytes 0x03 + 0x00 + encrypted data
                                            await this.write(data.address, data.service, data.characteristic, Buffer.concat([Buffer.from([0x03, 0x00]), encryptedData]));
                                            break;
                                        case '100204':
                                            // data request failed
                                            this.connectionInfoSubject.error('Requesting data failed!');
                                            await this.disconnectAndClose(data.address);
                                            break;
                                        case '100301':
                                            // 6. Authentication done
                                            this.logHelper.logDefault(this.authenticateMiBand.name, 'Authenticated successfully');
                                            device.lastUsedDate = FireTimestamp.now();
                                            this.connectionInfoSubject.next(new ConnectionInfo(BLEConnectionStatus.CONNECTED, true, device));
                                            await this.unsubscribe(data.address, data.service, data.characteristic);
                                            break;
                                        case '100304':
                                            // encryption fails, because the device probably has a different secret key
                                            this.logHelper.logError(this.authenticateMiBand.name, 'Encryption failed, sending new encryption key!');
                                            await this.sendEncryptionKey(data.address, data.service, data.characteristic); // write 2 bytes (0x01 + 0x00)  + encryption key (16 bytes)
                                            break;
                                        default:
                                            this.logHelper.logError(this.authenticateMiBand.name, 'Unexpected authentication response', { value: response });
                                            await this.disconnectAndClose(data.address);
                                    }
                                }
                            }
                        } else {
                            this.logHelper.logError(this.authenticateMiBand.name, 'no connected device to continue authentication process');
                        }
                    } catch (error: unknown) {
                        this.connectionInfoSubject.error(this.logHelper.getUnknownMsg(error));
                        const isConnected = await this.isConnected(data.address);
                        if (isConnected) {
                            await this.disconnectAndClose(data.address);
                        }
                    }
                },
                error: (e: unknown) => {
                    this.logHelper.logError(this.authenticateMiBand.name, e);
                }
            }
        );
    }

    private async sendEncryptionKey(
        deviceData: string | IDevice,
        service: string | Service,
        characteristic: string | Characteristic
    ): Promise<OperationResult> {
        const writeData = Buffer.concat([Buffer.from([0x01, 0x00]), this.getEncryptionKey()], 18); // 0x01 + 0x00 + encryption key => 18 bytes
        return this.write(
            deviceData,
            service,
            characteristic,
            writeData
        );
    }

    public getEncryptionKey(): Buffer {
        return Buffer.from([0x30, 0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x40, 0x41, 0x42, 0x43, 0x44, 0x45]);
    }
}
