import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeartRateItemComponent } from './heart-rate-item.component';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
    declarations: [HeartRateItemComponent],
    imports: [
        CommonModule,
        IonicModule,
        TranslateModule
    ],
    exports: [HeartRateItemComponent]
})
export class HeartRateItemModule {
}
