import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DeviceRoutingModule} from "./device-routing.module";
import {DeviceComponent} from "./device.component";
import {IonicModule} from "@ionic/angular";
import {TranslateModule} from "@ngx-translate/core";


@NgModule({
    declarations: [DeviceComponent],
    imports: [
        CommonModule,
        DeviceRoutingModule,
        IonicModule,
        TranslateModule
    ]
})
export class DeviceModule {
}
