import {Injectable, NgZone} from '@angular/core';
import {BluetoothLE, Device, DeviceInfo, ScanStatus} from '@ionic-native/bluetooth-le/ngx';
import {Platform} from '@ionic/angular';
import {BehaviorSubject, Subject, Subscription} from 'rxjs';
import {BLEConstants} from '../../../shared/models/constants/BLE.constants';
import {MessageService} from '../../message/message.service';
import * as crypto from 'crypto-browserify';
import {Buffer} from 'buffer';

@Injectable({
  providedIn: 'root'
})
export class BleConnectionService {
  public blStatusSubject: Subject<string>;
  public connectionStatusSubject: Subject<string>;
  private blStatus: string;
  private blStatusSubscription: Subscription;
  private deviceInfo: Device;
  public deviceListSubject: BehaviorSubject<ScanStatus[]>
  public isScanningSubject: BehaviorSubject<boolean>
  private isScanningSubscription: Subscription;
  public isScanningDisabledSubject: BehaviorSubject<boolean>;
  private isScanning: boolean;
  private encryptionKey: Buffer;
  public isAuthenticatedSubject: BehaviorSubject<boolean>;
  private isAuthenticated: boolean;
  private isAuthenticatedSubscription: Subscription;
  public connectedDeviceSubject: BehaviorSubject<string>;

  constructor(
    private ble: BluetoothLE,
    private platform: Platform,
    private messageService: MessageService,
    private zone: NgZone
  ) {
    this.platform.ready().then(readySource => {
      console.log(readySource);
      this.initializeBL();
    });
    this.blStatusSubject = new Subject<string>();
    this.connectionStatusSubject = new Subject<string>();
    this.deviceListSubject = new BehaviorSubject<ScanStatus[]>(undefined);
    this.isScanningSubject = new BehaviorSubject<boolean>(false);
    this.isScanningDisabledSubject = new BehaviorSubject<boolean>(false);
    this.isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
    this.connectedDeviceSubject = new BehaviorSubject<string>(null);
    // TODO: set auth status correctly

    this.isAuthenticatedSubscription = this.isAuthenticatedSubject.subscribe(value => {
      this.isAuthenticated = value;
    });
    this.blStatusSubscription = this.blStatusSubject.subscribe((status: string) => {
      this.blStatus = status;
    });
    this.isScanningSubscription = this.isScanningSubject.subscribe(value => {
      this.isScanning = value;
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
      this.blStatusSubject.next(status.status);
    }, error => {
      this.messageService.errorHandler(BleConnectionService.name, 'init BL error', error, 'toast');
    });
    console.log('Bluetooth has been initialized!');
  }

  // Android prevents applications from starting and stopping scans more than 5 times in 30 seconds
  // if it happens then 30 timeout
  // so wait at least 7 seconds after each scan if user could "abuse" scanning
  public scanForDevices(ms = 2000) {
    let deviceList: ScanStatus[] = [];
    this.isScanningSubject.next(true);
    this.isScanningDisabledSubject.next(true);
    this.ble.startScan({
      services: [],
      allowDuplicates: false,
      scanMode: this.ble.SCAN_MODE_LOW_LATENCY,
      matchMode: this.ble.MATCH_MODE_AGGRESSIVE,
      matchNum: this.ble.MATCH_NUM_MAX_ADVERTISEMENT,
      callbackType: this.ble.CALLBACK_TYPE_ALL_MATCHES,
    }).subscribe(scanData => {
      console.log(BleConnectionService.name + ' -> Scan result: ' + JSON.stringify(scanData));
      // name could be: Xiaomi / Mi Band 3
      if (scanData.address && scanData.name && scanData.name.toLowerCase().includes('mi band 3')) {
        // ignore duplicates
        if (deviceList.findIndex(d => d.address === scanData.address) === -1) {
          deviceList.push(scanData);
          console.log(BleConnectionService.name + ' -> Device advertisement: ' + JSON.stringify(scanData.advertisement));
        }
      }
    }, error => {
      this.isScanningSubject.next(false);
      this.isScanningDisabledSubject.next(false);
      this.messageService.errorHandler(BleConnectionService.name, 'Scan error', error, 'alert');
    });

    // stop scanning
    this.ble.isScanning().then(value => {
      if (value.isScanning) {
        setTimeout(async () => {
          this.ble.stopScan().then(() => {
            // sort results by rssi in descending order
            deviceList.sort((a, b) => {
              return a.rssi > b.rssi ? -1 : (a.rssi < b.rssi ? 1 : 0);
            });
            this.deviceListSubject.next(deviceList);
          }).catch(error => {
            this.messageService.errorHandler(BleConnectionService.name, 'Stop scan error', error, 'alert');
            this.isScanningDisabledSubject.next(false);
          }).finally(() => {
            this.isScanningSubject.next(false);
          });
        }, ms)
      }
    });
  }

