import { TestBed } from '@angular/core/testing';

import { BleDeviceSettingsService } from './ble-device-settings.service';

describe('BleDeviceSettingsService', () => {
    let service: BleDeviceSettingsService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(BleDeviceSettingsService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
