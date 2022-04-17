import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login.component';
import { IonicModule } from '@ionic/angular';
import { LoginRoutingModule } from './login-routing.module';
import { ToolbarModule } from '../../shared/components/toolbar/toolbar.module';
import { TranslateModule } from '@ngx-translate/core';
import { PasswordInputModule } from '../../shared/components/password-input/password-input.module';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
    declarations: [LoginComponent],
    imports: [
        CommonModule,
        IonicModule,
        LoginRoutingModule,
        ToolbarModule,
        TranslateModule,
        PasswordInputModule,
        ReactiveFormsModule
    ]
})
export class LoginModule {
}
