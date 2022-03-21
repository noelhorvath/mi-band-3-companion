import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolbarComponent } from './toolbar.component';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';


@NgModule({
    declarations: [ToolbarComponent],
    exports: [
        ToolbarComponent
    ],
    imports: [
        CommonModule,
        IonicModule,
        TranslateModule,
        FormsModule
    ]
})
export class ToolbarModule {
}
