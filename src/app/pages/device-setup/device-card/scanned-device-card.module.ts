import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ScannedDeviceCardComponent} from "./scanned-device-card.component";
import {IonicModule} from "@ionic/angular";
import {TranslateModule} from "@ngx-translate/core";

@NgModule({
    declarations: [ScannedDeviceCardComponent],
    exports: [
        ScannedDeviceCardComponent
    ],
    imports: [
        CommonModule,
        IonicModule,
        TranslateModule
    ]
})
export class ScannedDeviceCardModule { }
