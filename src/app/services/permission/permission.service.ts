import { Injectable } from '@angular/core';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { LogHelper } from '../../shared/models/classes/LogHelper';
import { PermissionNames, Permissions } from '../../shared/enums/permissions.enum';
import { DeviceService } from '../device/device.service';

@Injectable({
    providedIn: 'root'
})
export class PermissionService {
    private readonly logHelper: LogHelper;

    public constructor(
        private androidPermissions: AndroidPermissions,
        private deviceService: DeviceService
    ) {
        this.logHelper = new LogHelper(PermissionService.name);
    }

    private async hasPermissionAccess(permission: string): Promise<boolean> {
        try {
            const platform = await this.deviceService.getPlatform();
            if (platform === 'android') {
                const checkResult = await this.androidPermissions.checkPermission(permission);
                if (!checkResult.hasPermission) {
                    const response = await this.androidPermissions.requestPermission(permission);
                    return Promise.resolve(response.hasPermission);
                } else {
                    return Promise.resolve(checkResult.hasPermission);
                }
            } else {
                return Promise.reject('Unsupported platform');
            }
        } catch (e: unknown) {
            return Promise.reject(this.logHelper.getUnknownMsg(e));
        }
    }

    public async checkCoarseLocation(versionCheck = true): Promise<boolean | undefined> {
        const osVersion = await this.deviceService.getOSMainVersion();
        if (versionCheck) {
            if (11 <= osVersion) {
                this.logHelper.logDefault(this.checkCoarseLocation.name, 'Version check failed!');
                return Promise.resolve(undefined);
            }
        }
        return this.hasPermissionAccess(Permissions.ACCESS_COARSE_LOCATION);
    }

    public async checkFineLocation(versionCheck = true): Promise<boolean | undefined> {
        const osVersion = await this.deviceService.getOSMainVersion();
        if (versionCheck) {
            if (12 <= osVersion) {
                this.logHelper.logDefault(this.checkFineLocation.name, 'Version check failed!');
                return Promise.resolve(undefined);
            }
        }
        return this.hasPermissionAccess(Permissions.ACCESS_FINE_LOCATION);
    }

    public async checkBluetoothScan(versionCheck = true): Promise<boolean | undefined> {
        const osVersion = await this.deviceService.getOSMainVersion();
        if (versionCheck) {
            if (osVersion < 12) {
                this.logHelper.logDefault(this.checkBluetoothScan.name, 'Version check failed!');
                return Promise.resolve(undefined);
            }
        }
        return this.hasPermissionAccess(Permissions.BLUETOOTH_SCAN);
    }

    public async checkBluetoothConnect(versionCheck = true): Promise<boolean | undefined> {
        const osVersion = await this.deviceService.getOSMainVersion();
        if (versionCheck) {
            if (osVersion < 12) {
                this.logHelper.logDefault(this.checkBluetoothConnect.name, 'Version check failed!');
                return Promise.resolve(undefined);
            }
        }
        return this.hasPermissionAccess(Permissions.BLUETOOTH_CONNECT);
    }

    public async checkForBluetoothScanPermissions(): Promise<void> {
        let errorText = '';
        try {
            const hasFLPerm = await this.checkFineLocation(true);
            const hasCLPerm = await this.checkCoarseLocation(true);
            const hasBLSPerm = await this.checkBluetoothScan(true);
            const hasBLCPerm = await this.checkBluetoothConnect(true);
            this.logHelper.logDefault(this.checkForBluetoothScanPermissions.name, `has ${ PermissionNames.ACCESS_FINE_LOCATION } permission`, { value: hasFLPerm });
            this.logHelper.logDefault(this.checkForBluetoothScanPermissions.name, `has ${ PermissionNames.ACCESS_COARSE_LOCATION } permission`, { value: hasCLPerm });
            this.logHelper.logDefault(this.checkForBluetoothScanPermissions.name, `has ${ PermissionNames.BLUETOOTH_SCAN } permission`, { value: hasBLSPerm });
            this.logHelper.logDefault(this.checkForBluetoothScanPermissions.name, `has ${ PermissionNames.BLUETOOTH_CONNECT } permission`, { value: hasBLCPerm });
            if (hasBLSPerm !== undefined && hasBLCPerm !== undefined && !hasBLSPerm && !hasBLCPerm) {
                errorText = `Missing ${ PermissionNames.BLUETOOTH_SCAN } and ${ PermissionNames.BLUETOOTH_CONNECT } permissions!`;
            } else if (hasBLSPerm !== undefined && !hasBLSPerm) {
                errorText = `Missing ${ PermissionNames.BLUETOOTH_SCAN } permission!`;
            } else if (hasBLCPerm !== undefined && !hasBLCPerm) {
                errorText = `Missing ${ PermissionNames.BLUETOOTH_CONNECT } permission!`;
            } else {
                if (hasFLPerm !== undefined && hasCLPerm !== undefined && !hasFLPerm && !hasCLPerm) {
                    errorText = `Missing ${ PermissionNames.ACCESS_FINE_LOCATION } and ${ PermissionNames.ACCESS_COARSE_LOCATION } permissions!`;
                } else if (hasFLPerm !== undefined && !hasFLPerm) {
                    errorText = `Missing ${ PermissionNames.ACCESS_FINE_LOCATION } permission!`;
                } else if (hasCLPerm !== undefined && !hasCLPerm) {
                    errorText = `Missing ${ PermissionNames.ACCESS_COARSE_LOCATION } permission!`;
                }
            }
        } catch (e: unknown) {
            return Promise.reject(this.logHelper.getUnknownMsg(e));
        }
        return errorText ? Promise.reject(errorText) : Promise.resolve();
    }
}
