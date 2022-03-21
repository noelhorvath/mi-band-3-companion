import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login.component';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginRoutingModule } from './login-routing.module';
import { ToolbarModule } from '../../shared/components/toolbar/toolbar.module';
import { TranslateModule } from '@ngx-translate/core';
import { LoginResetPasswordModule } from './reset-password/login-reset-password.module';
import { PasswordInputModule } from '../../shared/components/password-input/password-input.module';


@NgModule({
    declarations: [LoginComponent],
    imports: [
        CommonModule,
        IonicModule,
        ReactiveFormsModule,
        LoginRoutingModule,
        ToolbarModule,
        TranslateModule,
        LoginResetPasswordModule,
        PasswordInputModule
    ]
})
export class LoginModule {
}
