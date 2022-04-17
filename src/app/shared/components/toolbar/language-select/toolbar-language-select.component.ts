import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { LanguageService } from '../../../../services/language/language.service';
import { LogHelper } from '../../../models/classes/LogHelper';
import { Subscription } from 'rxjs';
import { IonSelect } from '@ionic/angular';

@Component({
    selector: 'app-toolbar-language-select',
    templateUrl: './toolbar-language-select.component.html',
    styleUrls: ['./toolbar-language-select.component.scss'],
})
export class ToolbarLanguageSelectComponent implements OnInit, OnDestroy {
    private readonly logHelper: LogHelper;
    private currentLanguageSubscription: Subscription | undefined;
    public currentLanguage: string | undefined;
    public languages: string[] | undefined;
    @ViewChild('languageSelect') public languageSelect!: IonSelect;

    public constructor(
        private languageService: LanguageService,
    ) {
        this.logHelper = new LogHelper(ToolbarLanguageSelectComponent.name);
    }

    public ngOnInit(): void {
        this.languages = this.languageService.getLanguages();
        this.currentLanguageSubscription = this.languageService.currentLanguageSubject.subscribe((lang: string) => {
            this.currentLanguage = lang;
        });
    }

    public async openLanguageSelect(event: UIEvent): Promise<void> {
        try {
            await this.languageSelect.open(event);
            this.languageSelect.value = this.languageService.getCurrentLanguage();
            const langSelectSubscription = this.languageSelect.ionChange.subscribe(async () => {
                try {
                    const lang = this.languageSelect.value as string;
                    this.logHelper.logDefault(this.openLanguageSelect.name, 'Selected language', { value: lang });
                    await this.languageService.changeLanguage(lang);
                    langSelectSubscription?.unsubscribe();
                } catch (e: unknown) {
                    this.logHelper.logError('langSelectSubscription', 'languageSelect.ionChange error', { value: e });
                }
            });
        } catch (e: unknown) {
            this.logHelper.logError(this.openLanguageSelect.name, 'languageSelect error', { value: e });
        }
    }

    public ngOnDestroy(): void {
        this.currentLanguageSubscription?.unsubscribe();
    }
}
