import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home.component';

const routes: Routes = [
    {
        path: '',
        component: HomeComponent,
        children: [
            {
                path: 'activity',
                loadChildren: () => import('../home/tabs/activity/activity.module').then(m => m.ActivityModule),
            },
            {
                path: 'device',
                loadChildren: () => import('../home/tabs/device/device.module').then(m => m.DeviceModule),
            },
            {
                path: 'heart-rate',
                loadChildren: () => import('../home/tabs/heart-rate/heart-rate.module').then(m => m.HeartRateModule),
            },
            {
                path: '',
                redirectTo: '/home/device',
                pathMatch: 'full'
            },
            {
                path: '**',
                redirectTo: '/home/device',
                pathMatch: 'full'
            }
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class HomeRoutingModule {
}
