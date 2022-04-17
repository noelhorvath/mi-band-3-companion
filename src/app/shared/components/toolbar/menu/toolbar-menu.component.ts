import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { User as AuthUser } from '@firebase/auth';
import { IonSelect } from '@ionic/angular';
import { User } from '../../../models/classes/User';
import { ConnectionInfo } from '../../../models/classes/ConnectionInfo';

@Component({
    selector: 'app-toolbar-menu',
    templateUrl: './toolbar-menu.component.html',
    styleUrls: ['./toolbar-menu.component.scss'],
})
export class ToolbarMenuComponent {
    @Input() public authUser: AuthUser | undefined;
    @Input() public user: User | undefined;
    @Input() public contentId: string | undefined;
    @Input() public menuId: string | undefined;
    @Input() public connectionInfo: ConnectionInfo | undefined;
    @Output() public logoutEvent: EventEmitter<void>;
    @ViewChild('languageSelect') public languageSelect!: IonSelect;

    public constructor() {
        this.logoutEvent = new EventEmitter<void>();
    }

}
