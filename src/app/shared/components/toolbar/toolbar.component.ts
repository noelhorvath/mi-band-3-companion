import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { BatteryInfo } from '../../models/classes/BatteryInfo';
import { LogHelper } from '../../models/classes/LogHelper';
import { ConnectionInfo } from '../../models/classes/ConnectionInfo';
import { TaskProgressInfo } from '../../models/classes/TaskProgressInfo';
import { BleDataService } from '../../../services/ble/data/ble-data.service';
import { ProgressStatusEnum } from '../../enums/progress-status.enum';
import { BleConnectionService } from '../../../services/ble/connection/ble-connection.service';
import { Device } from '../../models/classes/Device';

@Component({
    selector: 'app-toolbar',
    templateUrl: './toolbar.component.html',
    styleUrls: ['./toolbar.component.scss'],
})
export class ToolbarComponent implements OnDestroy, OnChanges, OnInit {
    private readonly logHelper: LogHelper;
    private syncStatusSubscription: Subscription | undefined;
    public connectionStatusColor: string | undefined;
    public batteryChipColor: string | undefined;
    public batteryChipIconName: string | undefined;
    public connectionStatus: string | undefined;
    public syncStatus: string | undefined;
    public syncStatusColor: string;
    public syncStatusIconName: string | undefined;
    public device: Device | undefined;
    @Input() public type: string | undefined;
    @Input() public showBackButton: boolean | undefined;
    @Input() public connectionInfo: ConnectionInfo | undefined;
    @Input() public batteryInfo: BatteryInfo | undefined;
    @Input() public menuId: string | undefined;
    @Input() public showSignOut: boolean;
    @Input() public isConnectionManagementEnabled: boolean;
    @Output() public logoutEvent: EventEmitter<void>;

    public constructor(
        private bleDataService: BleDataService,
        private changeDetectorRef: ChangeDetectorRef,
        private bleConnectionService: BleConnectionService
    ) {
        this.logHelper = new LogHelper(ToolbarComponent.name);
        this.syncStatusIconName = undefined;
        this.syncStatusColor = 'success';
        this.logoutEvent = new EventEmitter<void>();
        this.showSignOut = false;
        this.isConnectionManagementEnabled = true;
        this.bleConnectionService.deviceSettingsSubject.subscribe( (device: Device) => {
           this.device = device;
        });
    }

    private setConnectionStatusColorChip(): void {
        if (this.connectionInfo !== undefined) {
            this.connectionStatus = this.connectionInfo.status.toUpperCase();
            if (this.connectionInfo.isReady()) {
                this.connectionStatusColor = 'success';
            } else if (this.connectionInfo.isConnectingOrAuthenticating()) {
                this.connectionStatusColor = 'warning';
            } else if (this.connectionInfo.isDisconnected()) {
                this.connectionStatusColor = 'danger';
            } else {
                this.connectionStatusColor = 'warning';
            }
        }
    }

    private setSyncStatusChip(): void {
        if (this.syncStatus !== undefined) {
            switch (this.syncStatus) {
                case 'finished':
                    this.syncStatusColor = 'success';
                    this.syncStatusIconName = 'checkmark-outline';
                    break;
                case 'started' || 'processing':
                    this.syncStatusColor = 'warning';
                    this.syncStatusIconName = undefined;
                    break;
                case 'failed':
                    this.syncStatusColor = 'danger';
                    this.syncStatusIconName = 'alert-outline';
                    break;
                default:
                    this.syncStatusColor = 'warning';
                    this.syncStatusIconName = undefined;
            }
        }
    }

    private setBatteryChip(): void {
        if (this.batteryInfo !== undefined) {
            if (this.batteryInfo.isCharging) {
                this.batteryChipColor = 'warning';
                this.batteryChipIconName = 'battery-charging';
            } else {
                if (this.batteryInfo.batteryLevel > 55) {
                    this.batteryChipColor = 'success';
                    this.batteryChipIconName = 'battery-full';
                } else if (this.batteryInfo.batteryLevel <= 55 && this.batteryInfo.batteryLevel > 15) {
                    this.batteryChipColor = 'success';
                    this.batteryChipIconName = 'battery-half';
                } else {
                    this.batteryChipColor = 'danger';
                    this.batteryChipIconName = 'battery-dead';
                }
            }
        }
    }

    public ngOnInit(): void {
        this.syncStatusSubscription = this.bleDataService.activitySyncStatusSubject.subscribe( (progressInfo: TaskProgressInfo) => {
            if (this.syncStatus !== progressInfo.status) {
                this.syncStatus = progressInfo.status;
                this.setSyncStatusChip();
                this.changeDetectorRef.detectChanges();
            }
        });
    }

    public ngOnChanges(changes: SimpleChanges): void {
        this.logHelper.logDefault(this.ngOnChanges.name, 'changed property', { value: changes });

        if (changes['connectionInfo'] !== undefined) {
            this.setConnectionStatusColorChip();
        }

        if (changes['batteryInfo'] !== undefined) {
            this.setBatteryChip();
        }
    }

    public async syncDeviceData(): Promise<void> {
        try {
            if (this.syncStatus !== ProgressStatusEnum.PROCESSING || ProgressStatusEnum.STARTED) {
                return await this.bleDataService.fetchActivityData();
            } else {
                this.logHelper.logDefault(this.syncDeviceData.name, 'already syncing');
            }
        } catch (e: unknown) {
            this.logHelper.logError(this.syncDeviceData.name, this.bleDataService.fetchActivityData.name, { value: e });
        }
    }

    public ngOnDestroy(): void {
        this.syncStatusSubscription?.unsubscribe();
    }

    public async manageConnection(): Promise<void> {
        try {
            if (this.connectionInfo?.isReady() && this.device !== undefined) {
                await this.bleConnectionService.disconnectAndClose(this.device);
            } else if (!this.connectionInfo?.isConnected() && this.device !== undefined) {
                await this.bleConnectionService.connect(this.device);
            }
        } catch (e: unknown) {
            this.logHelper.logError(this.manageConnection.name, e);
        }
    }
}
