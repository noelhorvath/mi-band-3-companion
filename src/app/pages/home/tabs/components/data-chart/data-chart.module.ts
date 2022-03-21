import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataChartComponent } from './data-chart.component';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CustomChartModule } from '../../../../../shared/components/custom-chart/custom-chart.module';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
    declarations: [DataChartComponent],
    imports: [
        CommonModule,
        IonicModule,
        FormsModule,
        CustomChartModule,
        TranslateModule
    ],
    exports: [DataChartComponent]
})
export class DataChartModule {
}
