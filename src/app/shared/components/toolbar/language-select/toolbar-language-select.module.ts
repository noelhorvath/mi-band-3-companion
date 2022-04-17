import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolbarLanguageSelectComponent } from './toolbar-language-select.component';
import { TranslateModule } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

@NgModule({
    declarations: [ToolbarLanguageSelectComponent],
    imports: [
        CommonModule,
        TranslateModule,
        IonicModule,
        FormsModule
    ],
    exports: [ToolbarLanguageSelectComponent]
})
export class ToolbarLanguageSelectModule {
}
