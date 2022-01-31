import {Injectable} from '@angular/core';
import {TranslateService as TS} from "@ngx-translate/core";
import {StorageService} from "../storage/storage.service";
import {BehaviorSubject} from "rxjs";

@Injectable({
    providedIn: 'root'
})

export class TranslateService {
    public currentLanguageSubject: BehaviorSubject<string>;
    public isServiceInitializedSubject: BehaviorSubject<boolean>;

    constructor(
        private translateService: TS,
        private storageService: StorageService
    ) {
        this.translateService.addLangs(['en', 'hu']);
        this.currentLanguageSubject = new BehaviorSubject<string>(undefined);
        this.isServiceInitializedSubject = new BehaviorSubject<boolean>(false);
        this.initLanguage().then(() => console.log("Translate service has been initialized!"));
    }

    public async changeLanguage(lang: string) {
        this.translateService.use(lang);
        this.currentLanguageSubject.next(lang);
        console.log(this.translateService);
        await this.storageService.setLanguage(lang);
    }

    private async initLanguage() {
        let savedLang = await this.storageService.getLanguage();
        console.log("Saved language: " + savedLang);
        savedLang = savedLang ? savedLang : 'en';
        this.currentLanguageSubject.next(savedLang);
        this.translateService.use(savedLang);
        await this.storageService.setLanguage(savedLang);
        this.isServiceInitializedSubject.next(true);
    }

    public getLanguages(): string[] {
        return this.translateService.getLangs();
    }

    public getCurrentLanguage() {
        return this.translateService.currentLang;
    }

    public getTranslation(key: string) {
        return this.translateService.get(key);
    }

}
