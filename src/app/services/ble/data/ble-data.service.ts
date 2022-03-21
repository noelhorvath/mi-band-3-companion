import { Injectable } from '@angular/core';
import { BluetoothLE, OperationResult } from '@ionic-native/bluetooth-le/ngx';
import { BleConnectionService } from '../connection/ble-connection.service';
import { MiBand3 } from '../../../shared/models/classes/MiBand3';
import { BehaviorSubject, Observer } from 'rxjs';
import { BatteryInfo } from '../../../shared/models/classes/BatteryInfo';
import { FirebaseAuthService } from '../../firebase/auth/firebase-auth.service';
import { Activity } from '../../../shared/models/classes/Activity';
import { HeartRate } from '../../../shared/models/classes/HeartRate';
import { Service } from '../../../shared/models/classes/Service';
import { ConnectionInfo } from '../../../shared/models/classes/ConnectionInfo';
import { Characteristic } from '../../../shared/models/classes/Characteristic';
import { Property } from '../../../shared/models/classes/Property';
import { LogHelper } from '../../../shared/models/classes/LogHelper';
import { IDevice } from '../../../shared/models/interfaces/IDevice';
import { User } from '@angular/fire/auth';

@Injectable({
    providedIn: 'root'
})
export class BleDataService {
    private readonly logHelper: LogHelper;
    private readonly miBand3: MiBand3;
    // TODO: check BL status
    //private blStatus: string;
    private connectionInfo: ConnectionInfo;
    public activitySubject: BehaviorSubject<Activity | undefined>;
    public batteryInfoSubject: BehaviorSubject<BatteryInfo | undefined>;
    public heartRateSubject: BehaviorSubject<HeartRate | undefined>;
    public isSubscribedSubject: BehaviorSubject<boolean>;

    public constructor(
        private ble: BluetoothLE,
        private bleConnectionService: BleConnectionService,
        private authService: FirebaseAuthService
    ) {
        this.logHelper = new LogHelper(BleDataService.name);
        this.connectionInfo = new ConnectionInfo();
        this.miBand3 = MiBand3.getInstance();
        this.batteryInfoSubject = new BehaviorSubject<BatteryInfo | undefined>(undefined);
        this.activitySubject = new BehaviorSubject<Activity | undefined>(undefined);
        this.heartRateSubject = new BehaviorSubject<HeartRate | undefined>(undefined);
        this.isSubscribedSubject = new BehaviorSubject<boolean>(false);
        this.bleConnectionService.connectionInfoSubject.subscribe({
            next: (info: ConnectionInfo) => {
                this.connectionInfo = info;
                if (info.isDisconnected()) {
                    this.isSubscribedSubject.next(false);
                    this.batteryInfoSubject.next(undefined);
                    this.activitySubject.next(undefined);
                    this.heartRateSubject.next(undefined);
                }
            },
            error: (e: unknown) => {
                this.logHelper.logError('connectionInfoSubject', e);
            }
        });
        this.authService.authUserSubject.subscribe( (user: User | undefined) => {
            // reset data
            if (user === undefined) {
                this.isSubscribedSubject.next(false);
                this.batteryInfoSubject.next(undefined);
                this.activitySubject.next(undefined);
                this.heartRateSubject.next(undefined);
            }
        });
    }

    public subscribe(deviceData: string | IDevice, service: string, characteristic: string, observer: Partial<Observer<OperationResult>>): void {
        this.ble.subscribe({
            address: typeof deviceData === 'string' ? deviceData : deviceData.macAddress,
            service,
            characteristic
        }).subscribe(observer);
    }

    // TODO: check if data.value is not undefined

