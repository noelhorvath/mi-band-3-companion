import { Component, ViewChild } from '@angular/core';
import { IonTabs } from '@ionic/angular';

@Component({
    selector: 'app-home-tab-bar',
    templateUrl: './home-tab-bar.component.html',
    styleUrls: ['./home-tab-bar.component.scss'],
})
export class HomeTabBarComponent {
    private readonly deviceIconFilled = 'watch';
    private readonly deviceIconOutline = 'watch-outline';
    private readonly activityIconFilled = 'walk';
    private readonly activityIconOutline = 'walk-outline';
    private readonly heartRateIconFilled = 'fitness';
    private readonly heartRateIconOutline = 'fitness-outline';
    private readonly trainingIconFilled = 'barbell';
    private readonly trainingIconOutline = 'barbell-outline';
    private readonly statisticsIconFilled = 'bar-chart';
    private readonly statisticsIconOutline = 'bar-chart-outline';
    public deviceIcon: string;
    public activityIcon: string;
    public heartRateIcon: string;
    public trainingIcon: string;
    public statisticsIcon: string;
    @ViewChild('tabBar', { static: false }) public tabs!: IonTabs;

    public constructor() {
        this.deviceIcon = this.deviceIconOutline;
        this.activityIcon = this.activityIconOutline;
        this.heartRateIcon = this.heartRateIconOutline;
        this.trainingIcon = this.trainingIconOutline;
        this.statisticsIcon = this.statisticsIconOutline;
    }

    public setSelectedTab(): void {
        const selectedTab = this.tabs.getSelected();
        if (selectedTab) {
            switch (selectedTab) {
                case 'device':
                    this.deviceIcon = this.deviceIconFilled;
                    break;
                case 'activity':
                    this.activityIcon = this.activityIconFilled;
                    break;
                case 'heart-rate':
                    this.heartRateIcon = this.heartRateIconFilled;
                    break;
                case 'training':
                    this.trainingIcon = this.trainingIconFilled;
                    break;
                case 'statistics':
                    this.statisticsIcon = this.statisticsIconFilled;
                    break;
                default:
                    break;
            }
        }
    }
}
