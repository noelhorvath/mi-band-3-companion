import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { User } from '../../../../models/classes/User';
import { FirestoreActivityService } from '../../../../../services/firestore/activity/firestore-activity.service';
import { FirestoreHeartRateService } from '../../../../../services/firestore/heart-rate/firestore-heart-rate.service';
import { MessageService } from '../../../../../services/message/message.service';
import { LogInfo } from '../../../../models/classes/LogInfo';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { Activity } from '../../../../models/classes/Activity';
import { HeartRate } from '../../../../models/classes/HeartRate';
import { QueryOperator } from '../../../../enums/firestore.enum';
import { Router } from '@angular/router';
import { LogHelper } from '../../../../models/classes/LogHelper';
import { BleConnectionService } from '../../../../../services/ble/connection/ble-connection.service';
import { ConnectionInfo } from '../../../../models/classes/ConnectionInfo';
import { Device } from '../../../../models/classes/Device';

@Component({
    selector: 'app-toolbar-menu-device-settings-modal',
    templateUrl: './toolbar-menu-device-settings-modal.component.html',
    styleUrls: ['./toolbar-menu-device-settings-modal.component.scss'],
})
export class ToolbarMenuDeviceSettingsModalComponent implements OnChanges {
    private readonly logHelper: LogHelper;
    public readonly DATA_TYPES: string[];
    public exportDataType: string;
    public exportDevice: string | undefined;
    public currentDevice: string | undefined;
    @Input() public triggerId: any;
    @Input() public user: User | undefined;
    @Input() public connectionInfo: ConnectionInfo | undefined;
    @ViewChild('modal') public deviceSettingsModal!: HTMLIonModalElement;

