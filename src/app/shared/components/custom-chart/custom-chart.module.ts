import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomChartComponent } from './custom-chart.component';
import { NgChartsModule } from 'ng2-charts';

@NgModule({
    declarations: [CustomChartComponent],
    imports: [
        CommonModule,
        NgChartsModule
    ],
    exports: [CustomChartComponent]
})
export class CustomChartModule {
}
