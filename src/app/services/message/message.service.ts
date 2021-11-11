import {Injectable} from '@angular/core';
import {AlertController, LoadingController, ToastController} from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  constructor(
    private alertController: AlertController,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {
  }

  public errorHandler(logTitle: string, logMsg: string, error: any, messageType: string) {
    let errorMsg = error.message || error.status || error.data || error;
    if (messageType === 'toast') {
      // TODO: toast
    } else if (messageType === 'alert') {
      this.createAlert("Error", errorMsg).then(() => console.log("alert created"));
    } else {
      // TODO: idk
    }
    console.error(logTitle + " -> " + logMsg + ": " + errorMsg);
  }

  public async createAlert(header: string, message: string, backdropDismiss = false) {
    const alert = await this.alertController.create({
      header,
      message,
      backdropDismiss,
      buttons: ['OK']
    });

    await alert.present();

    const {role} = await alert.onDidDismiss();
    console.log('onDidDismiss resolved with role', role);
  }

}