    public constructor(
        private activityService: FirestoreActivityService,
        private heartRateService: FirestoreHeartRateService,
        private messageService: MessageService,
        private router: Router,
        private bleConnectionService: BleConnectionService
    ) {
        this.logHelper = new LogHelper(ToolbarMenuDeviceSettingsModalComponent.name);
        this.DATA_TYPES = ['activity', 'pulse'];
        this.exportDataType = this.DATA_TYPES[0];
        this.triggerId = 'device-settings-modal';
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes['connectionInfo'] && this.connectionInfo?.device?.macAddress !== undefined) {
            this.currentDevice = this.connectionInfo.device.macAddress;
        }
    }

    public async exportActivityData(): Promise<void> {
        try {
            await this.messageService.createLoading('EXPORTING_ACTIVITY_DATA_WITH_DOTS');
            const status = await Filesystem.requestPermissions();
            if (status.publicStorage !== 'denied') {
                let data = '[\n';
                const activities = await this.activityService.list([
                    { fieldPath: 'measurementInfo.deviceRef', opStr: QueryOperator.EQUAL, value: this.exportDevice},
                ]);
                activities?.map((activity: Activity, i: number) => {
                    data += '' +
                        '   {\n' +
                        '       "steps":' + '"' + activity.steps + '",\n' +
                        '       "distance":' + '"' + (activity.distance !== -1 ? activity.distance : 0) + '",\n' +
                        '       "calories":' + '"' + (activity.calories !== -1 ? activity.calories : 0) + '",\n' +
                        '       "intensity": {\n' +
                        '           "avg":' + '"' + (activity.intensity.avg !== -1 ? activity.intensity.avg : 0) + '",\n' +
                        '           "max":' + '"' + (activity.intensity.max !== Number.MIN_SAFE_INTEGER ? activity.intensity.max : 0) + '",\n' +
                        '           "min":' + '"' + (activity.intensity.min !== Number.MAX_SAFE_INTEGER ? activity.intensity.min : 0) + '"\n' +
                        '       },\n' +
                        '       "measurementInfo": {\n' +
                        '           "date":' + '"' + activity.measurementInfo.date.toDate().toISOString() + '",\n' +
                        '           "type":' + '"' + activity.measurementInfo.type + '",\n' +
                        '           "deviceRef":' + '"' + activity.measurementInfo.deviceRef + '"\n' +
                        '       }\n' +
                        '   }' + (i !== activities?.length - 1 && activities?.length !== 0 ? ',\n' : '\n');
                });
                data += ']';
                const date = new Date();
                const path = 'MiBand3Companion/Activity';
                try {
                    await Filesystem.mkdir({
                        path: 'MiBand3Companion/Activity',
                        directory: Directory.Documents,
                        recursive: true
                    });
                } catch (e: unknown) {
                    this.logHelper.logError(this.exportActivityData.name, 'mkdir', { value: e });
                }
                await Filesystem.writeFile({
                    path: `${path}/export_${date.getFullYear()}_${date.getMonth()}_${date.getDate()}_${date.getHours()}_${date.getMinutes()}_${date.getMilliseconds()}.json`,
                    data,
                    directory: Directory.Documents,
                    encoding: Encoding.ASCII
                });
                await this.messageService.createToast('EXPORT_ACTIVITY_DATA', 'ACTIVITY_DATA_EXPORTED_TO_DOCUMENTS', 'top', 'success', 5000);
            } else {
                await this.messageService.createToast('EXPORT_ACTIVITY_DATA', 'MISSING_FILE_ACCESS_PERMISSIONS', 'top', 'danger');
            }
        } catch (e: unknown) {
            await this.messageService.displayErrorMessage(
                new LogInfo(
                    ToolbarMenuDeviceSettingsModalComponent.name,
                    this.exportActivityData.name,
                    'EXPORT_ACTIVITY_DATA_ERROR',
                    { value: e }
                ),
                'toast',
                true,
                5000
            );
        } finally {
            await this.messageService.dismissLoading();
        }
    }

    public async exportHeartRateData(): Promise<void> {
        try {
            await this.messageService.createLoading('EXPORTING_PULSE_DATA_WITH_DOTS');
            const status = await Filesystem.requestPermissions();
            if (status.publicStorage !== 'denied') {
                let data = '[\n';
                const heartRates = await this.heartRateService.list({ fieldPath: 'measurementInfo.date', directionStr: 'asc'});
                heartRates?.map((heartRate: HeartRate, i: number) => {
                    data += '' +
                        '   {\n' +
                        '       "bpm": {\n' +
                        '           "avg":' + '"' + (heartRate.bpm.avg !== -1 ? heartRate.bpm.avg : 0) + '",\n' +
                        '           "max":' + '"' + (heartRate.bpm.max !== Number.MIN_SAFE_INTEGER ? heartRate.bpm.max : 0) + '",\n' +
                        '           "min":' + '"' + (heartRate.bpm.min !== Number.MAX_SAFE_INTEGER ? heartRate.bpm.min : 0) + '"\n' +
                        '       },\n' +
                        '       "measurementInfo": {\n' +
                        '           "date":' + '"' + heartRate.measurementInfo.date.toDate().toISOString() + '",\n' +
                        '           "type":' + '"' + heartRate.measurementInfo.type + '",\n' +
                        '           "deviceRef":' + '"' + heartRate.measurementInfo.deviceRef + '"\n' +
                        '       }\n' +
                        '   }' + (i !== heartRates?.length - 1 && heartRates?.length !== 0 ? ',\n' : '\n');
                });
                data += ']';
                const date = new Date();
                const path = 'MiBand3Companion/Pulse';
                try {
                    await Filesystem.mkdir({
                        path: 'MiBand3Companion/Pulse',
                        directory: Directory.Documents,
                        recursive: true
                    });
                } catch (e: unknown) {
                    this.logHelper.logError(this.exportActivityData.name, 'mkdir', { value: e });
                }
                await Filesystem.writeFile({
                    path: `${path}/export_${date.getFullYear()}_${date.getMonth()}_${date.getDate()}_${date.getHours()}_${date.getMinutes()}_${date.getMilliseconds()}.json`,
                    data,
                    directory: Directory.Documents,
                    encoding: Encoding.ASCII
                });
                await this.messageService.createToast('EXPORT_PULSE_DATA', 'PULSE_DATA_EXPORTED_TO_DOCUMENTS', 'top', 'success', 5000);
            } else {
                await this.messageService.createToast('EXPORT_PULSE_DATA', 'MISSING_FILE_ACCESS_PERMISSIONS', 'top', 'danger');
            }
        } catch (e: unknown) {
            await this.messageService.displayErrorMessage(
                new LogInfo(
                    ToolbarMenuDeviceSettingsModalComponent.name,
                    this.exportActivityData.name,
                    'EXPORT_PULSE_DATA_ERROR',
                    { value: e }
                ),
                'toast',
                true,
                5000
            );
        } finally {
            await this.messageService.dismissLoading();
        }
    }

    public async exportData(): Promise<void> {
        if (this.exportDataType === 'activity') {
            return this.exportActivityData();
        } else {
            return this.exportHeartRateData();
        }
    }

    public async goToSetup(): Promise<void> {
        try {
            if (this.connectionInfo?.device !== undefined && this.connectionInfo.isConnected()) {
                await this.bleConnectionService.disconnectAndClose(this.connectionInfo.device);
            }
            await this.router.navigateByUrl('device-setup', { replaceUrl: true });
            await this.deviceSettingsModal.dismiss();
        } catch (e: unknown) {
            this.logHelper.logError(this.goToSetup.name, e);
        }
    }

    public async changeDevice(value: string): Promise<void> {
        if (value !== undefined && this.user !== undefined && this.user.devices !== undefined && this.user.devices.length > 0) {
            if (this.connectionInfo?.device !== undefined && this.connectionInfo.isConnected() && this.connectionInfo.device.macAddress !== value) {
                try {
                    await this.bleConnectionService.disconnectAndClose(this.connectionInfo.device);
                } catch (e: unknown) {
                    this.logHelper.logError(this.changeDevice.name, e);
                }
            }
            this.bleConnectionService.deviceSettingsSubject.next(this.user.devices.find( d => d.macAddress === value) ?? new Device());
        }
    }
}
