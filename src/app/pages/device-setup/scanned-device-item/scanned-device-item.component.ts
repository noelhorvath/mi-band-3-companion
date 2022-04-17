import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ScanResult } from '../../../shared/models/classes/ScanResult';

@Component({
    selector: 'app-scanned-device-item',
    templateUrl: './scanned-device-item.component.html',
    styleUrls: ['./scanned-device-item.component.scss'],
})
export class ScannedDeviceItemComponent {
    @Input() public scanResult: ScanResult | undefined;
    @Output() public connectToDevice: EventEmitter<ScanResult> = new EventEmitter<ScanResult>();

    public constructor() {}
}
