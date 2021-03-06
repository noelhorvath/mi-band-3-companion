import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeviceSetupComponent } from './device-setup.component';
import { IonicModule } from '@ionic/angular';
import { DeviceSetupRoutingModule } from './device-setup-routing.module';
import { ToolbarModule } from '../../shared/components/toolbar/toolbar.module';
import { TranslateModule } from '@ngx-translate/core';
import { ScannedDeviceItemModule } from './scanned-device-item/scanned-device-item.module';

@NgModule({
    declarations: [DeviceSetupComponent],
    imports: [
        CommonModule,
        IonicModule,
        DeviceSetupRoutingModule,
        ToolbarModule,
        TranslateModule,
        ScannedDeviceItemModule
    ]
})
export class DeviceSetupModule {
}
