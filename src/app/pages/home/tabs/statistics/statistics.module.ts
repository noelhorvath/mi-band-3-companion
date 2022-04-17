import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatisticsComponent } from './statistics.component';
import { StatisticsRoutingModule } from './statistics-routing.module';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
    declarations: [StatisticsComponent],
    imports: [
        CommonModule,
        StatisticsRoutingModule,
        IonicModule,
        TranslateModule
    ]
})
export class StatisticsModule {
}
