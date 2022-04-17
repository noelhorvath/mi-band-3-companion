import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegisterComponent } from './register.component';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RegisterRoutingModule } from './register-routing.module';
import { TranslateModule } from '@ngx-translate/core';
import { ToolbarModule } from '../../shared/components/toolbar/toolbar.module';
import { PasswordInputModule } from '../../shared/components/password-input/password-input.module';
import { DatePickerModule } from '../../shared/components/date-picker/date-picker.module';
import { RangeItemModule } from '../../shared/components/range-item/range-item.module';


@NgModule({
    declarations: [RegisterComponent],
    imports: [
        CommonModule,
        IonicModule,
        ReactiveFormsModule,
        RegisterRoutingModule,
        TranslateModule,
        ToolbarModule,
        PasswordInputModule,
        FormsModule,
        DatePickerModule,
        RangeItemModule
    ]
})
export class RegisterModule {
}
