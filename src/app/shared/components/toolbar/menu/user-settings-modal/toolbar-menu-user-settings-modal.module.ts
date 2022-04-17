import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolbarMenuUserSettingsModalComponent } from './toolbar-menu-user-settings-modal.component';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';
import { PasswordInputModule } from '../../../password-input/password-input.module';
import { DatePickerModule } from '../../../date-picker/date-picker.module';
import { RangeItemModule } from '../../../range-item/range-item.module';

@NgModule({
    declarations: [ToolbarMenuUserSettingsModalComponent],
    imports: [
        CommonModule,
        IonicModule,
        TranslateModule,
        ReactiveFormsModule,
        PasswordInputModule,
        DatePickerModule,
        RangeItemModule
    ],
    exports: [ToolbarMenuUserSettingsModalComponent]
})

export class ToolbarMenuUserSettingsModalModule {
}
