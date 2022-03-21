import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { LogHelper } from './app/shared/models/classes/LogHelper';

if (environment.production) {
    enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
    .catch( (err: unknown) =>
        LogHelper.log({ mainId: 'main', secondaryId: 'platformBrowserDynamic', message: 'main error', options: { value: err } }, 'error'));
