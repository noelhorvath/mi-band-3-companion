import { TestBed } from '@angular/core/testing';

import { BleConnectionService } from './ble-connection.service';

describe('BLEService', () => {
    let service: BleConnectionService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(BleConnectionService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
