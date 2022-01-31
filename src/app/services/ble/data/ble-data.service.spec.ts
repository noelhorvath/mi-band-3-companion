import {TestBed} from '@angular/core/testing';

import {BleDataService} from './ble-data.service';

describe('DataService', () => {
    let service: BleDataService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(BleDataService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
