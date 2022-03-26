import { Injectable } from '@angular/core';
import { AlertButton, AlertController, LoadingController, ToastButton, ToastController } from '@ionic/angular';
import { Color } from '@ionic/core';
import { LanguageService } from '../language/language.service';
import { TranslatePipe } from '@ngx-translate/core';
import { IAlertTranslation } from '../../shared/models/interfaces/IAlertTranslation';
import { IToastTranslation } from '../../shared/models/interfaces/IToastTranslation';
import { ILoadingTranslation } from '../../shared/models/interfaces/ILoadingTranslation';
import { LogInfo } from '../../shared/models/classes/LogInfo';
import { LogHelper } from '../../shared/models/classes/LogHelper';
import { LoadingSpinner, MessageType, ToastPosition } from '../../shared/types/custom.types';
import { ILogInfo } from '../../shared/models/interfaces/ILogInfo';

@Injectable({
    providedIn: 'root'
})
export class MessageService {
    private readonly logHelper: LogHelper;
    public alertText: IAlertTranslation | undefined;
    public toastText: IToastTranslation | undefined;
    public loadingText: ILoadingTranslation | undefined;
    public alert: HTMLIonAlertElement | undefined;
    public toast: HTMLIonToastElement | undefined;
    public loading: HTMLIonLoadingElement | undefined;

    public constructor(
        private alertController: AlertController,
        private toastController: ToastController,
        private loadingController: LoadingController,
        private translatePipe: TranslatePipe,
        private languageService: LanguageService,
    ) {
        this.logHelper = new LogHelper(MessageService.name);
        this.languageService.isServiceInitializedSubject.subscribe((ready: boolean) => {
            if (ready.valueOf()) {
                this.languageService.currentLanguageSubject.subscribe(() => {
                    // might not work
                    // TODO: refresh html content?
                    this.updateCurrentAlertText();
                    this.updateCurrentToastText();
                    this.updateCurrentLoadingText();
                });
            }
        });
    }

    //TODO: fix toast blocking UI interaction

    public async displayErrorMessage(
        logInfo: ILogInfo,
        messageType: MessageType,
        closeAll: boolean,
        duration?: number,
        position?: ToastPosition
    ): Promise<void> {
        if (closeAll) {
            await this.dismissAlert();
            await this.dismissToast();
            await this.dismissLoading();
        }
        if (messageType === 'toast') {
            await this.createToast(
                'ERROR',
                logInfo instanceof LogInfo ? logInfo.message : LogHelper.getUnknownMsg(logInfo.message),
                position ?? 'bottom', 'danger', duration
            );
        } else if (messageType === 'alert') {
            await this.createAlert('ERROR', logInfo instanceof LogInfo ? logInfo.message : LogHelper.getUnknownMsg(logInfo.message));
        }
        LogHelper.log(logInfo, 'error');
    }

    public async createAlert(
        header: string,
        message: string,
        backdropDismiss: boolean = false,
        buttons: (string | AlertButton)[] = ['CLOSE']
    ): Promise<void> {
        try {
            const element = await this.alertController.create({
                header: this.translatePipe.transform(header),
                message: this.translatePipe.transform(message),
                backdropDismiss,
                buttons: buttons.map((button: string | AlertButton) => {
                    if (typeof button === 'string') {
                        return this.translatePipe.transform(button);
                    } else {
                        button.text = this.translatePipe.transform(button.text);
                    }
                    return button;
                })
            });
            if (this.alert) {
                await this.dismissAlert();
            }
            this.alert = element;
            await this.alert.present();
            const buttonKeys = buttons.map((button: string | AlertButton) => typeof button === 'string' ? button : button.text);
            this.alertText = { headerKey: header, messageKey: message, buttonKeys };
        } catch (e: unknown) {
            this.logHelper.logError(this.createAlert.name, e);
        }
    }

