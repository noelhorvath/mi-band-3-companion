import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ScannedDeviceCardComponent } from './scanned-device-card.component';

describe('DeviceCardComponent', () => {
    let component: ScannedDeviceCardComponent;
    let fixture: ComponentFixture<ScannedDeviceCardComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ScannedDeviceCardComponent],
            imports: [IonicModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(ScannedDeviceCardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
