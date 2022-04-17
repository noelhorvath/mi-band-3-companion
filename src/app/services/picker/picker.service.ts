import { Injectable } from '@angular/core';
import { PickerButton, PickerColumn, PickerColumnOption, PickerController } from '@ionic/angular';
import { LogHelper } from '../../shared/models/classes/LogHelper';
import { IPickerTranslation } from '../../shared/models/interfaces/IPickerTranslation';
import { LanguageService } from '../language/language.service';
import { IPickerColumnTranslation } from '../../shared/models/interfaces/IPickerColumnTranslation';
import { TranslatePipe } from '@ngx-translate/core';

@Injectable({
    providedIn: 'root'
})
export class PickerService {
    private readonly logHelper: LogHelper;
    private picker: HTMLIonPickerElement | undefined;
    private pickerText: IPickerTranslation | undefined;

    public constructor(
        private languageService: LanguageService,
        private translatePipe: TranslatePipe,
        private pickerController: PickerController) {
        this.logHelper = new LogHelper(PickerService.name);
        this.languageService.isServiceInitializedSubject.subscribe((isReady: boolean) => {
            if (isReady.valueOf()) {
                this.languageService.currentLanguageSubject.subscribe(() => {
                    this.updateCurrentPickerText();
                });
            }
        });
    }

    public async createPicker(
        columns: PickerColumn[],
        buttons: PickerButton[],
        showBackdrop: boolean = true,
        backdropDismiss: boolean = true,
        animated: boolean = true,
        keyboardClose: boolean = true): Promise<void> {
        try {
            this.picker = await this.pickerController.create({
                columns: columns.map((column: PickerColumn) => {
                    column.options = column.options.map((option: PickerColumnOption) => {
                        option.text = this.translatePipe.transform(option.text ?? '');
                        return option;
                    });
                    return column;
                }),
                buttons: buttons.map((button: PickerButton) => {
                    button.text = this.translatePipe.transform(button.text ?? '');
                    return button;
                }),
                showBackdrop,
                backdropDismiss,
                animated,
                keyboardClose
            });
            this.picker.onWillDismiss().then( () => {
                this.dismissPicker();
                this.logHelper.logDefault('onWillDismiss', 'picker will be dismissed');
            }).catch( (e: unknown) => this.logHelper.logDefault('onWillDismiss', e));
            await this.picker.present();
            const buttonKeys = buttons.map((button: PickerButton) => button.text ?? '');
            const columnTranslations = columns.map((column: PickerColumn) => {
                const translation: IPickerColumnTranslation = { optionKeys: [] };
                translation.optionKeys = column.options.map((option: PickerColumnOption) => option.text ?? '');
                return translation;
            });
            this.pickerText = { buttonKeys, columnTranslations };
        } catch (e: unknown) {
            this.logHelper.logError(this.createPicker.name, 'create picker error', { value: e });
        }
    }

    public async dismissPicker(): Promise<void> {
        if (this.picker !== undefined) {
            try {
                this.picker = undefined;
                this.pickerText = undefined;
                return Promise.resolve();
            } catch (e: unknown) {
                this.logHelper.logError(this.dismissPicker.name, e);
            }
        }
    }

    public updateCurrentPickerText(): void {
        if (this.picker !== undefined && this.pickerText !== undefined) {
            this.picker.buttons = this.picker.buttons.map((button: PickerButton, index: number) => {
                if (this.pickerText !== undefined) {
                    button.text = this.translatePipe.transform(this.pickerText.buttonKeys[index]);
                }
                return button;
            });
            this.picker.columns = this.picker.columns.map((column: PickerColumn, i: number) => {
                if (this.pickerText !== undefined) {
                    column.options = column.options.map((option: PickerColumnOption, j: number) => {
                        if (this.pickerText !== undefined) {
                            option.text = this.translatePipe.transform(this.pickerText?.columnTranslations[i].optionKeys[j]);
                        }
                        return option;
                    });
                }
                return column;
            });
        }
    }

    public getColumn(name: string): Promise<PickerColumn | undefined> {
        if (this.picker !== undefined) {
            return this.picker.getColumn(name);
        }
        return Promise.resolve(undefined);
    }

    public addIonColumnChangeListener(listener: EventListenerOrEventListenerObject): void {
        if (this.picker !== undefined) {
            this.picker.addEventListener('ionPickerColChange', listener);
        }
    }
}
