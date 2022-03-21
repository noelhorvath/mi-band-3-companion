import { Component } from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss'],
})
export class AppComponent {
    public readonly title: string;

    public constructor() {
        this.title = 'Mi Band 3 Companion';
        //TODO: add splash screen
    }
}

