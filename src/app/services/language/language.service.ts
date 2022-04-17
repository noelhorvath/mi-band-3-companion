import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { StorageService } from '../storage/storage.service';
import { BehaviorSubject } from 'rxjs';
import { LogHelper } from '../../shared/models/classes/LogHelper';

@Injectable({
    providedIn: 'root'
})
export class LanguageService {
    private readonly logHelper: LogHelper;
    public currentLanguageSubject: BehaviorSubject<string>;
    public isServiceInitializedSubject: BehaviorSubject<boolean>;

    public constructor(
        private translateService: TranslateService,
        private storageService: StorageService
    ) {
        this.logHelper = new LogHelper(LanguageService.name);
        this.translateService.addLangs(['en', 'hu']);
        this.translateService.setDefaultLang('en');
        this.currentLanguageSubject = new BehaviorSubject<string>(this.translateService.currentLang);
        this.isServiceInitializedSubject = new BehaviorSubject<boolean>(false);
        this.initLanguage().then(() => this.logHelper.logDefault(this.initLanguage.name, 'Translate service has been initialized!'));
    }

    private async initLanguage(): Promise<void> {
        const savedLang = await this.storageService.getLanguage() ?? 'en';
        this.logHelper.logDefault(this.initLanguage.name, 'Saved language', { value: savedLang });
        this.currentLanguageSubject.next(savedLang);
        this.translateService.use(savedLang);
        await this.storageService.setLanguage(savedLang);
        this.isServiceInitializedSubject.next(true);
    }

    public async changeLanguage(lang: string): Promise<void> {
        if (this.translateService.currentLang !== lang) {
            this.translateService.use(lang);
            this.currentLanguageSubject.next(lang);
            await this.storageService.setLanguage(lang);
        }
    }

    public getLanguages(): string[] {
        return this.translateService.getLangs();
    }

    public getCurrentLanguage(): string {
        return this.translateService.currentLang;
    }

}
