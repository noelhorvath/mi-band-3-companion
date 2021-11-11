import {Component, OnInit} from '@angular/core';
import {Subscription} from "rxjs";
import {BleConnectionService} from "../../services/ble/connection/ble-connection.service";
import {PermissionService} from "../../services/permission/permission.service";

@Component({
  selector: 'app-setup',
  templateUrl: './device-setup.component.html',
  styleUrls: ['./device-setup.component.scss'],
})
export class DeviceSetupComponent implements OnInit {
  public deviceList: any[];
  public deviceListSubscription: Subscription;
  public isAuthenticated: boolean;
  public isAuthenticatedSubscription: Subscription;
  public isScanningDisabled: boolean;
  public isScanningDisabledSubscription: Subscription;
  public isScanning: boolean;
  public isScanningSubscription: Subscription;
  public counter: number;
  public connectionStatusSubscription: Subscription;
  public connectionStatus: string;
  public connectedDevice: string;
  public connectedDeviceSubscription: Subscription;

  constructor(
    private bleConnectionService: BleConnectionService,
    private permissionService: PermissionService
  ) {
    this.deviceListSubscription = this.bleConnectionService.deviceListSubject.subscribe(list => {
      this.deviceList = list;
      // 10s timeout before next scan
      this.runScanCountDown(list);
    });
    this.isScanningSubscription = this.bleConnectionService.isScanningSubject.subscribe(value => {
      this.isScanning = value;
    });
    this.isScanningDisabledSubscription = this.bleConnectionService.isScanningDisabledSubject.subscribe(value => {
      this.isScanningDisabled = value;
    });
    this.isAuthenticatedSubscription = this.bleConnectionService.isAuthenticatedSubject.subscribe(value => {
      this.isAuthenticated = value;
    });

    // for testing
    this.connectionStatusSubscription = this.bleConnectionService.connectionStatusSubject.subscribe((status: string) => {
      this.connectionStatus = status;
    });
    this.connectedDeviceSubscription = this.bleConnectionService.connectedDeviceSubject.subscribe((address: string) => {
      this.connectedDevice = address;
    });
  }

  async startScanningForDevices() {
    try {
      const hasFLPerm = await this.permissionService.checkFineLocation(true);
      const hasCLPerm = await this.permissionService.checkCoarseLocation(true);
      const hasBLSPerm = await this.permissionService.checkBluetoothScan(true);
      const hasBLCPerm = await this.permissionService.checkBluetoothConnect(true);
      console.log(DeviceSetupComponent.name + " -> " + JSON.stringify(hasFLPerm) + " " + JSON.stringify(hasCLPerm) + " " + JSON.stringify(hasBLSPerm) + " " + JSON.stringify(hasBLCPerm));

      if (hasBLSPerm != null && hasBLCPerm != null && !hasBLSPerm.hasPermission && !hasBLCPerm.hasPermission) {
        console.error("Missing BLUETOOTH_SCAN and BLUETOOTH_CONNECT permissions!");
        return;
      } else if (hasBLSPerm != null && !hasBLSPerm.hasPermission) {
        console.error("Missing BLUETOOTH_SCAN permission!");
        return;
      } else if (hasBLCPerm != null && !hasBLCPerm.hasPermission) {
        console.error("Missing BLUETOOTH_SCAN permission!");
        return;
      } else {
        if (hasFLPerm != null && hasCLPerm != null && !hasFLPerm.hasPermission && !hasCLPerm.hasPermission) {
          console.error("Missing ACCESS_FINE_LOCATION and ACCESS_COARSE_LOCATION permissions!");
          return;
        } else if (hasFLPerm != null && !hasFLPerm.hasPermission) {
          console.error("Missing ACCESS_FINE_LOCATION permission!");
          return;
        } else if (hasCLPerm != null && !hasCLPerm.hasPermission) {
          console.error("Missing ACCESS_COARSE_LOCATION permission!");
          return;
        }
      }
      this.bleConnectionService.scanForDevices(1500); // TODO: test with more time and shit
    } catch (e) {
      console.error(DeviceSetupComponent.name + " -> startScanningForDevices error: " + e.message);
    }
  }

  async connectToSelectedDevice(address: string) {
    await this.bleConnectionService.connect(address, true);
  }

  runScanCountDown(data: any) {
    if (data) {
      let intervalId = setInterval(() => {
        if (this.counter == null) {
          // start countdown
          this.counter = 10;
        } else {
          if (this.counter !== 0) {
            this.counter -= 1;
          } else {
            // end countdown
            this.counter = undefined;
            this.bleConnectionService.isScanningDisabledSubject.next(false);
            clearInterval(intervalId);
          }
        }
      }, 1000);
    }
  }

  disconnectDevice() {
    if (this.connectedDevice != null) {
      this.bleConnectionService.disconnectAndClose(this.connectedDevice);
    } else {
      // TODO: display error if no connected device
      console.error(DeviceSetupComponent.name + ' -> Disconnect error: ' + ' No connected device!');
    }
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.isScanningDisabledSubscription.unsubscribe();
    this.isScanningSubscription.unsubscribe();
    this.deviceListSubscription.unsubscribe();
    this.isAuthenticatedSubscription.unsubscribe();
  }
}
