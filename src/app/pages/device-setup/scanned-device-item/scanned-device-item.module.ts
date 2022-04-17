import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScannedDeviceItemComponent } from './scanned-device-item.component';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    declarations: [ScannedDeviceItemComponent],
    exports: [
        ScannedDeviceItemComponent
    ],
    imports: [
        CommonModule,
        IonicModule,
        TranslateModule
    ]
})
export class ScannedDeviceItemModule {
}
