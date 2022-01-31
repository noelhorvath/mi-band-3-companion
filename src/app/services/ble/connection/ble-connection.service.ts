import {Injectable, NgZone} from '@angular/core';
import {AndroidGattTransportMode, BluetoothLE, DeviceInfo, OperationResult, ScanStatus} from '@ionic-native/bluetooth-le/ngx';
import {Platform} from '@ionic/angular';
import {BehaviorSubject, Subject} from 'rxjs';
import * as crypto from 'crypto-browserify';
import {Buffer} from 'buffer';
import {AuthService} from "../../firebase/auth/auth.service";
import {filter, take, timeout} from "rxjs/operators";
import {PermissionService} from "../../permission/permission.service";
import {MiBand3} from "../../../shared/models/classes/MiBand3";
import {Device} from "../../../shared/models/classes/Device";

@Injectable({
    providedIn: 'root'
})
export class BleConnectionService {
    public blStatusSubject: Subject<string>;
    public connectionStatusSubject: Subject<string>;
    private firstTimeConnecting: boolean;
    private connectedDevice: Device;
    public deviceListSubject: BehaviorSubject<ScanStatus[]>
    public isScanningSubject: BehaviorSubject<boolean>
    public isScanningDisabledSubject: BehaviorSubject<boolean>;
    public connectedDeviceSubject: BehaviorSubject<Device>;
    private connectingDevice: Device;
    private miBand3: MiBand3;

    constructor(
        private ble: BluetoothLE,
        private platform: Platform,
        private zone: NgZone,
        private authService: AuthService,
        private permissionService: PermissionService
    ) {
        this.miBand3 = MiBand3.getInstance();
        this.platform.ready().then( () => this.initializeBL() );
        this.blStatusSubject = new Subject<string>();
        this.connectionStatusSubject = new BehaviorSubject<string>('disconnected');
        this.deviceListSubject = new BehaviorSubject<ScanStatus[]>(undefined);
        this.isScanningSubject = new BehaviorSubject<boolean>(false);
        this.isScanningDisabledSubject = new BehaviorSubject<boolean>(false);
        this.connectedDeviceSubject = new BehaviorSubject<Device>(null);

        this.connectedDeviceSubject.subscribe( device => this.connectedDevice = device);
        this.authService.isServiceInitializedSubject.subscribe((value: boolean) => {
            if (value) {
                this.authService.authUserSubject.subscribe(async user => {
                    // reset stats after logout
                    if (!user) {
                        // disconnect device when user logs out
                        if (this.connectedDevice && this.connectedDevice.macAddress) {
                            console.log(BleConnectionService.name + ' -> Disconnecting device after logout');
                            await this.disconnectAndClose(this.connectedDevice.macAddress);
                        }
                        console.log('Resetting data after logout')
                        this.zone.run( () => {
                            this.isScanningDisabledSubject.next(false);
                            this.isScanningSubject.next(false);
                            this.deviceListSubject.next(null);
                            this.connectionStatusSubject.next('disconnected');
                            this.connectedDeviceSubject.next(null);
                        });
                    }
                });
            }
        });
    }

    // request = true / false (default) - Should user be prompted to enable Bluetooth
    //
    // statusReceiver = true / false (default) - Should change in Bluetooth status notifications be sent.
    //
    // restoreKey = A unique string to identify your app. Bluetooth Central background mode is required to use this,
    //              but background mode doesn't seem to require specifying the restoreKey.
    private initializeBL(request = false, statusReceiver = true, restoreKey = 'MBCompanion') {
        // init bluetooth and subscribe to bluetooth status changes
        this.ble.initialize({request, statusReceiver, restoreKey}).subscribe(status => {
            console.log(BleConnectionService.name + ' -> BL status: ' + status.status);
            this.zone.run( () => this.blStatusSubject.next(status.status) );
            // reset stats when bl get disabled
            if (status.status === 'disabled') {
                this.zone.run( () => {
                    console.log(BleConnectionService.name + ' -> Resetting service data after disabling BL');
                    //this.isScanningDisabledSubject.next(false);
                    this.isScanningSubject.next(false);
                    this.deviceListSubject.next(null);
                    this.connectionStatusSubject.next('disconnected');
                    this.connectedDeviceSubject.next(null);
                });
            }
        }, error => {
            this.zone.run( () => this.blStatusSubject.error(error) );
        });
        console.log('Bluetooth has been initialized!');
    }

