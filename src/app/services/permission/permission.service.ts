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
                this.osVersion = PermissionService.convertAndroidOSVersionToNumber(deviceInfo.osVersion);
            } else {
                this.osVersion = -1;
            }
            console.log(PermissionService.name + " -> OS version: " + this.osVersion);
        }).catch(error => console.error(AndroidPermissions.name + " -> getInfo error: " + error.message || error));
    }

    private static convertAndroidOSVersionToNumber(version: string): number {
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

    private async checkSpecificPermission(permission: string): Promise<{ hasPermission: boolean }> {
        if (this.platform === "android") {
            try {
                let hasPermission = await this.androidPermissions.checkPermission(permission);
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

    public checkCoarseLocation(versionCheck = true) {
        if (versionCheck) {
            if (11 <= this.osVersion) {
                console.log(PermissionService.name + " -> Version check failed!");
                return;
            }
        }
        return this.checkSpecificPermission("android.permission.ACCESS_FINE_LOCATION");
    }

    public checkFineLocation(versionCheck = true) {
        if (versionCheck) {
            if (12 <= this.osVersion) {
                console.log(PermissionService.name + " -> Version check failed!");
                return;
            }
        }
        return this.checkSpecificPermission("android.permission.ACCESS_FINE_LOCATION");
    }

    public async checkBluetoothScan(versionCheck = true) {
        if (versionCheck) {
            if (this.osVersion < 12) {
                return;
            }
        }
        return this.checkSpecificPermission("android.permission.BLUETOOTH_SCAN");
    }

    public checkBluetoothConnect(versionCheck = true) {
        if (versionCheck) {
            if (this.osVersion < 12) {
                return;
            }
        }
        return this.checkSpecificPermission("android.permission.BLUETOOTH_CONNECT");
    }

    public async checkForBluetoothScanPermissions() {
        let errorText = null;
        try {
            const hasFLPerm = await this.checkFineLocation(true);
            const hasCLPerm = await this.checkCoarseLocation(true);
            const hasBLSPerm = await this.checkBluetoothScan(true);
            const hasBLCPerm = await this.checkBluetoothConnect(true);
            console.log(PermissionService.name + " -> " + JSON.stringify(hasFLPerm) + " " + JSON.stringify(hasCLPerm) + " " + JSON.stringify(hasBLSPerm) + " " + JSON.stringify(hasBLCPerm));
            if (hasBLSPerm != null && hasBLCPerm != null && !hasBLSPerm.hasPermission && !hasBLCPerm.hasPermission) {
                errorText = 'Missing BLUETOOTH_SCAN and BLUETOOTH_CONNECT permissions!';
            } else if (hasBLSPerm != null && !hasBLSPerm.hasPermission) {
                errorText = 'Missing BLUETOOTH_SCAN permission!';
            } else if (hasBLCPerm != null && !hasBLCPerm.hasPermission) {
                errorText = 'Missing BLUETOOTH_CONNECT permission!';
            } else {
                if (hasFLPerm != null && hasCLPerm != null && !hasFLPerm.hasPermission && !hasCLPerm.hasPermission) {
                    errorText = 'Missing ACCESS_FINE_LOCATION and ACCESS_COARSE_LOCATION permissions!';
                } else if (hasFLPerm != null && !hasFLPerm.hasPermission) {
                    errorText = 'Missing ACCESS_FINE_LOCATION permission!';
                } else if (hasCLPerm != null && !hasCLPerm.hasPermission) {
                    errorText = 'Missing ACCESS_COARSE_LOCATION permission!';
                }
            }
        } catch (e) {
            console.error(PermissionService.name + "checkForBluetoothScanPermissions error: " +  e.message || e);
            return Promise.reject(e);
        }
        return errorText ? Promise.reject(errorText) : Promise.resolve();
    }

}
