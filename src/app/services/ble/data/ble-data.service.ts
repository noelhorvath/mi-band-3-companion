import {Injectable, NgZone} from '@angular/core';
import {BluetoothLE, OperationResult} from "@ionic-native/bluetooth-le/ngx";
import {BleConnectionService} from "../connection/ble-connection.service";
import {MiBand3} from "../../../shared/models/classes/MiBand3";
import {BehaviorSubject} from "rxjs";
import {BatteryInfo} from "../../../shared/models/classes/BatteryInfo";
import {AuthService} from "../../firebase/auth/auth.service";
import {Activity} from "../../../shared/models/classes/Activity";

@Injectable({
    providedIn: 'root'
})

export class BleDataService {
    public blStatus: string;
    public connectedDevice: string;
    public isSubscribedSubject: BehaviorSubject<boolean>
    private miBand3: MiBand3;
    public batteryInfoSubject: BehaviorSubject<BatteryInfo>;
    public activitySubject: BehaviorSubject<Activity>;
    public heartRateSubject: BehaviorSubject<number>;

    constructor(
        private ble: BluetoothLE,
        private bleConnectionService: BleConnectionService,
        private zone: NgZone,
        private authService: AuthService
    ) {
        this.miBand3 = MiBand3.getInstance();
        this.batteryInfoSubject = new BehaviorSubject<BatteryInfo>(null);
        this.activitySubject = new BehaviorSubject<Activity>(null);
        this.heartRateSubject = new BehaviorSubject<number>(null);
        this.isSubscribedSubject = new BehaviorSubject<boolean>(false);
        this.bleConnectionService.connectionStatusSubject.subscribe( status => {
           if (status === 'disconnected' || !status) {
               this.isSubscribedSubject.next(false);
               this.batteryInfoSubject.next(null);
               this.activitySubject.next(null);
               this.heartRateSubject.next(null);
           }
        });
        this.authService.authUserSubject.subscribe( user => {
            // reset data
            if (!user) {
                this.zone.run( () => {
                    this.isSubscribedSubject.next(false);
                    this.batteryInfoSubject.next(null);
                    this.activitySubject.next(null);
                    this.heartRateSubject.next(null);
                });
            }
        });
    }

    public subscribe(address: string, service: string, characteristic: string) {
        this.ble.subscribe({
            address,
            service,
            characteristic
        }).subscribe(data => this.processData(data), e => {
            if (e && e.message !== 'Device is disconnected') { console.log(BleDataService.name + ' -> ble subscribe error:' + e) }
        });
    }

