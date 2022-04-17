import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BluetoothLE } from '@ionic-native/bluetooth-le/ngx';
import { BleConnectionService } from './services/ble/connection/ble-connection.service';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { PermissionService } from './services/permission/permission.service';
import { MessageService } from './services/message/message.service';
import { BleDataService } from './services/ble/data/ble-data.service';
import { TranslateLoader, TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { environment } from '../environments/environment';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ToolbarModule } from './shared/components/toolbar/toolbar.module';
import { LanguageService } from './services/language/language.service';
import { StorageService } from './services/storage/storage.service';
import { IonicStorageModule } from '@ionic/storage-angular';
import { FirebaseAuthService } from './services/firebase/auth/firebase-auth.service';
import { FirestoreUserService } from './services/firestore/user/firestore-user.service';
import { FirestoreActivityService } from './services/firestore/activity/firestore-activity.service';
import { LogHelper } from './shared/models/classes/LogHelper';
import { createTranslateLoader } from './shared/functions/translate.function';
import { getApp, initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { CACHE_SIZE_UNLIMITED, enableIndexedDbPersistence, initializeFirestore, provideFirestore } from '@angular/fire/firestore';
import { debugErrorMap, indexedDBLocalPersistence, initializeAuth, prodErrorMap, provideAuth } from '@angular/fire/auth';
import { AppSettings } from '../settings/app.settings';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { FirebaseServerInfoService } from './services/firebase/server-info/firebase-server-info.service';
import { BleDeviceSettingsService } from './services/ble/device-settings/ble-device-settings.service';
import { PickerService } from './services/picker/picker.service';

@NgModule({
    declarations: [AppComponent],
    entryComponents: [],
    imports: [
        provideFirebaseApp(() => {
            const app = initializeApp(environment.firebaseConfig, AppSettings.codeName);
            app.automaticDataCollectionEnabled = AppSettings.enableFirebaseDataCollection;
            return app;
        }),
        provideFirestore(() => {
            const firestore = initializeFirestore(getApp(AppSettings.codeName),
                {
                    cacheSizeBytes: CACHE_SIZE_UNLIMITED,
                    ignoreUndefinedProperties: true,
                });
            enableIndexedDbPersistence(firestore, { forceOwnership: true }).catch((e: unknown) =>
                LogHelper.log(
                    {
                        mainId: AppModule.name,
                        secondaryId: enableIndexedDbPersistence.name,
                        message: 'Firestore offline data access init error',
                        options: { value: e }
                    },
                    'error'
                )
            );
            return firestore;
        }),
        provideAuth(() => {
            const auth = initializeAuth(getApp(AppSettings.codeName), {
                persistence: indexedDBLocalPersistence,
                errorMap: environment.production ? prodErrorMap : debugErrorMap
            });
            auth.useDeviceLanguage();
            return auth;
        }),
        provideDatabase(() => getDatabase(getApp(AppSettings.codeName), environment.firebaseConfig.databaseURL)),
        BrowserModule,
        IonicModule.forRoot(),
        AppRoutingModule,
        HttpClientModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: createTranslateLoader,
                deps: [HttpClient],
            }
        }),
        ToolbarModule,
        IonicStorageModule.forRoot()
    ],
    providers: [
        BluetoothLE,
        BleConnectionService,
        AndroidPermissions,
        PermissionService,
        MessageService,
        PickerService,
        BleDataService,
        BleDeviceSettingsService,
        LanguageService,
        StorageService,
        FirebaseAuthService,
        FirebaseServerInfoService,
        FirestoreUserService,
        FirestoreActivityService,
        TranslatePipe,
        { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    ],
    bootstrap: [AppComponent],
})

export class AppModule {
}
