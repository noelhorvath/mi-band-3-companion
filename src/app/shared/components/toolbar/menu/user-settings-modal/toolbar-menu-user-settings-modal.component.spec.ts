import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ToolbarMenuUserSettingsModalComponent } from './toolbar-menu-user-settings-modal.component';

describe('ToolbarMenuUserSettingsModalComponent', () => {
    let component: ToolbarMenuUserSettingsModalComponent;
    let fixture: ComponentFixture<ToolbarMenuUserSettingsModalComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ToolbarMenuUserSettingsModalComponent],
            imports: [IonicModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(ToolbarMenuUserSettingsModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
