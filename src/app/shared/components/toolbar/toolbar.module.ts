import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolbarComponent } from './toolbar.component';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { ToolbarLanguageSelectModule } from './language-select/toolbar-language-select.module';


@NgModule({
    declarations: [ToolbarComponent],
    exports: [
        ToolbarComponent
    ],
    imports: [
        CommonModule,
        IonicModule,
        TranslateModule,
        FormsModule,
        ToolbarLanguageSelectModule
    ]
})
export class ToolbarModule {
}
