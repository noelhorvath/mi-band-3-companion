import {Injectable} from '@angular/core';
import {Storage} from "@ionic/storage-angular";

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(
    private storage: Storage
  ) {
    this.initStorage().then(() => {
      console.log(StorageService.name + " -> Storage has been initialized!");
    }).catch(error => {
      console.error(StorageService.name + " -> Storage initialization failed: " + error.message || error);
    });
  }

  private async initStorage() {
    await this.storage.create();
  }

  public async setLanguage(lang: string) {
    await this.storage.set("lang", lang);
  }

  public async getLanguage() {
    return await this.storage.get("lang");
  }

}
