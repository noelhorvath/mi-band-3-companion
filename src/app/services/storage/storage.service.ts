import {Injectable} from '@angular/core';
import {Storage} from '@ionic/storage-angular'
import {BehaviorSubject} from 'rxjs'

@Injectable({
    providedIn: 'root'
})
export class StorageService {

    public isStorageServiceInitializedSubject: BehaviorSubject<boolean>;

    constructor(private storage: Storage) {
        this.isStorageServiceInitializedSubject = new BehaviorSubject<boolean>(false);
        this.initStorage().then(() => {
            this.isStorageServiceInitializedSubject.next(true);
            console.log(StorageService.name + ' -> Storage has been initialized!');
        }).catch(error => {
            console.error(StorageService.name + ' -> Storage initialization failed: ' + error.message || error);
        });
    }

    private async initStorage() {
        return await this.storage.create();
    }

    public async setLanguage(lang: string) {
        return await this.storage.set('lang', lang);
    }

    public async getLanguage() {
        return await this.storage.get('lang');
    }

}
