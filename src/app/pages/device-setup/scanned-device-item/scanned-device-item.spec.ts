import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ScannedDeviceItemComponent } from './scanned-device-item.component';

describe('ScannedDeviceItemComponent', () => {
    let component: ScannedDeviceItemComponent;
    let fixture: ComponentFixture<ScannedDeviceItemComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ScannedDeviceItemComponent],
            imports: [IonicModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(ScannedDeviceItemComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
