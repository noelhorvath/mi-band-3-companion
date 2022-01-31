import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HeartRateComponent} from "./heart-rate.component";
import {HeartRateRoutingModule} from "./heart-rate-routing.module";

@NgModule({
    declarations: [HeartRateComponent],
    imports: [
        CommonModule,
        HeartRateRoutingModule
    ]
})
export class HeartRateModule {
}