    private processData(data: OperationResult): void {
        if (data.value !== undefined) {
            const char = data.characteristic.toLowerCase();
            const service = data.service.toLowerCase();
            const bytes = this.ble.encodedStringToBytes(data.value);
            this.logHelper.logDefault(this.processData.name, 'data', { value: bytes });
            this.logHelper.logDefault(this.processData.name, 'service', { value: service });
            this.logHelper.logDefault(this.processData.name, 'char', { value: char });
            if (service === this.miBand3.getService('mi band')?.getShortenedUUID()) {
                if (char === (this.miBand3.getService('mi band')?.getCharacteristic('activity'))?.getShortenedUUID()) {
                    this.logHelper.logDefault(this.processData.name, 'activity', { value: bytes });
                    this.logHelper.logDefault(this.processData.name, 'activity length', { value: bytes.length });
                } else if (char === (this.miBand3.getService('mi band')?.getCharacteristic('battery'))?.getShortenedUUID()) {
                    const batteryInfo = new BatteryInfo();
                    const unknown_value = bytes.at(0); // first byte ???
                    batteryInfo.device = this.connectionInfo.device;
                    batteryInfo.batteryLevel = bytes.at(1) as number;
                    batteryInfo.isCharging = bytes.at(2) === 1;
                    if (3 < bytes.length) {
                        batteryInfo.prevChargeDate = this.dateFromBytes(bytes, 3)?.toISOString(); // 7 bytes
                        batteryInfo.prevNumOfCharges = bytes.at(10);
                        batteryInfo.lastChargeDate = this.dateFromBytes(bytes, 11)?.toISOString(); // 7 bytes
                        batteryInfo.lastNumOfCharges = bytes.at(18);
                        batteryInfo.lastChargeLevel = bytes.at(19);
                    }
                    this.logHelper.logDefault(this.processData.name, 'batteryInfo', { value: batteryInfo });
                    this.logHelper.logDefault(this.processData.name, 'batteryInfo unknown value', { value: unknown_value });
                    this.batteryInfoSubject.next(batteryInfo);
                } else if (char === (this.miBand3.getService('mi band')?.getCharacteristic('realtime activity'))?.getShortenedUUID()) {
                    // 3 bytes steps count, 4 distance in meters, 5. calorie
                    const activity = new Activity();
                    activity.device = this.connectionInfo.device;
                    activity.steps = this.bytesToInt(bytes.subarray(1, 5));
                    if (5 < bytes.length) {
                        activity.distance = this.bytesToInt(bytes.subarray(5, 9));
                        if (9 < bytes.length) {
                            activity.calories = this.bytesToInt(bytes.subarray(9, 13));
                        }
                    }
                    this.logHelper.logDefault(this.processData.name, 'realtime activity' + JSON.stringify(activity));
                    this.activitySubject.next(activity);
                } else if (char === (this.miBand3.getService('mi band')?.getCharacteristic('time'))?.getShortenedUUID()) {
                    // {"7":3,"8":0,"9":0,"10":4} last 4 bytes ??
                    const date = this.dateFromBytes(bytes);
                    this.logHelper.logDefault(this.processData.name, 'currentTime', { value: date });
                } else if (char === (this.miBand3.getService('mi band')?.getCharacteristic('sensor control'))?.getShortenedUUID()) {
                    this.logHelper.logDefault(this.processData.name, 'sensorControl', { value: bytes });
                    this.logHelper.logDefault(this.processData.name, 'sensorControl length', { value: bytes.length });
                } else if (char === (this.miBand3.getService('mi band')?.getCharacteristic('sensor data'))?.getShortenedUUID()) {
                    this.logHelper.logDefault(this.processData.name, 'sensorData', { value: bytes });
                    this.logHelper.logDefault(this.processData.name, 'sensorData length', { value: bytes.length });
                } else if (char === (this.miBand3.getService('mi band')?.getCharacteristic('config'))?.getShortenedUUID()) {
                    this.logHelper.logDefault(this.processData.name, 'config', { value: bytes });
                    this.logHelper.logDefault(this.processData.name, 'config length', { value: bytes.length });
                } else if (char === (this.miBand3.getService('mi band')?.getCharacteristic('connection parameters'))?.getShortenedUUID()) {
                    this.logHelper.logDefault(this.processData.name, 'conParams', { value: bytes });
                    this.logHelper.logDefault(this.processData.name, 'conParams length', { value: bytes.length });
                } else if (char === (this.miBand3.getService('mi band')?.getCharacteristic('fetch'))?.getShortenedUUID()) {
                    this.logHelper.logDefault(this.processData.name, 'fetch', { value: bytes });
                    this.logHelper.logDefault(this.processData.name, 'fetch length', { value: bytes.length });
                } else if (char === (this.miBand3.getService('mi band')?.getCharacteristic('user settings'))?.getShortenedUUID()) {
                    this.logHelper.logDefault(this.processData.name, 'userSettings', { value: bytes });
                    this.logHelper.logDefault(this.processData.name, 'userSettings length', { value: bytes.length });
                } else if (char === (this.miBand3.getService('mi band')?.getCharacteristic('event'))?.getShortenedUUID()) {
                    this.logHelper.logDefault(this.processData.name, 'event', { value: bytes });
                    this.logHelper.logDefault(this.processData.name, 'event length', { value: bytes.length });
                } else if (char === (this.miBand3.getService('mi band')?.getCharacteristic('transfer'))?.getShortenedUUID()) {
                    this.logHelper.logDefault(this.processData.name, 'transfer', { value: bytes });
                    this.logHelper.logDefault(this.processData.name, 'transfer length', { value: bytes.length });
                } else if (char === (this.miBand3.getService('mi band')?.getCharacteristic('unknown f'))?.getShortenedUUID()) {
                    this.logHelper.logDefault(this.processData.name, 'unknown_f', { value: bytes });
                    this.logHelper.logDefault(this.processData.name, 'unknown_f length', { value: bytes.length });
                }
            } else if (service === this.miBand3.getService('heart rate')?.getShortenedUUID()) {
                // 2 bytes == bpm value
                const heartRate = new HeartRate();
                heartRate.device = this.connectionInfo.device;
                heartRate.bpm = this.bytesToInt(bytes);
                this.logHelper.logDefault(this.processData.name, 'heartRateMeasurement', { value: heartRate });
                this.heartRateSubject.next(heartRate);
            } else if (service === this.miBand3.getService('alert notification')?.getShortenedUUID()) {
                if (char === (this.miBand3.getService('alert notification')?.getCharacteristic('notification control'))?.getShortenedUUID()) {
                    this.logHelper.logDefault(this.processData.name, 'notification', { value: bytes });
                    this.logHelper.logDefault(this.processData.name, 'notification length', { value: bytes.length });
                }
            }
        } else {
            this.logHelper.logDefault(this.processData.name, 'data value is undefined', { value: data });
        }
    }

