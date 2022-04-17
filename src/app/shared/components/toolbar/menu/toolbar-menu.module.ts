import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { ToolbarMenuComponent } from './toolbar-menu.component';
import { ToolbarLanguageSelectModule } from '../language-select/toolbar-language-select.module';
import { ToolbarMenuUserSettingsModalModule } from './user-settings-modal/toolbar-menu-user-settings-modal.module';
import {
    ToolbarMenuDeviceSettingsModalModule
} from './device-settings-modal/toolbar-menu-device-settings-modal.module';

@NgModule({
    declarations: [ToolbarMenuComponent],
    imports: [
        CommonModule,
        IonicModule,
        TranslateModule,
        FormsModule,
        ToolbarLanguageSelectModule,
        ToolbarMenuUserSettingsModalModule,
        ToolbarMenuDeviceSettingsModalModule
    ],
    exports: [ToolbarMenuComponent]
})
export class ToolbarMenuModule {
}
