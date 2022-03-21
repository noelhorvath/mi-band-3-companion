import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DeviceComponent } from './device.component';

describe('DeviceComponent', () => {
    let component: DeviceComponent;
    let fixture: ComponentFixture<DeviceComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [DeviceComponent],
            imports: [IonicModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(DeviceComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
