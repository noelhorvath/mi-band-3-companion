import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeartRateComponent } from './heart-rate.component';
import { HeartRateRoutingModule } from './heart-rate-routing.module';
import { DataChartModule } from '../components/data-chart/data-chart.module';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ItemsFilterModule } from '../components/items-filter/items-filter.module';
import { HeartRateItemModule } from './item/heart-rate-item.module';

@NgModule({
    declarations: [HeartRateComponent],
    imports: [
        CommonModule,
        HeartRateRoutingModule,
        DataChartModule,
        IonicModule,
        FormsModule,
        TranslateModule,
        ItemsFilterModule,
        HeartRateItemModule
    ]
})
export class HeartRateModule {
}