    public async createToast(
        header: string,
        message: string,
        position: ToastPosition = 'top',
        color: Color = 'primary',
        duration: number = 3000,
        buttons: (string | ToastButton)[] = ['x'],
        animated: boolean = true,
    ): Promise<void> {
        try {
            const element = await this.toastController.create({
                header: this.translatePipe.transform(header),
                message: this.translatePipe.transform(message),
                duration,
                position,
                animated,
                color,
                buttons: buttons.map((button: string | ToastButton) => {
                    if (typeof button === 'string') {
                        return this.translatePipe.transform(button);
                    } else {
                        button.text = this.translatePipe.transform(button.text ?? 'x');
                    }
                    return button;
                })
                //translucent,
                //keyboardClose,
                //icon,
                //id
            });
            if (this.toast) {
                await this.dismissToast();
            }
            this.toast = element;
            await this.toast.present();
            const buttonKeys = buttons.map((button: string | ToastButton) => typeof button === 'string' ? button : button.text ?? 'x');
            this.toastText = { headerKey: header, messageKey: message, buttonKeys };
        } catch (e: unknown) {
            this.logHelper.logError(this.createToast.name, e);
        }
    }

    public async createLoading(
        message: string,
        spinner: LoadingSpinner = 'circular',
        backdropDismiss: boolean = false,
        duration: number = 0,
        keyboardClose: boolean = true,
        translucent: boolean = false
    ): Promise<void> {
        try {
            const element = await this.loadingController.create({
                message: this.translatePipe.transform(message),
                spinner,
                duration,
                backdropDismiss,
                keyboardClose,
                translucent
            });
            if (this.loading) {
                await this.dismissLoading();
            }
            this.loading = element;
            await this.loading.present();
            this.loadingText = { messageKey: message };
        } catch (e: unknown) {
            this.logHelper.logError(this.createLoading.name, e);
        }
    }

    private updateCurrentLoadingText(): void {
        if (this.loading && this.loadingText) {
            this.loading.message = this.translatePipe.transform(this.loadingText.messageKey);
        }
    }

    public changeLoadingMessage(msgKey: string): void {
        if (!this.loading) {
            return;
        }
        this.loadingText = { messageKey: msgKey };
        this.updateCurrentLoadingText();
    }

    private updateCurrentAlertText(): void {
        if (this.alert !== undefined && this.alertText !== undefined) {
            this.alert.header = this.translatePipe.transform(this.alertText.headerKey);
            this.alert.message = this.translatePipe.transform(this.alertText.messageKey);
            this.alert.buttons = this.alert.buttons.map((button: string | AlertButton, index: number) => {
                if (this.alertText !== undefined) {
                    if (typeof button === 'string') {
                        button = this.translatePipe.transform(this.alertText.buttonKeys[index]);
                    } else {
                        button.text = this.translatePipe.transform(this.alertText.buttonKeys[index]);
                    }
                }
                return button;
            });
        }
    }

    private updateCurrentToastText(): void {
        if (this.toast !== undefined && this.toastText !== undefined) {
            this.toast.header = this.translatePipe.transform(this.toastText.headerKey);
            this.toast.message = this.translatePipe.transform(this.toastText.messageKey);
            this.toast.buttons = this.toast.buttons?.map((button: string | ToastButton, index: number) => {
                if (this.alertText !== undefined) {
                    if (typeof button === 'string') {
                        button = this.translatePipe.transform(this.alertText.buttonKeys[index]);
                    } else {
                        button.text = this.translatePipe.transform(this.alertText.buttonKeys[index]);
                    }
                }
                return button;
            }) ?? [];
        }
    }

    public async dismissAlert(): Promise<boolean> {
        if (this.alert !== undefined) {
            try {
                const res = await this.alert.dismiss();
                this.alert = undefined;
                this.alertText = undefined;
                return Promise.resolve(res);
            } catch (e: unknown) {
                this.logHelper.logError(this.dismissAlert.name, e);
            }
        }
        return Promise.resolve(false);
    }

    public async dismissToast(): Promise<boolean> {
        if (this.toast !== undefined) {
            try {
                const res = await this.toast.dismiss();
                this.toast = undefined;
                this.toastText = undefined;
                return Promise.resolve(res);
            } catch (e: unknown) {
                this.logHelper.logError(this.dismissToast.name, e);
            }
        }
        return Promise.resolve(false);
    }

    public async dismissLoading(): Promise<boolean> {
        if (this.loading !== undefined) {
            try {
                const res = await this.loading.dismiss();
                this.loading = undefined;
                this.loadingText = undefined;
                return Promise.resolve(res);
            } catch (e: unknown) {
                this.logHelper.logError(this.dismissLoading.name, e);
            }
        }
        return Promise.resolve(false);
    }

}
