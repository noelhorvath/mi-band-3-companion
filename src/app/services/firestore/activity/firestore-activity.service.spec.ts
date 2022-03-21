import { TestBed } from '@angular/core/testing';

import { FirestoreActivityService } from './firestore-activity.service';

describe('ActivityService', () => {
    let service: FirestoreActivityService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(FirestoreActivityService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
