import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {RouteReuseStrategy} from '@angular/router';
import {IonicModule, IonicRouteStrategy} from '@ionic/angular';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {BluetoothLE} from '@ionic-native/bluetooth-le/ngx';
import {BleConnectionService} from './services/ble/connection/ble-connection.service';
import {AndroidPermissions} from '@ionic-native/android-permissions/ngx';
import {PermissionService} from './services/permission/permission.service';
import {MessageService} from './services/message/message.service';
import {BleDataService} from "./services/ble/data/ble-data.service";
import {AngularFireModule} from "@angular/fire/compat";
import {AngularFireAuthModule, USE_DEVICE_LANGUAGE} from "@angular/fire/compat/auth";
import {AngularFirestoreModule} from "@angular/fire/compat/firestore";
import {TranslateLoader, TranslateModule, TranslatePipe} from '@ngx-translate/core';
import {environment} from "../environments/environment";
import {HttpClient, HttpClientModule} from "@angular/common/http";
import {ToolbarModule} from "./shared/components/toolbar/toolbar.module";
import {TranslateService} from "./services/translate/translate.service";
import {StorageService} from "./services/storage/storage.service";
import {IonicStorageModule} from "@ionic/storage-angular";
import {createTranslateLoader} from "./services/translate/translate.function";
import {AuthService} from "./services/firebase/auth/auth.service";
import {UserService} from "./services/firebase/firestore/user/user.service";

@NgModule({
    declarations: [AppComponent],
    entryComponents: [],
    imports: [
        BrowserModule,
        IonicModule.forRoot(),
        AppRoutingModule,
        AngularFireModule.initializeApp(environment.firebaseConfig),
        AngularFirestoreModule,
        AngularFireAuthModule,
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
        // TODO: move providers to components
        BluetoothLE,
        BleConnectionService,
        AndroidPermissions,
        PermissionService,
        MessageService,
        BleDataService,
        TranslateService,
        StorageService,
        AuthService,
        UserService,
        TranslatePipe,
        {provide: RouteReuseStrategy, useClass: IonicRouteStrategy},
        {provide: USE_DEVICE_LANGUAGE, useValue: true}
    ],
    bootstrap: [AppComponent],
})

export class AppModule {
}
