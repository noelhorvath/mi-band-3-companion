import { Component, Input } from '@angular/core';
import { HeartRate } from '../../../../../shared/models/classes/HeartRate';

@Component({
    selector: 'app-heart-rate-item',
    templateUrl: './heart-rate-item.component.html',
    styleUrls: ['./heart-rate-item.component.scss'],
})
export class HeartRateItemComponent {

    public readonly MAX_INT = Number.MAX_SAFE_INTEGER;
    public readonly MIN_INT = Number.MIN_SAFE_INTEGER;
    @Input() public heartRate: HeartRate | undefined;

    public constructor() {
    }

}
