import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatePickerComponent } from './date-picker.component';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
    declarations: [DatePickerComponent],
    imports: [
        CommonModule,
        IonicModule,
        TranslateModule,
        ReactiveFormsModule
    ],
    exports: [DatePickerComponent]
})
export class DatePickerModule { }