  // address = The address/identifier provided by the scan's return object
  //
  // autoConnect = Automatically connect as soon as the remote device becomes available (Android)
  public async connect(address, autoConnect = true) {
    let wasConnected = null;
    try {
      let tmp = await this.ble.wasConnected({address});
      wasConnected = tmp.wasConnected;
    } catch (e) {
      console.error(BleConnectionService.name + " -> wasConnected error: " + e.message);
    }
    if (wasConnected) {
      this.ble.reconnect({address}).subscribe(cd => this.setupConnection(cd), error => {
        this.messageService.errorHandler(BleConnectionService.name, 'Reconnect error', error, 'alert');
      });
    } else {
      this.ble.connect({address, autoConnect}).subscribe(cd => this.setupConnection(cd), error => {
        this.messageService.errorHandler(BleConnectionService.name, 'Connect error', error, 'alert');
      });
    }
  }

  private setupConnection(connectionData: DeviceInfo) {
    console.log(BleConnectionService.name + ' -> connection info: ' + JSON.stringify(connectionData));
    // update connection status change
    this.connectionStatusSubject.next(connectionData.status);
    if (connectionData.status === 'connected') {
      console.log(BleConnectionService.name + ' -> Connected to device');
      this.connectedDeviceSubject.next(connectionData.address);
      // discover services
      this.ble.discover({address: connectionData.address, clearCache: false}).then(deviceInfo => {
        this.deviceInfo = deviceInfo;
        // start auth process
        this.authenticateMiBand(connectionData.address);
      }).catch(error => {
        console.error(BleConnectionService.name + ' -> Discover error: ' + error.message);
      });
    } else if (connectionData.status === 'disconnected') {
      console.log(BleConnectionService.name + ' -> Unexpectedly disconnected');
      // free BL resource if auth failed and gets disconnected
      if (!this.isAuthenticated) {
        this.ble.close({address: connectionData.address}).then(() => {
          console.log(BleConnectionService.name + ' -> BL resource closed');
        }).catch(e => {
          console.error(BleConnectionService.name + ' -> close error: ' + e.message);
        });
      }
    }
  }

  public disconnectAndClose(address: string) {
    this.ble.disconnect({address}).then(() => {
      this.ble.close({address}).then(() => {
        console.log(BleConnectionService.name + ' -> Disconnected successfully!');
        this.isAuthenticatedSubject.next(false);
        this.connectedDeviceSubject.next(null);
        this.deviceListSubject.next(undefined);
      }).catch(e => {
        console.error(BleConnectionService.name + ' -> close error: ' + e.message);
      });
    }).catch(e => {
      console.error(BleConnectionService.name + ' -> disconnect error: ' + e.message);
    });
  }

