import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ScanResult } from '../../../shared/models/classes/ScanResult';

@Component({
    selector: 'app-scanned-device-card',
    templateUrl: './scanned-device-card.component.html',
    styleUrls: ['./scanned-device-card.component.scss'],
})
export class ScannedDeviceCardComponent {
    @Input() public scanResult: ScanResult | undefined;
    @Output() public connectToDevice: EventEmitter<ScanResult> = new EventEmitter<ScanResult>();

    public constructor() {
    }
}
