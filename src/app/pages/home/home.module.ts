import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { IonicModule } from '@ionic/angular';
import { ToolbarModule } from '../../shared/components/toolbar/toolbar.module';
import { HomeTabBarModule } from './tab-bar/home-tab-bar.module';
import { HomeRoutingModule } from './home-routing.module';

@NgModule({
    declarations: [HomeComponent],
    imports: [
        CommonModule,
        IonicModule,
        ToolbarModule,
        HomeTabBarModule,
        HomeRoutingModule
    ]
})
export class HomeModule {
}
