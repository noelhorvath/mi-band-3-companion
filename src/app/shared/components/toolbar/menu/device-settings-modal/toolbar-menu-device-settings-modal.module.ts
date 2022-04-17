import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolbarMenuDeviceSettingsModalComponent } from './toolbar-menu-device-settings-modal.component';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';


@NgModule({
    declarations: [ToolbarMenuDeviceSettingsModalComponent],
    imports: [
        CommonModule,
        IonicModule,
        TranslateModule,
        FormsModule
    ],
    exports: [ToolbarMenuDeviceSettingsModalComponent]
})
export class ToolbarMenuDeviceSettingsModalModule {
}
