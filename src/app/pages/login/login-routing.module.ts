import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LoginComponent} from "./login.component";

const routes: Routes = [
    {
        path: '',
        component: LoginComponent,
        children: [
            {
                path: 'reset-password',
                loadChildren: () => import('./reset-password/reset-password.module').then(m => m.ResetPasswordModule)
            }
        ]
    },
    {}
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class LoginRoutingModule {
}
