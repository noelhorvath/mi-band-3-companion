import { TestBed } from '@angular/core/testing';

import { FirebaseServerInfoService } from './firebase-server-info.service';

describe('FirebaseServerInfoService', () => {
    let service: FirebaseServerInfoService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(FirebaseServerInfoService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
