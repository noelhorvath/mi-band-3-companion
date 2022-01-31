import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivityComponent} from "./activity.component";
import {ActivityRoutingModule} from "./activity-routing.module";


@NgModule({
    declarations: [ActivityComponent],
    imports: [
        CommonModule,
        ActivityRoutingModule
    ]
})
export class ActivityModule {
}
