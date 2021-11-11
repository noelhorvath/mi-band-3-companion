import {Injectable} from '@angular/core';
import {TranslateService as TS} from "@ngx-translate/core";
import {StorageService} from "../storage/storage.service";

@Injectable({
  providedIn: 'root'
})

export class TranslateService {

  constructor(
    private translateService: TS,
    private storageService: StorageService
  ) {
    this.initLanguage().then(() => console.log("Translate service has been initialized!"));
  }

  public async changeLanguage(lang: string) {
    this.translateService.use(lang);
    await this.storageService.setLanguage(lang);
  }

  private async initLanguage() {
    let savedLang = await this.storageService.getLanguage();
    console.log("Saved language: " + savedLang);
    savedLang = savedLang ? savedLang : 'en';
    this.translateService.use(savedLang);
    await this.storageService.setLanguage(savedLang);
  }

  public getLanguages(): string[] {
    return this.translateService.getLangs();
  }

  public getCurrentLanguage() {
    return this.translateService.currentLang;
  }

}
