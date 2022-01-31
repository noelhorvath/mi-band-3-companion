import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ResetPasswordComponent} from "./reset-password.component";
import {ReactiveFormsModule} from "@angular/forms";
import {IonicModule} from "@ionic/angular";
import {TranslateModule} from "@ngx-translate/core";
import {ToolbarModule} from "../../../shared/components/toolbar/toolbar.module";

@NgModule({
    declarations: [ResetPasswordComponent],
    exports: [
        ResetPasswordComponent
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        IonicModule,
        TranslateModule,
        ToolbarModule,
    ]
})
export class ResetPasswordModule {
}
