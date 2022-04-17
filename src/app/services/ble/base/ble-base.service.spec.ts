import { TestBed } from '@angular/core/testing';
import { BleBaseService } from './ble-base.service';

describe('BleBaseService', () => {
    let service: BleBaseService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(BleBaseService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
