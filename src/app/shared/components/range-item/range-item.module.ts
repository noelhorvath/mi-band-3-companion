import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RangeItemComponent } from './range-item.component';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
    declarations: [RangeItemComponent],
    imports: [
        CommonModule,
        IonicModule,
        TranslateModule,
        ReactiveFormsModule
    ], exports: [RangeItemComponent]
})
export class RangeItemModule {
}