    public async isConnected(address: string): Promise<boolean> {
        try {
            await this.blAndPermissionChecks();
            return (await this.ble.isConnected({address})).isConnected;
        } catch (e) {
            return Promise.reject(e);
        }
    }

    public async wasConnected(address: string): Promise<boolean> {
        try {
            await this.blAndPermissionChecks();
            return (await this.ble.wasConnected({address})).wasConnected;
        } catch (e) {
            return Promise.reject(e);
        }
    }

    public async enableBL(maxWaitTime: number = 5000): Promise<boolean> {
        try {
            console.log(BleConnectionService.name + ' -> startTime: ' + new Date().toISOString());
            let isBLEnabled = await this.isBLEnabled();
            console.log(BleConnectionService.name + ' -> isEnabled: ' + isBLEnabled);
            if (isBLEnabled) { return true; }
            this.zone.run( () => this.blStatusSubject.next('enabling') );
            this.ble.enable();
            await this.createTimeoutForEnableBL(maxWaitTime); // wait for BL to initialize and/or for user interacting with BL dialog
            console.log(BleConnectionService.name + ' -> waitTime end: ' + new Date().toISOString());
            isBLEnabled = await this.isBLEnabled();
            console.log(BleConnectionService.name + ' -> isEnabled after enable: ' + new Date().toISOString());
            if (!isBLEnabled) { this.zone.run( () => this.blStatusSubject.next('disabled') ) }
            return isBLEnabled
        } catch (e) {
            console.error(BleConnectionService.name + ' -> enableBL error: ' + e);
            return Promise.reject(e);
        }
    }

    public createTimeoutForEnableBL(ms: number) {
        console.log(BleConnectionService.name + ' -> timeout start: ' + new Date().toISOString());
        return new Promise<void>( res => setTimeout( () => {
            console.log(BleConnectionService.name + ' -> timeout end: ' + new Date().toISOString());
            res();
        }, ms));
    }

    public async isBLEnabled(): Promise<boolean>{
        try {
            return (await this.ble.isEnabled()).isEnabled;
        } catch (e) {
            console.log(BleConnectionService.name + ' -> BL error: ' + e);
        }
    }

    // TODO: fix no connecting after BL enable/check

    public async blAndPermissionChecks(): Promise<void> {
        try {
            await this.permissionService.checkForBluetoothScanPermissions();
            console.log('checking bl status');
            const isEnabled = await this.enableBL();
            return isEnabled ? Promise.resolve() : Promise.reject('BL is not enabled');
        } catch (e) {
            console.error(BleConnectionService.name + ' -> bl and permission check error: ' + e);
            return Promise.reject(e);
        }
    }


