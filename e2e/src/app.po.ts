import { browser, by, element, promise } from 'protractor';

export class AppPage {
    public navigateTo(): promise.Promise<unknown> {
        return browser.get('/');
    }

    public getPageTitle(): promise.Promise<string> {
        return element(by.css('ion-title')).getText();
    }
}
