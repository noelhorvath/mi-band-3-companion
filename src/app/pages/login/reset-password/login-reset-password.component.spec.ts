import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { LoginResetPasswordComponent } from './login-reset-password.component';

describe('RequestEmailLinkComponent', () => {
    let component: LoginResetPasswordComponent;
    let fixture: ComponentFixture<LoginResetPasswordComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [LoginResetPasswordComponent],
            imports: [IonicModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(LoginResetPasswordComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