    // Android prevents applications from starting and stopping scans more than 5 times in 30 seconds
    // if it happens then 30s timeout
    // so wait at least 7 seconds after each scan if user could "abuse" scanning
    public async scanForDevices(ms: number = 1000) {
        try {
            await this.blAndPermissionChecks();
        } catch (e) {
            this.zone.run( () => {
                this.isScanningSubject.error(e);
                this.isScanningDisabledSubject.next(false);
                this.isScanningSubject.next(false);
            });
        }
        let deviceList: ScanStatus[] = [];
        this.zone.run( () => {
            this.isScanningSubject.next(true);
            this.isScanningDisabledSubject.next(true);
        });
        this.ble.startScan({
            services: [],
            allowDuplicates: false,
            scanMode: this.ble.SCAN_MODE_LOW_LATENCY,
            matchMode: this.ble.MATCH_MODE_AGGRESSIVE,
            matchNum: this.ble.MATCH_NUM_MAX_ADVERTISEMENT,
            callbackType: this.ble.CALLBACK_TYPE_ALL_MATCHES,
        }).subscribe(scanData => {
            if (scanData.address && scanData.name && scanData.name.toLowerCase().includes('mi band 3')) {
                if (deviceList.findIndex(d => d.address === scanData.address) === -1) { // ignore duplicates
                    deviceList.push(scanData);
                }
            }
        }, error => {
            this.zone.run( () => {
                this.isScanningSubject.error(error);
                this.isScanningDisabledSubject.next(false);
                this.isScanningSubject.next(false);
            });
        });

        // stop scanning
        this.ble.isScanning().then(value => {
            if (value.isScanning) {
                setTimeout(async () => {
                    try {
                        await this.ble.stopScan();
                        deviceList.sort((a, b) => { return b.rssi - a.rssi; });
                        this.zone.run( () => this.deviceListSubject.next(deviceList));
                    } catch (e) {
                        this.zone.run( () => {
                            this.isScanningSubject.error(e);
                            this.isScanningSubject.next(false);
                            this.isScanningDisabledSubject.next(false);
                        });
                    } finally {
                        this.zone.run( () => this.isScanningSubject.next(false));
                    }
                }, ms)
            }
        }).catch(error => {
            this.zone.run( () => {
                this.isScanningSubject.error(error)
                this.isScanningSubject.next(false);
                this.isScanningDisabledSubject.next(false);
            });
        });
    }

    // address = The address/identifier provided by the scan's return object
    //
    // autoConnect = Automatically connect as soon as the remote device becomes available (Android)
    //
    // transport set to TRANSPORT_LE is the safest for ble (auto can cause issues)
    //
    // firstTime = if true skip (2. auth step) sending encryption key during auth process
    // TODO: fix autoConnect handling => fix reconnect
    public async connect(address: string, autoConnect: boolean = false, firstTime: boolean = false) {
        try {
            await this.blAndPermissionChecks();
            this.firstTimeConnecting = firstTime;
            const wasConnected = (await this.ble.wasConnected({ address })).wasConnected;
            console.log("wasConnected: " + wasConnected.valueOf());
            if (wasConnected) {
                this.zone.run( () => this.connectionStatusSubject.next('connecting') );
                await this.ble.close({ address });
                this.ble.connect({ address, autoConnect, transport: AndroidGattTransportMode.TRANSPORT_LE }).subscribe(async a => await this.setupConnection(a)
                    ,e => this.zone.run( () => {
                            this.connectionStatusSubject.error(e);
                            this.connectionStatusSubject.next('disconnected');
                    }));
            } else {
                this.zone.run( () => this.connectionStatusSubject.next('connecting') );
                // scan is needed before connecting
                this.ble.startScan({
                    services: [],
                    allowDuplicates: false,
                    scanMode: this.ble.SCAN_MODE_LOW_LATENCY,
                    matchMode: this.ble.MATCH_MODE_AGGRESSIVE,
                    matchNum: this.ble.MATCH_NUM_MAX_ADVERTISEMENT,
                    callbackType: this.ble.CALLBACK_TYPE_ALL_MATCHES,
                }).pipe(timeout(5000), filter(s => s.address === address), take(1)).subscribe( async() => {
                    await this.ble.stopScan();
                    this.ble.connect({ address, autoConnect, transport: AndroidGattTransportMode.TRANSPORT_LE }).subscribe(async a => await this.setupConnection(a),e => this.zone.run( () => {
                        this.connectionStatusSubject.error(e);
                        this.connectionStatusSubject.next('disconnected');
                    }));
                },e => {
                    this.zone.run( () => {
                        this.connectionStatusSubject.error(e);
                        this.connectionStatusSubject.next('disconnected');
                    });
                });
            }
        } catch (e) {
            console.log();
            this.zone.run( () => {
                this.connectionStatusSubject.error(e);
                this.connectionStatusSubject.next('disconnected');
            });
        }
    }

