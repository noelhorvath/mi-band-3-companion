import { TestBed } from '@angular/core/testing';

import { FirestoreAuthSecurityService } from './firestore-auth-security.service';

describe('FirestoreAuthSecurityService', () => {
    let service: FirestoreAuthSecurityService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(FirestoreAuthSecurityService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
