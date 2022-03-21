import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeTabBarComponent } from './home-tab-bar.component';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
    declarations: [HomeTabBarComponent],
    exports: [
        HomeTabBarComponent
    ],
    imports: [
        CommonModule,
        IonicModule,
        TranslateModule
    ]
})
export class HomeTabBarModule {
}
