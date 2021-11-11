import {Injectable} from '@angular/core';
import {AndroidPermissions} from '@ionic-native/android-permissions/ngx';
import {Device} from '@capacitor/device';

@Injectable({
  providedIn: 'root'
})

export class PermissionService {
  private osVersion: number;
  private platform: string;

  constructor(
    private androidPermissions: AndroidPermissions,
  ) {
    Device.getInfo().then(deviceInfo => {
      this.platform = deviceInfo.platform;
      if (deviceInfo.osVersion) {
        this.osVersion = PermissionService.convertOSVersionToNumber(deviceInfo.osVersion);
      } else {
        this.osVersion = -1;
      }
      console.log(PermissionService.name + " -> OS version: " + this.osVersion);
    });
  }

  private static convertOSVersionToNumber(version: string): number {
    if (version != null) {
      if (!isNaN(Number(version))) {
        return Number(version);
      } else {
        if (version.includes(".")) {
          let versionSplit = version.split(".");
          let result = "";
          for (let i = 0; i < versionSplit.length; i++) {
            if (!isNaN(Number(version[i]))) {
              result += version[i] + ".";
            } else {
              if (result.endsWith(".")) {
                result.substring(0, result.length - 2);
              }
              return result.length === 0 ? -1 : Number(result);
            }
          }
        } else {
          let result = "";
          for (let i = 0; i < version.length; i++) {
            if (!isNaN(Number(version[i]))) {
              result += version[i];
            } else {
              return result.length === 0 ? -1 : Number(result);
            }
          }
        }
      }
    } else {
      return -1;
    }
  }

  private async checkPermission(permission: string): Promise<{ hasPermission: boolean }> {
    if (this.platform === "android") {
      try {
        let hasPermission = await this.androidPermissions.hasPermission(permission);
        if (!hasPermission.hasPermission) {
          let response = await this.androidPermissions.requestPermission(permission);
          return Promise.resolve(response);
        } else {
          return Promise.resolve(hasPermission);
        }
      } catch (e) {
        return Promise.reject(e);
      }
    } else {
      return Promise.reject("Unsupported platform");
    }
  }

  public async checkCoarseLocation(versionCheck = true) {
    if (versionCheck) {
      if (11 <= this.osVersion) {
        console.log(PermissionService.name + " -> Version check failed!");
        return;
      }
    }
    return await this.checkPermission("android.permission.ACCESS_FINE_LOCATION");
  }

  public async checkFineLocation(versionCheck = true) {
    if (versionCheck) {
      if (12 <= this.osVersion) {
        console.log(PermissionService.name + " -> Version check failed!");
        return;
      }
    }
    return await this.checkPermission("android.permission.ACCESS_FINE_LOCATION");
  }

  public async checkBluetoothScan(versionCheck = true) {
    if (versionCheck) {
      if (this.osVersion < 12) {
        return;
      }
    }
    return await this.checkPermission("android.permission.BLUETOOTH_SCAN");
  }

  public async checkBluetoothConnect(versionCheck = true) {
    if (versionCheck) {
      if (this.osVersion < 12) {
        return;
      }
    }
    return await this.checkPermission("android.permission.BLUETOOTH_CONNECT");
  }


}
