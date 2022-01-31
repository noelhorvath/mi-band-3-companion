import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TrainingComponent} from "./training.component";
import {TrainingRoutingModule} from "./training-routing.module";


@NgModule({
    declarations: [TrainingComponent],
    imports: [
        CommonModule,
        TrainingRoutingModule
    ]
})
export class TrainingModule {
}