    private processData(data: OperationResult): void {
        if (data && data.value) {
            const char = data.characteristic.toLowerCase();
            const service = data.service.toLowerCase();
            const bytes = this.ble.encodedStringToBytes(data.value);
            console.log('data: ' + JSON.stringify(bytes));
            console.log('service: ' + service);
            console.log('char: ' + char);
            if (service === this.miBand3.getService('mi band').getShortenedUUID()) {
                if (char === (this.miBand3.getService('mi band').getCharacteristic('activity')).getShortenedUUID()) {
                    console.log('activity: ' + JSON.stringify(bytes));
                    console.log('activity length: ' + bytes.length);
                } else if (char === (this.miBand3.getService('mi band').getCharacteristic('battery')).getShortenedUUID()) {
                    const batteryInfo = new BatteryInfo();
                    const unknown_value = bytes.at(0); // first byte ???
                    batteryInfo.batteryLevel = bytes.at(1);
                    batteryInfo.isCharging = bytes.at(2) === 1;
                    if (3 < bytes.length) {
                        batteryInfo.prevChargeDate = this.dateFromBytes(bytes, 3); // 7 bytes
                        batteryInfo.prevNumOfCharges = bytes.at(10);
                        batteryInfo.lastChargeDate = this.dateFromBytes(bytes, 11); // 7 bytes
                        batteryInfo.lastNumOfCharges = bytes.at(18);
                        batteryInfo.lastChargeLevel = bytes.at(19);
                    }
                    console.log('batteryInfo: ' + JSON.stringify(batteryInfo));
                    console.log('batteryInfo unknown value: ' + unknown_value);
                    this.zone.run( () => this.batteryInfoSubject.next(batteryInfo) );
                } else if (char === (this.miBand3.getService('mi band').getCharacteristic('realtime activity')).getShortenedUUID()) {
                    // 3 bytes steps count, 4 distance in meters, 5. calorie
                    const activity = new Activity();
                    activity.steps = this.bytesToInt(bytes.subarray(1, 5));
                    if (5 < bytes.length) {
                        activity.distance = this.bytesToInt(bytes.subarray(5, 9));
                        if (9 < bytes.length) {
                            activity.calories = this.bytesToInt(bytes.subarray(9, 13));
                        }
                    }
                    console.log('realtime activity: ' + JSON.stringify(activity));
                    this.zone.run( () => this.activitySubject.next(activity) );
                } else if (char === (this.miBand3.getService('mi band').getCharacteristic('time')).getShortenedUUID()) {
                    // {"7":3,"8":0,"9":0,"10":4} last 4 bytes ??
                    const date = this.dateFromBytes(bytes);
                    console.log('currentTime: ' + date);
                } else if (char === (this.miBand3.getService('mi band').getCharacteristic('sensor control')).getShortenedUUID()) {
                    console.log('sensorControl: ' + JSON.stringify(bytes));
                    console.log('sensorControl length: ' + bytes.length);
                } else if (char === (this.miBand3.getService('mi band').getCharacteristic('sensor data')).getShortenedUUID()) {
                    console.log('sensorData: ' + JSON.stringify(bytes));
                    console.log('sensorData length: ' + bytes.length);
                } else if (char === (this.miBand3.getService('mi band').getCharacteristic('config')).getShortenedUUID()) {
                    console.log('config: ' + JSON.stringify(bytes));
                    console.log('config length: ' + bytes.length);
                } else if (char === (this.miBand3.getService('mi band').getCharacteristic('connection parameters')).getShortenedUUID()) {
                    console.log('conParams: ' + JSON.stringify(bytes));
                    console.log('conParams length: ' + bytes.length);
                } else if (char === (this.miBand3.getService('mi band').getCharacteristic('fetch')).getShortenedUUID()) {
                    console.log('fetch: ' + JSON.stringify(bytes));
                    console.log('fetch length: ' + bytes.length);
                } else if (char === (this.miBand3.getService('mi band').getCharacteristic('user settings')).getShortenedUUID()) {
                    console.log('userSettings: ' + JSON.stringify(bytes));
                    console.log('userSettings length: ' + bytes.length);
                } else if (char === (this.miBand3.getService('mi band').getCharacteristic('event')).getShortenedUUID()) {
                    console.log('event: ' + JSON.stringify(bytes));
                    console.log('event length: ' + bytes.length);
                } else if (char === (this.miBand3.getService('mi band').getCharacteristic('transfer')).getShortenedUUID()) {
                    console.log('transfer: ' + JSON.stringify(bytes));
                    console.log('transfer length: ' + bytes.length);
                } else if (char === (this.miBand3.getService('mi band').getCharacteristic('unknown f')).getShortenedUUID()) {
                    console.log('unknown_f: ' + JSON.stringify(bytes));
                    console.log('unknown_f length: ' + bytes.length);
                }
            } else if (service === this.miBand3.getService('heart rate').getShortenedUUID()) {
                if (char === (this.miBand3.getService('heart rate').getCharacteristic('measurement')).getShortenedUUID()) {
                    // 2 bytes == bpm value
                    const heartRate = this.bytesToInt(bytes);
                    console.log('heartRateMeasurement: ' + heartRate);
                    this.zone.run( () => this.heartRateSubject.next(heartRate));
                }
            } else if (service === this.miBand3.getService('alert notification').getShortenedUUID()) {
                if (char === (this.miBand3.getService('alert notification').getCharacteristic('notification control')).getShortenedUUID()) {
                    console.log('notification: ' + JSON.stringify(bytes));
                    console.log('notification length: ' + bytes.length);
                }
            }
        }
    }

    private bytesToInt(bytes: Uint8Array): number {
        if (!bytes) { return 0; }
        let res = 0;
        for(let i = bytes.length-1; 0 <= i; i--) {
            res = bytes[i] !== 0 ? res*256 + bytes[i] : res + bytes[i];
        }
        return res;
    }

    private read(address: string, service: string, characteristic: string): Promise<OperationResult> {
        return this.ble.read({
            address,
            service,
            characteristic
        });
    }

    private write(address: string, service: string, characteristic: string, value: Uint8Array, type?: string): Promise<OperationResult> {
        return this.ble.write({
            address,
            service,
            characteristic,
            value: this.ble.bytesToEncodedString(value),
            type
        });
    }

    public async initBLESubscriptions(address: string): Promise<void> {
        this.miBand3.services.forEach( s => {
           if (!s.name.toLowerCase().includes('authentication')) {
               s.characteristics.forEach( c => {
                   if (c.properties.find( p => p && p.name && p.name.toLowerCase() === 'notify')) {
                       this.subscribe(address, s.uuid, c.uuid);
                   }
               });
           }
        });
        this.isSubscribedSubject.next(true);
    }

    public readAllData(device: string): void {
        this.miBand3.services.forEach( s => {
            if (!s.name.toLowerCase().includes('authentication')) {
                s.characteristics.forEach( c => {
                    if (c.properties.find( p => p && p.name && p.name.toLowerCase() === 'read')) {
                        this.read(device, s.uuid, c.uuid)
                            .then(data => this.processData(data))
                            .catch( e => console.error(BleDataService.name + ' -> read error: ' + JSON.stringify(e)));
                    }
                });
            }
        });
    }

    private dateFromBytes(bytes: Uint8Array, startIndex: number = 0): string | null {
        const date = new Date();
        if (bytes.length < 7) { return null; }
        date.setFullYear(
            this.bytesToInt(bytes.subarray(startIndex, startIndex+2)),
            bytes.at(startIndex+2) - 1,
            bytes.at(startIndex+3)
        );
        date.setHours(
            bytes.at(startIndex+4),
            bytes.at(startIndex+5),
            bytes.at(startIndex+6),
            0
        );
        return date.toISOString();
    }
}
