import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PasswordInputComponent } from './password-input.component';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
    declarations: [PasswordInputComponent],
    imports: [
        CommonModule,
        IonicModule,
        TranslateModule,
        ReactiveFormsModule
    ],
    exports: [PasswordInputComponent]
})
export class PasswordInputModule {
}
