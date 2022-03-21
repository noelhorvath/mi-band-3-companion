import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DeviceSetupComponent } from './device-setup.component';

describe('SetupComponent', () => {
    let component: DeviceSetupComponent;
    let fixture: ComponentFixture<DeviceSetupComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [DeviceSetupComponent],
            imports: [IonicModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(DeviceSetupComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
