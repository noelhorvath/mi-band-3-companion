import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ToolbarLanguageSelectComponent } from './toolbar-language-select.component';

describe('ToolbarLanguageSelectComponent', () => {
    let component: ToolbarLanguageSelectComponent;
    let fixture: ComponentFixture<ToolbarLanguageSelectComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ToolbarLanguageSelectComponent],
            imports: [IonicModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(ToolbarLanguageSelectComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