    private async setupConnection(connectionData: DeviceInfo): Promise<void> {
        try {
            console.log(BleConnectionService.name + ' -> connection info: ' + JSON.stringify(connectionData));
            if (connectionData.status !== 'connected') { this.zone.run( () => this.connectionStatusSubject.next(connectionData.status)) }
            if (connectionData.status === 'connected') {
                console.log(BleConnectionService.name + ' -> Connected to device');
                this.connectingDevice = new Device(connectionData.name, connectionData.address);
                await this.ble.discover({ address: connectionData.address, clearCache: false }); // discover services
                this.authenticateMiBand(connectionData.address, this.firstTimeConnecting); // start auth process
            } else if (connectionData.status === 'disconnected') {
                this.connectingDevice = null;
                console.log(BleConnectionService.name + ' -> Unexpectedly disconnected');
                // free BL resource if auth failed and gets disconnected
                //await this.ble.close({address: connectionData.address});
                this.zone.run( () => {
                    this.connectionStatusSubject.next(connectionData.status);
                    this.connectingDevice = null;
                    this.connectedDeviceSubject.next(null);
                });
            }
        } catch (e) {
            this.zone.run( () => {
                this.connectionStatusSubject.error(e);
                this.connectionStatusSubject.next('disconnected');
                this.connectedDeviceSubject.next(null);
            });
        }
    }

    public async disconnectAndClose(address: string) {
        try {
            await this.ble.disconnect({address});
            await this.ble.close({address});
            console.log(BleConnectionService.name + ' -> Disconnected successfully!');
        } catch (e) {
            console.error(BleConnectionService.name + ' -> disconnectAndClose error: ' + e.message);
            this.zone.run( () => {
                this.connectionStatusSubject.error(e);
                this.connectionStatusSubject.next('disconnected');
            });
        } finally {
            this.zone.run( () => {
                this.connectedDeviceSubject.next(null);
                this.deviceListSubject.next(undefined);
                this.connectionStatusSubject.next(undefined);
            });
        }
    }

