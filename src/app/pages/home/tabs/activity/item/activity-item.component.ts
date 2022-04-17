import { Component, Input } from '@angular/core';
import { Activity } from '../../../../../shared/models/classes/Activity';

@Component({
    selector: 'app-activity-item',
    templateUrl: './activity-item.component.html',
    styleUrls: ['./activity-item.component.scss'],
})
export class ActivityItemComponent {
    public readonly MAX_INT = Number.MAX_SAFE_INTEGER;
    public readonly MIN_INT = Number.MIN_SAFE_INTEGER;
    @Input() public activity: Activity | undefined;

    public constructor() {
    }

}
