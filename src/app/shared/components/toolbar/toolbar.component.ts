import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { LanguageService } from '../../../services/language/language.service';
import { IonSelect } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { FirebaseAuthService } from '../../../services/firebase/auth/firebase-auth.service';
import { Router } from '@angular/router';
import { BatteryInfo } from '../../models/classes/BatteryInfo';
import { LogHelper } from '../../models/classes/LogHelper';
import { ConnectionInfo } from '../../models/classes/ConnectionInfo';
import { User as AuthUser } from '@angular/fire/auth';

@Component({
    selector: 'app-toolbar',
    templateUrl: './toolbar.component.html',
    styleUrls: ['./toolbar.component.scss'],
})
export class ToolbarComponent implements OnDestroy, OnChanges, OnInit {
    private readonly logHelper: LogHelper;
    private isLanguageServiceInitializedSubscription: Subscription | undefined;
    private isAuthServiceInitializedSubscription: Subscription | undefined;
    private currentLanguageSubscription: Subscription | undefined;
    private authUserSubscription: Subscription | undefined;
    public currentLanguage: string | undefined;
    public authUser: AuthUser | undefined;
    public languages: string[] | undefined;
    public connectionStatusColor: string | undefined;
    public batteryChipColor: string | undefined;
    public batteryChipIconName: string | undefined;
    public connectionStatus: string | undefined;

    @ViewChild('languageSelect') public languageSelect!: IonSelect;
    @Input() public type: string | undefined;
    @Input() public showBackButton: boolean | undefined;
    @Input() public connectionInfo: ConnectionInfo | undefined;
    @Input() public batteryInfo: BatteryInfo | undefined;
    @Output() public switchTemplate: EventEmitter<boolean>;

    // TODO: add reconnect/connect/disconnect option to status chip

    public constructor(
        private languageService: LanguageService,
        private authService: FirebaseAuthService,
        private router: Router
    ) {
        this.logHelper = new LogHelper(ToolbarComponent.name);
        this.switchTemplate = new EventEmitter<boolean>();
    }

    public ngOnInit(): void {
        this.languages = this.languageService.getLanguages();
        this.currentLanguageSubscription = this.languageService.currentLanguageSubject.subscribe((lang: string) => {
            this.currentLanguage = lang;
        });
        this.authUserSubscription = this.authService.authUserSubject.subscribe( (user: AuthUser | undefined) => {
            this.authUser = user;
        });
    }

    public ngOnChanges(changes: SimpleChanges): void {
        this.logHelper.logDefault(this.ngOnChanges.name, 'changed property', { value: changes });

        if (changes.connectionInfo) {
            this.setConnectionStatusColorChip();
        }

        if (changes.batteryInfo) {
            this.setBatteryChip();
        }
    }

    private setBatteryChip(): void {
        if (this.batteryInfo) {
            if (this.batteryInfo.isCharging) {
                this.batteryChipColor = 'warning';
                this.batteryChipIconName = 'battery-charging';
            } else {
                if (this.batteryInfo.batteryLevel > 55) {
                    this.batteryChipColor = 'success';
                    this.batteryChipIconName = 'battery-full';
                } else if (this.batteryInfo.batteryLevel <= 55 && this.batteryInfo.batteryLevel > 10) {
                    this.batteryChipColor = 'success';
                    this.batteryChipIconName = 'battery-half';
                } else {
                    this.batteryChipColor = 'danger';
                    this.batteryChipIconName = 'battery-dead';
                }
            }
        }
    }

    public ngOnDestroy(): void {
        this.isAuthServiceInitializedSubscription?.unsubscribe();
        this.isLanguageServiceInitializedSubscription?.unsubscribe();
        this.currentLanguageSubscription?.unsubscribe();
        this.authUserSubscription?.unsubscribe();
    }

    public async openLanguageSelect(event: UIEvent): Promise<void> {
        try {
            await this.languageSelect.open(event);
            this.languageSelect.value = this.languageService.getCurrentLanguage();
            const langSelectSubscription = this.languageSelect.ionChange.subscribe(async () => {
                try {
                    const lang = this.languageSelect.value as string;
                    this.logHelper.logDefault(this.openLanguageSelect.name, 'Selected language', { value: lang });
                    await this.languageService.changeLanguage(lang);
                    langSelectSubscription?.unsubscribe();
                } catch (e: unknown) {
                    this.logHelper.logError('langSelectSubscription', 'languageSelect.ionChange error', { value: e });
                }
            });
        } catch (e: unknown) {
            this.logHelper.logError(this.openLanguageSelect.name, 'languageSelect error', { value: e });
        }
    }

    private setConnectionStatusColorChip(): void {
        if (this.connectionInfo) {
            this.connectionStatus = this.connectionInfo.status.toUpperCase();
            if (this.connectionInfo.isConnected()) {
                this.connectionStatusColor = 'success';
            } else if (this.connectionInfo.isConnecting()) {
                this.connectionStatusColor = 'warning';
            } else if (this.connectionInfo.isDisconnected()) {
                this.connectionStatusColor = 'danger';
            } else {
                this.connectionStatusColor = 'warning';
            }
        }
    }

    public goBack(): void {
        this.switchTemplate.emit(false);
    }

    /*
    public openSettings($event: MouseEvent) {
        // TODO: device, account,... settings
    }
     */

    public async signOut(): Promise<void> {
        try {
            await this.authService.signOut();
            await this.router.navigateByUrl('/login', { replaceUrl: true });
            this.logHelper.logDefault(this.signOut.name, 'User logged out');
        } catch (e: unknown) {
            this.logHelper.logError(this.signOut.name, e);
        }
    }
}