    // Authentication with steps
    private authenticateMiBand(address: string, sendEncryptionKey: boolean) {
        const serviceUUID = this.miBand3.getService('authentication').uuid;
        const characteristicUUID = this.miBand3.getService('authentication').getCharacteristic('auth').uuid;
        this.ble.subscribe({ // 1. set notify on (by sending 2 bytes request (0x01, 0x00) to the Descriptor === subscribe)
            address,
            service: serviceUUID,
            characteristic: characteristicUUID
        }).subscribe(async data => {
            try {
                if (data) {
                    if (data.status === 'subscribed') {
                        console.log(BleConnectionService.name + ' => Subscribed to auth');
                        if (sendEncryptionKey) { // need to send encryption key when connecting for the first time
                            await this.sendEncryptionKey(address, serviceUUID, characteristicUUID); // 2. by writing 2 bytes (0x01 + 0x00)  + encryption key (16 bytes)
                        }  else { // skip 2. (no press button verification) => 3.
                            const writeData = Buffer.from([2, 0]); // 3. Request random key by sending 2 bytes: 0x02 + 0x00
                            await this.write(address, serviceUUID, characteristicUUID, writeData, 'noResponse');
                        }
                    } else {
                        if (data.value) {
                            // TODO: display auth failed msg if fails
                            const response = Buffer.from(this.ble.encodedStringToBytes(data.value)).slice(0, 3).toString('hex'); // get the first 3 bytes to know what to do
                            console.log(BleConnectionService.name + " -> auth response: " + response);
                            if (response === '100101') { // if user did press the button on the Mi Band
                                // authentication level 1
                                console.log(BleConnectionService.name + ' -> Sent key ok');
                                console.log(BleConnectionService.name + ' -> Paired successfully');
                                const writeData = Buffer.from([2, 0]); // 3. Request random key by sending 2 bytes: 0x02 + 0x00
                                await this.write(address, serviceUUID, characteristicUUID, writeData, 'noResponse');
                            } else if (response === '100102') { // if user did not press button on the Mi Band while pairing
                                console.log(BleConnectionService.name + ' -> Pairing failed');
                                // TODO: press the button pls msg or cancel
                                await this.sendEncryptionKey(address, serviceUUID, characteristicUUID); // try again -> send encryption key again
                            } else if (response === '100104') {
                                this.zone.run( () => {
                                    this.connectionStatusSubject.error('Encryption key sending failed!');
                                    this.connectionStatusSubject.next('disconnected');
                                });
                                await this.disconnectAndClose(address);
                            } else if (response === '100201') { // 4. Encrypt the random 16 bytes number with AES/ECB/NoPadding with the encryption key that was sent at 2. step
                                // authentication level 2
                                console.log(BleConnectionService.name + ' -> Requested random key received');
                                const randomData = Buffer.from(this.ble.encodedStringToBytes(data.value)).slice(3, 19); // remove the first 3 bytes
                                const algorithm = 'aes-128-ecb';
                                const cipher = crypto.createCipheriv(algorithm, this.getEncryptionKey(), '').setAutoPadding(false); // create encryptor + disable auto padding
                                const encryptedData = cipher.update(randomData); // encrypt data
                                cipher.final(); // stop cipher
                                const writeData = Buffer.concat([Buffer.from([3, 0]), encryptedData]); // 5. Send 2 bytes 0x03 + 0x00 + encrypted data
                                await this.write(address, serviceUUID, characteristicUUID, writeData, 'noResponse');
                            } else if (response === '100204') { // data request failed
                                this.zone.run(() => {
                                    this.connectionStatusSubject.error('Requesting data failed!');
                                    this.connectionStatusSubject.next('disconnected');
                                });
                                await this.disconnectAndClose(address);
                            } else if (response === '100301') { // 6. Authentication done
                                console.log(BleConnectionService.name + ' -> Authenticated successfully');
                                // run inside Angular Zone to trigger change detection, because sometimes it doesn't trigger
                                this.zone.run(() => {
                                    this.connectingDevice.lastUsedDate = new Date().toISOString();
                                    this.connectedDeviceSubject.next(this.connectingDevice);
                                    this.connectionStatusSubject.next('connected');
                                });
                                await this.ble.unsubscribe({ address, service: serviceUUID, characteristic: characteristicUUID });
                            } else if (response === '100304') { // encryption failed device probably has a different secret key
                                this.zone.run(() => {
                                    this.connectionStatusSubject.error('Encryption failed!');
                                    this.connectionStatusSubject.next('disconnected');
                                });
                                await this.sendEncryptionKey(address, serviceUUID, characteristicUUID);
                            } else {
                                console.error(BleConnectionService.name + ' -> Authentication failed, error code: ' + response);
                                await this.disconnectAndClose(address);
                            }
                        }
                    }
                }

            } catch (error) {
                console.error(BleConnectionService.name + " -> auth error: " + error);
                this.zone.run( () => {
                    this.connectionStatusSubject.error(error);
                    this.connectionStatusSubject.next('disconnected');
                });
            }
        }, error => {
            console.error(BleConnectionService.name + " -> auth sub error: " + error.message || error);
            this.zone.run( () => {
                this.connectionStatusSubject.error(error);
                this.connectionStatusSubject.next('disconnected');
            });
        });
    }

    private async sendEncryptionKey(address: string, service: string, characteristic: string): Promise<OperationResult> {
        const writeData = Buffer.concat([Buffer.from([1, 0]), this.getEncryptionKey()], 18); // 0x01 + 0x00 + encryption key => 18 bytes
        return this.write(address,
            service,
            characteristic,
            writeData, 'noResponse');
    }

    getEncryptionKey() {
        return Buffer.from([50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65]);
    }

    private write(address: string, service: string, characteristic: string, value: Buffer, type?: string): Promise<OperationResult> {
        return this.ble.write({
            address,
            service,
            characteristic,
            value: this.ble.bytesToEncodedString(value),
            type
        });
    }
}
