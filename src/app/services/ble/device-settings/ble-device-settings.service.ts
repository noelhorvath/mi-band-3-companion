import { Injectable } from '@angular/core';
import { BleBaseService } from '../base/ble-base.service';
import { BluetoothLE } from '@ionic-native/bluetooth-le/ngx';
import { IDevice } from '../../../shared/models/interfaces/IDevice';
import { LogHelper } from '../../../shared/models/classes/LogHelper';
import { FireTimestamp } from '../../../shared/models/classes/FireTimestamp';
import { IUser } from '../../../shared/models/interfaces/IUser';
import { BLEGender } from '../../../shared/enums/ble.enum';
import { instantiate } from '../../../shared/functions/parser.functions';

@Injectable({
    providedIn: 'root'
})
export class BleDeviceSettingsService extends BleBaseService {
    private readonly logHelper: LogHelper;

    public constructor(ble: BluetoothLE) {
        super(ble);
        this.logHelper = new LogHelper(BleDeviceSettingsService.name);
    }

    // needs to be initialized otherwise distance and calories are not going to be shown on Mi Band 3
    // most likely distance and burned calories are calculated by height and weight
    // does height affect step measuring ???
    public async setUserInfo(device: string | IDevice, user: IUser): Promise<void> {
        /*
        0. start command = 0x4f
        1. ???
        2. ???
        3-4. birth year
        5. birth month
        6. birth day
        7. sex (0,1,2) 0 == male, 1 == female , 2 == other
        8-9. height
        10-11. weight
        12-15. MI Fit id or username ? => random id 32 bit
        */
        const service = this.miBand3.getServiceByName('mi band');
        const characteristic = service?.getCharacteristicByName('user settings');
        if (service === undefined) {
            throw new Error('Failed to get Mi Band service');
        } else if (characteristic === undefined) {
            throw new Error('Failed to get User Settings characteristic');
        }
        this.logHelper.logDefault(this.setUserInfo.name, 'sending user settings...');
        const genderValue = user.gender === 'male' ? BLEGender.MALE : (user.gender === 'female' ? BLEGender.FEMALE : BLEGender.OTHER);
        if (user.bandUserId < 256 ** 4 && user.height < 256 ** 2 && user.weight < 256 ** 2) {
            const birthDate = (user.birthDate instanceof FireTimestamp ? user.birthDate : instantiate(user.birthDate, FireTimestamp)).toDate();
            try {
                await this.write(device, service, characteristic, Uint8Array.from(
                    [
                        0x4f,
                        0x00,
                        0x00,
                        ...this.bytesFromInt(birthDate.getFullYear(), 2),
                        birthDate.getMonth() + 1,
                        birthDate.getDate(),
                        genderValue,
                        ...this.bytesFromInt(user.height, 2),
                        ...this.bytesFromInt(user.weight, 2),
                        ...this.bytesFromInt(user.bandUserId, 4)
                    ] // 16 bytes
                ));
            } catch (e: unknown) {
                this.logHelper.logError(this.setCurrentTime.name, 'write user settings error', { value: e });
            }
        } else {
            throw new Error('Invalid user data');
        }
    }

    public async setCurrentTime(device: string | IDevice): Promise<void> {
        const service = this.miBand3.getServiceByName('mi band');
        const characteristic = service?.getCharacteristicByName('current time');
        if (service === undefined) {
            throw new Error('Failed to get Mi Band service');
        } else if (characteristic === undefined) {
            throw new Error('Failed to get Current Time characteristic');
        }

        const bytes = this.ble.encodedStringToBytes((await this.read(device, service, characteristic)).value);

        if (bytes === undefined) {
            this.logHelper.logError(this.setCurrentTime.name, 'Failed to get device\'s current time');
        }
        const deviceTime = this.dateTimeFromBytes(bytes)?.toDate();
        const currentTime = FireTimestamp.now().toDate();
        if (deviceTime !== undefined) {
            if (Math.abs(currentTime.getTime() - deviceTime.getTime()) > 60 * 1000 || bytes[10] !== currentTime.getTimezoneOffset() / -15) {
                const dateTimeBytes = this.dateTimeToBytes(new Date(), { all: true });
                try {
                    await this.write(device, service, characteristic, dateTimeBytes);
                } catch (e: unknown) {
                    this.logHelper.logError(this.setCurrentTime.name, 'write current time error', { value: e });
                }
                this.logHelper.logDefault(this.setCurrentTime.name, 'Device\'s time has been updated', { value: dateTimeBytes });
            } else {
                this.logHelper.logDefault(this.setCurrentTime.name, 'Device\'s time is in sync');
            }
        } else {
            this.logHelper.logError(this.setCurrentTime.name, 'Failed to get device\'s current time');
        }
    }
}
