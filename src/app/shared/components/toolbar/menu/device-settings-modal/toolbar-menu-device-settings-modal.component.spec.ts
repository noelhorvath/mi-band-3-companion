import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ToolbarMenuDeviceSettingsModalComponent } from './toolbar-menu-device-settings-modal.component';

describe('ToolbarMenuDeviceSettingsModalComponent', () => {
    let component: ToolbarMenuDeviceSettingsModalComponent;
    let fixture: ComponentFixture<ToolbarMenuDeviceSettingsModalComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ToolbarMenuDeviceSettingsModalComponent],
            imports: [IonicModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(ToolbarMenuDeviceSettingsModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
