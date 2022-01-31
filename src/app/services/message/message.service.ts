import {Injectable} from '@angular/core';
import {AlertButton, AlertController, LoadingController, ToastController} from '@ionic/angular';
import {Color} from "@ionic/core";
import {TranslateService} from "../translate/translate.service";
import {TranslatePipe} from "@ngx-translate/core";
import {IAlertTranslation} from "../../shared/models/interfaces/IAlertTranslation";
import {IToastTranslation} from "../../shared/models/interfaces/IToastTranslation";
import {ILoadingTranslation} from "../../shared/models/interfaces/ILoadingTranslation";

@Injectable({
    providedIn: 'root'
})
export class MessageService {
    public alert: HTMLIonAlertElement;
    public toast: HTMLIonToastElement;
    public loading: HTMLIonLoadingElement;
    private alertText: IAlertTranslation;
    private toastText: IToastTranslation;
    private loadingText: ILoadingTranslation;

    constructor(
        private alertController: AlertController,
        private toastController: ToastController,
        private loadingController: LoadingController,
        private translatePipe: TranslatePipe,
        private translateService: TranslateService,
    ) {
        this.translateService.isServiceInitializedSubject.subscribe( ready => {
            if (ready) {
                this.translateService.currentLanguageSubject.subscribe( lang => {
                    if (lang) {
                        // might not work
                        // TODO: refresh html content?
                        this.updateCurrentAlertText();
                        this.updateCurrentToastText();
                        this.updateCurrentLoadingText();
                    }
                })
            }
        })
    }

    //TODO: fix toast blocking UI interaction

    public async errorHandler(logTitle: string, logMsg: string, error: any, messageType: string, closeAll: boolean, duration?: number, position?: string) {
        let errorMsg = error.message || error.status || error.data || error;
        if (closeAll) {
            await this.dismissAlert();
            await this.dismissToast();
            await this.dismissLoading();
        }
        if (messageType === 'toast') {
            await this.createToast("ERROR", errorMsg, position, "danger", duration);
        } else if (messageType === 'alert') {
            await this.createAlert("ERROR", errorMsg);
        }
        console.error(logTitle + " -> " + logMsg + ": " + errorMsg);
    }

    public async createAlert(header: string, message: string, backdropDismiss = false, buttons: (string | AlertButton)[] = ['X']) {
        try {
            const element = await this.alertController.create({
                header: this.translatePipe.transform(header),
                message: this.translatePipe.transform(message),
                backdropDismiss,
                buttons: buttons.map((button) => {
                    if ((button as AlertButton).text !== undefined) { // type check
                        (button as AlertButton).text = this.translatePipe.transform((button as AlertButton).text);
                        return button;
                    }
                    return this.translatePipe.transform(button as string);
                })
            });
            if (this.alert) { await this.dismissAlert(); }
            this.alert = element;
            await this.alert.present();
            const buttonsKeys = buttons.map((button) => {
                if ((button as AlertButton).text !== undefined) { // type check
                    return (button as AlertButton).text;
                }
                return this.translatePipe.transform(button as string);
            });
            this.alertText = {headerKey: header, messageKey: message, buttonsKeys};
        } catch (e) {
            return console.error("createAlert error: " + e);
        }
    }

    public async createToast(header: string, message: string, position: string = "top",
                             color: Color = "primary", duration: number = 3000, animated = false): Promise<void> {
        try {
            const element = await this.toastController.create({
                header: this.translatePipe.transform(header),
                message: this.translatePipe.transform(message),
                duration,
                position: position as "top" | "bottom" | "middle",
                animated,
                color
                //translucent,
                //keyboardClose,
                //icon,
                //id
            });
            if (this.toast) { await this.dismissToast(); }
            this.toast = element;
            await this.toast.present();
            this.toastText = { headerKey: header, messageKey: message };
        } catch (e) {
            return console.error("createToast error: " + e);
        }
    }

    public async createLoading(message: string, spinner: string = "circular", backdropDismiss: boolean = false, duration: number = 0, keyboardClose: boolean = true, translucent: boolean = false) {
        try {
            const element = await this.loadingController.create({
                message: this.translatePipe.transform(message),
                spinner: spinner as "bubbles" | "circles" | "circular" | "crescent" | "dots" | "lines" | "lines-sharp" | "lines-sharp-small" | "lines-small",
                duration,
                backdropDismiss,
                keyboardClose,
                translucent
            });
            if (this.loading) { await this.dismissLoading(); }
            this.loading = element;
            await this.loading.present();
            this.loadingText = { messageKey: message };
        } catch (e) {
            return console.error("createLoading error: " + e);
        }
    }

    private updateCurrentLoadingText(): void {
        if (this.loading) {
            this.loading.message = this.translatePipe.transform(this.loadingText.messageKey);
        }
    }

    public changeLoadingMessage(msgKey: string): void {
        if (!this.loading) { return }
        this.loadingText.messageKey = msgKey;
        this.updateCurrentLoadingText();
    }

    private updateCurrentAlertText(): void {
        if (this.alert) {
            this.alert.header = this.translatePipe.transform(this.alertText.headerKey);
            this.alert.message = this.translatePipe.transform(this.alertText.messageKey);
            if (this.alert.buttons) {
                if (this.alert.buttons.length > 0) {
                    for (let i = 0; i < this.alert.buttons.length; i++) {
                        if ((this.alert.buttons[i] as AlertButton).text !== undefined) { // type check
                            (this.alert.buttons[i] as AlertButton).text = this.translatePipe.transform(this.alertText.buttonsKeys[i]);
                        } else {
                            this.alert.buttons[i] = this.translatePipe.transform(this.alertText.buttonsKeys[i]);
                        }
                    }
                }
            }
        }
    }

    private updateCurrentToastText(): void {
        if (this.toast) {
            //this.toast.buttons TODO: translate toast buttons
            this.toast.header = this.translatePipe.transform(this.toastText.headerKey);
            this.toast.message = this.translatePipe.transform(this.toastText.messageKey);
        }
    }

    public async dismissAlert(): Promise<boolean | void> {
        if (this.alert) {
            try {
                const res = await this.alert.dismiss();
                this.alert = null;
                this.alertText = null;
                return res;
            } catch (e) {
                return console.error(MessageService.name + ' -> loading dismiss error: ' + e);
            }
        }
    }

    public async dismissToast(): Promise<boolean | void> {
        if (this.toast) {
            try {
                const res = await this.toast.dismiss();
                this.toast = null;
                this.toastText = null;
                return res;
            } catch (e) {
                return console.error(MessageService.name + ' -> loading dismiss error: ' + e);
            }
        }
    }

    public async dismissLoading(): Promise<boolean | void> {
        if (this.loading) {
            try {
                const res = await this.loading.dismiss();
                this.loading = null;
                this.loadingText = null;
                return res;
            } catch (e) {
                return console.error(MessageService.name + ' -> loading dismiss error: ' + e);
            }
        }
    }

}
