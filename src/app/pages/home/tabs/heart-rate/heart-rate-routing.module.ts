import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HeartRateComponent } from './heart-rate.component';

const routes: Routes = [
    {
        path: '',
        component: HeartRateComponent,
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class HeartRateRoutingModule {
}
