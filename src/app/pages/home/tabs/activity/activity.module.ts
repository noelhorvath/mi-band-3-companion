import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivityComponent } from './activity.component';
import { ActivityRoutingModule } from './activity-routing.module';
import { DataChartModule } from '../components/data-chart/data-chart.module';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ActivityItemModule } from './item/activity-item.module';
import { ItemsFilterModule } from '../components/items-filter/items-filter.module';

@NgModule({
    declarations: [ActivityComponent],
    imports: [
        CommonModule,
        ActivityRoutingModule,
        DataChartModule,
        IonicModule,
        FormsModule,
        TranslateModule,
        ActivityItemModule,
        ItemsFilterModule
    ]
})
export class ActivityModule {
}
