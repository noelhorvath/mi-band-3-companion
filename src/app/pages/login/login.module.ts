import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LoginComponent} from "./login.component";
import {IonicModule} from "@ionic/angular";
import {ReactiveFormsModule} from "@angular/forms";
import {LoginRoutingModule} from "./login-routing.module";
import {ToolbarModule} from "../../shared/components/toolbar/toolbar.module";
import {TranslateModule} from "@ngx-translate/core";
import {ResetPasswordModule} from "./reset-password/reset-password.module";


@NgModule({
  declarations: [LoginComponent],
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    LoginRoutingModule,
    ToolbarModule,
    TranslateModule,
    ResetPasswordModule
  ]
})
export class LoginModule {
}
