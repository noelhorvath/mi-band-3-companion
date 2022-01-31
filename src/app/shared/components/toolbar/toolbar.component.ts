import {Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild} from '@angular/core';
import {TranslateService} from "../../../services/translate/translate.service";
import {IonSelect} from "@ionic/angular";
import {Observable, Subscription} from "rxjs";
import {AuthService} from "../../../services/firebase/auth/auth.service";
import {Router} from "@angular/router";
import {BatteryInfo} from "../../models/classes/BatteryInfo";

@Component({
    selector: 'app-toolbar',
    templateUrl: './toolbar.component.html',
    styleUrls: ['./toolbar.component.scss'],
})
export class ToolbarComponent implements OnDestroy, OnChanges {
    private isTranslateServiceInitializedSubscription: Subscription;
    private isAuthServiceInitializedSubscription: Subscription;
    public connectedDevice: string;
    public currentLanguage: string;
    public currentUser: Observable<any>;
    public languages: string[];
    public bleStatusColor: string;
    public batteryChipColor: string;
    public batteryChipIconName: string;

    @ViewChild('languageSelect') languageSelect: IonSelect;
    @Input() type: string;
    @Input() showBackButton: boolean;
    @Input() connectionStatus: string;
    @Input() batteryInfo: BatteryInfo;
    @Output() switchTemplate: EventEmitter<any>;

    // TODO: add reconnect/connect/disconnect option to status chip
    private currentLanguageSubscription: Subscription;

    constructor(
        private translateService: TranslateService,
        private authService: AuthService,
        private router: Router
    ) {
        this.switchTemplate = new EventEmitter<any>();
        this.initToolbarSubscriptions();
    }

    private initToolbarSubscriptions() {
        this.isTranslateServiceInitializedSubscription = this.translateService.isServiceInitializedSubject.subscribe((ready: boolean) => {
            if (ready) {
                this.languages = this.translateService.getLanguages();
                this.currentLanguageSubscription = this.translateService.currentLanguageSubject.subscribe( lang => {
                    this.currentLanguage = lang;
                });
            }
        });
        this.isAuthServiceInitializedSubscription = this.authService.isServiceInitializedSubject.subscribe((ready: boolean) => {
            if (ready) {
                this.currentUser = this.authService.authUserSubject.pipe();
            }
        });
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.connectionStatus) {
            this.setBleStatusChipColor();
        }

        if (changes.batteryInfo) {
            this.setBatteryChip();
            console.log(this.batteryChipIconName + " " + this.batteryChipColor);
        }
    }

    private setBatteryChip() {
        if (this.batteryInfo) {
            if (this.batteryInfo.isCharging) {
                this.batteryChipColor = 'warning';
                this.batteryChipIconName = 'battery-full';
            } else {
                if (this.batteryInfo.batteryLevel > 55) {
                    this.batteryChipColor = 'success';
                    this.batteryChipIconName = 'battery-full';
                } else if (this.batteryInfo.batteryLevel <= 55 && this.batteryInfo.batteryLevel > 10) {
                    this.batteryChipColor = 'success';
                    this.batteryChipIconName = 'battery-half'
                } else {
                    this.batteryChipColor = 'danger';
                    this.batteryChipIconName = 'battery-dead';
                }
            }
        }
    }

    ngOnDestroy() {
        if (this.isAuthServiceInitializedSubscription) { this.isAuthServiceInitializedSubscription.unsubscribe() }
        if (this.isTranslateServiceInitializedSubscription) { this.isTranslateServiceInitializedSubscription.unsubscribe() }
        if (this.currentLanguageSubscription) { this.currentLanguageSubscription.unsubscribe() }
    }

    public openLanguageSelect(event: any) {
        this.languageSelect.open(event).then(() => {
            this.languageSelect.value = this.translateService.getCurrentLanguage();
            const langSelectSubscription = this.languageSelect.ionChange.subscribe(async () => {
                const lang = this.languageSelect.value;
                console.log(ToolbarComponent.name + " -> Selected language: " + lang);
                if (this.translateService.getCurrentLanguage() != lang) {
                    await this.translateService.changeLanguage(lang);
                    if (langSelectSubscription) { langSelectSubscription.unsubscribe() }
                }
            });
        });
    }

    private setBleStatusChipColor() {
        switch (this.connectionStatus) {
            case 'connected':
                this.bleStatusColor = 'success';
                break;
            case 'connecting' || 'reconnecting':
                this.bleStatusColor = 'warning';
                break;
            case 'disconnected':
                this.bleStatusColor = 'danger';
                break;
            default:
                this.bleStatusColor = 'warning';
                break;
        }
    }

    public goBack() {
        this.switchTemplate.emit(false);
    }

    public openSettings($event: MouseEvent) {
        // TODO: device, account,... settings
    }

    public signOut() {
        this.authService.signOut().then(() => console.log("User logged out!"));
        this.router.navigateByUrl('/login', { replaceUrl: true }).then(() => console.log("Logged out user navigated to login"));
    }
}
