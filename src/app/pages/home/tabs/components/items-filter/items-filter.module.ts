import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemsFilterComponent } from './items-filter.component';
import { DatePickerModule } from '../../../../../shared/components/date-picker/date-picker.module';
import { TranslateModule } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
    declarations: [ItemsFilterComponent],
    imports: [
        CommonModule,
        DatePickerModule,
        TranslateModule,
        IonicModule,
        ReactiveFormsModule
    ],
    exports: [ItemsFilterComponent]
})
export class ItemsFilterModule {
}
