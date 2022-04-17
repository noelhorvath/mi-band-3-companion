import { TestBed } from '@angular/core/testing';

import { PickerService } from './picker.service';

describe('PickerService', () => {
    let service: PickerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(PickerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
