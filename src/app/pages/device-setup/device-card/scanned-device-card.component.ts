import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {IScannedDevice} from "../models/IScannedDevice";

@Component({
  selector: 'app-scanned-device-card',
  templateUrl: './scanned-device-card.component.html',
  styleUrls: ['./scanned-device-card.component.scss'],
})
export class ScannedDeviceCardComponent implements OnInit {

  constructor( ) { }

  @Input() deviceInfo: IScannedDevice;
  @Output() connectToDevice: EventEmitter<string> = new EventEmitter<string>();

  ngOnInit() {}

}