    private processDataObserver(processFunction: (value: OperationResult) => void): Partial<Observer<OperationResult>> {
        return {
            next: processFunction,
            error: (e: unknown): void => {
                if (e instanceof Error && e.message !== 'Device is disconnected') {
                    this.logHelper.logDefault(this.processDataObserver.name, e);
                }
            }
        };
    }

    public bytesToInt(bytes: Uint8Array): number {
        if (!bytes) {
            return 0;
        }
        let res = 0;
        for (let i = bytes.length - 1; 0 <= i; i--) {
            res = bytes[i] !== 0 ? res * 256 + bytes[i] : res + bytes[i];
        }
        return res;
    }

    private read(deviceData: string | IDevice, service: string, characteristic: string): Promise<OperationResult> {
        return this.ble.read({
            address: typeof deviceData === 'string' ? deviceData : deviceData.macAddress,
            service,
            characteristic
        });
    }

    /*
    private write(address: string, service: string, characteristic: string, value: Uint8Array, type?: string): Promise<OperationResult> {
        return this.ble.write({
            address,
            service,
            characteristic,
            value: this.ble.bytesToEncodedString(value),
            type
        });
    }
     */

    public async initBLESubscriptions(deviceData: string | IDevice): Promise<void> {
        this.miBand3.services.map((s: Service) => {
            if (!s.name?.toLowerCase().includes('authentication') && !s.name?.toLowerCase().includes('heart')) {
                s.characteristics.map((c: Characteristic) => {
                    if (c.properties.find((p: Property) => p && p.name && p.name.toLowerCase() === 'notify')) {
                        this.subscribe(
                            typeof deviceData === 'string' ? deviceData : deviceData.macAddress,
                            s.uuid,
                            c.uuid,
                            this.processDataObserver((value: OperationResult) => this.processData(value))
                        );
                    }
                });
            }
        });
        this.isSubscribedSubject.next(true);
    }

    public readAllData(deviceData: string | IDevice): void {
        this.miBand3.services.map((s: Service) => {
            if (!s.name?.toLowerCase().includes('authentication')) {
                s.characteristics.map(async (c: Characteristic) => {
                    if (c.properties.find((p: Property) => p && p.name && p.name.toLowerCase() === 'read')) {
                        try {
                            this.processData(await this.read(typeof deviceData === 'string' ? deviceData : deviceData.macAddress, s.uuid, c.uuid));
                        } catch (e: unknown) {
                            this.logHelper.logError(this.readAllData.name, e);
                        }
                    }
                });
            }
        });
    }

    private dateFromBytes(bytes: Uint8Array, startIndex: number = 0): Date | undefined {
        const date = new Date();
        if (bytes.length < 7) {
            return undefined;
        }
        date.setFullYear(
            this.bytesToInt(bytes.subarray(startIndex, startIndex + 2)),
            bytes.at(startIndex + 2) as number,
            bytes.at(startIndex + 3)
        );
        date.setHours(
            bytes.at(startIndex + 4) as number,
            bytes.at(startIndex + 5),
            bytes.at(startIndex + 6),
            0
        );
        return date;
    }
}
