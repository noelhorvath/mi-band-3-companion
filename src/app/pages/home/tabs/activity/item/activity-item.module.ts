import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivityItemComponent } from './activity-item.component';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    declarations: [ActivityItemComponent],
    imports: [
        CommonModule,
        IonicModule,
        TranslateModule
    ],
    exports: [ActivityItemComponent]
})
export class ActivityItemModule {
}
