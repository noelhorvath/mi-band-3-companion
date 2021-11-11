import {Injectable} from '@angular/core';
import {BluetoothLE} from "@ionic-native/bluetooth-le/ngx";

@Injectable({
  providedIn: 'root'
})
export class BleDataService {

  constructor(
    private ble: BluetoothLE
  ) {
  }

  private read(address, service, characteristic) {
    return this.ble.read({
      address,
      service,
      characteristic
    });
  }
}
