import { TestBed } from '@angular/core/testing';

import { FirestoreHeartRateService } from './firestore-heart-rate.service';

describe('FirestoreHeartRateService', () => {
    let service: FirestoreHeartRateService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(FirestoreHeartRateService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
