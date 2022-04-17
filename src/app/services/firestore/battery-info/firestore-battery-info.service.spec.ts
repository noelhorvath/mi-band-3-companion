import { TestBed } from '@angular/core/testing';

import { FirestoreBatteryInfoService } from './firestore-battery-info.service';

describe('FirestoreBatteryInfoService', () => {
    let service: FirestoreBatteryInfoService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(FirestoreBatteryInfoService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
