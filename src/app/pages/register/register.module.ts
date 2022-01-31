import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RegisterComponent} from "./register.component";
import {IonicModule} from "@ionic/angular";
import {ReactiveFormsModule} from "@angular/forms";
import {RegisterRoutingModule} from "./register-routing.module";
import {TranslateModule} from "@ngx-translate/core";
import {ToolbarModule} from "../../shared/components/toolbar/toolbar.module";


@NgModule({
    declarations: [RegisterComponent],
    imports: [
        CommonModule,
        IonicModule,
        ReactiveFormsModule,
        RegisterRoutingModule,
        TranslateModule,
        ToolbarModule
    ]
})
export class RegisterModule {
}
