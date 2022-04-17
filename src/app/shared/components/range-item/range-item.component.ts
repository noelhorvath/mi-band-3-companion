import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
    selector: 'app-range-item',
    templateUrl: './range-item.component.html',
    styleUrls: ['./range-item.component.scss'],
})
export class RangeItemComponent {
    @Input() public labelText: string;
    @Input() public control: FormControl | undefined | null;
    @Input() public unit: string | undefined;
    @Input() public minRangeValue: number;
    @Input() public maxRangeValue: number;
    @Input() public showRangePin: boolean;

    public constructor() {
        this.showRangePin = true;
        this.minRangeValue = 0;
        this.maxRangeValue = 255;
        this.labelText = 'VALUE';
    }

}