  private authenticateMiBand(address: string) {
    // Authentication steps
    // 1. set notify on (by sending 2 bytes request (0x01,0x00) to the Descriptor === subscribe)
    const serviceUUID = BLEConstants.AuthenticationService.uuid;
    const characteristicUUID = BLEConstants.AuthenticationService.getCharacteristic("Authentication").uuid;
    this.ble.subscribe({
      address,
      service: serviceUUID,
      characteristic: characteristicUUID
    }).subscribe(data => {
      if (data.status === 'subscribed') {
        console.log(BleConnectionService.name + ' => Subscribed to auth');
        // 2. by writing 2 bytes (0x01 + 1 byte)  + encryption key (16 bytes)
        this.sendRandomEncryptionKey(address);
      } else {
        if (data.value) {
          // TODO: display auth failed msg if fails
          // get the first 3 bytes to know what to do
          const response = Buffer.from(this.ble.encodedStringToBytes(data.value)).slice(0, 3).toString('hex');
          if (response === '100101') {
            // authentication level 1
            // if user did press the button on mi band
            console.log(BleConnectionService.name + ' -> Sent key ok');
            console.log(BleConnectionService.name + ' -> Paired successfully');
            // 3. Request random key by sending 2 bytes: 0x02 + 1 byte
            const writeData = Buffer.from([2, 0]);
            this.write(address, serviceUUID, characteristicUUID, writeData, 'noResponse')
              .then(() => console.log(BleConnectionService.name + ' -> Request sent'))
              .catch(e => console.error(BleConnectionService.name + ' -> (Auth level 1) Write error: ' + e.message));
          } else if (response === '100102') {
            // if user did not press button on mi band
            console.log(BleConnectionService.name + ' -> Pairing failed');
            // try again -> send encryption key again
            // TODO: press the button pls msg or cancel
            this.sendRandomEncryptionKey(address);
          } else if (response === '100104') {
            this.messageService.errorHandler(BleConnectionService.name, 'Authentication error', 'Encryption key sending failed!', 'alert');
            this.disconnectAndClose(address);
          } else if (response === '100201') {
            // authentication level 2
            console.log(BleConnectionService.name + ' -> Requested random key received');
            // 4. Encrypt the random 16 bytes number with AES/ECB/NoPadding with the encryption key that was sent at 2. step
            // remove the first 3 bytes
            const randomData = Buffer.from(this.ble.encodedStringToBytes(data.value)).slice(3, 19);
            const algorithm = 'aes-128-ecb';
            // create encryptor + disable auto padding
            const cipher = crypto.createCipheriv(algorithm, this.encryptionKey, '').setAutoPadding(false);
            // encrypt data
            const encryptedData = cipher.update(randomData);
            // stop cipher
            cipher.final();
            // 5. Send 2 bytes 0x03 + 1 byte + encrypted data
            const writeData = Buffer.concat([Buffer.from([3, 0]), encryptedData]);
            this.write(address, serviceUUID, characteristicUUID, writeData, 'noResponse')
              .then(() => console.log(BleConnectionService.name + ' -> Encrypted number sent'))
              .catch(e => console.error(BleConnectionService.name + ' -> (Auth level 2) Write error: ' + e.message));
          } else if (response === '100204') {
            this.messageService.errorHandler(BleConnectionService.name, 'Authentication error', 'Requesting data failed!', 'alert');
            this.disconnectAndClose(address);
          } else if (response === '100301') {
            // 6. Authentication done
            console.log(BleConnectionService.name + ' -> Authenticated successfully');
            // run inside Angular Zone to trigger change detection, because sometimes it doesn't trigger
            this.zone.run(() => {
              this.isAuthenticatedSubject.next(true);
            });
            // TODO: trigger change detection with zone
            this.ble.unsubscribe({
              address,
              service: serviceUUID,
              characteristic: characteristicUUID
            }).then(() => {
              console.log(BleConnectionService.name + ' -> Auth notify turned off');
            }).catch(e => console.error(BleConnectionService.name + ' -> Auth unsubscribe error: ' + e.message));
          } else if (response === '100304') {
            this.messageService.errorHandler(BleConnectionService.name, 'Authentication error', 'Encryption failed!', 'alert');
            this.disconnectAndClose(address);
            // TODO: maybe start auth process again? , but timeout 30 seconds is short
          } else {
            console.error(BleConnectionService.name + ' -> Authentication failed, error code: ' + response);
            this.disconnectAndClose(address);
          }
        }
      }
    }, error => {
      console.error(BleConnectionService.name + " auth sub error: " + error.message || error);
    });
  }

  private sendRandomEncryptionKey(address: string) {
    // create random (AES-128) 16 bytes
    this.encryptionKey = crypto.randomBytes(16); // output is a new Buffer containing the generated bytes
    // 0x01 + 1 byte + encryption key => 18 bytes
    const writeData = Buffer.concat([Buffer.from([1, 0]), this.encryptionKey], 18);
    this.write(address,
      BLEConstants.AuthenticationService.uuid,
      BLEConstants.AuthenticationService.getCharacteristic("authentication").uuid,
      writeData, 'noResponse')
      .then(() => console.log(BleConnectionService.name + ' -> Encryption key sent'))
      .catch(e => console.error(BleConnectionService.name + ' -> (Auth level 0) Write error: ' + e.message));
  }

  private write(address, service, characteristic, value, type?) {
    return this.ble.write({
      address,
      service,
      characteristic,
      value: this.ble.bytesToEncodedString(value),
      type
    });
  }
}
