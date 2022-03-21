import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { ChartDataset, ChartOptions, ChartType } from 'chart.js';
import { Subscription } from 'rxjs';
import { LanguageService } from '../../../services/language/language.service';
import { TranslatePipe } from '@ngx-translate/core';
import { LogHelper } from '../../models/classes/LogHelper';

@Component({
    selector: 'app-custom-chart',
    templateUrl: './custom-chart.component.html',
    styleUrls: ['./custom-chart.component.scss'],
})
export class CustomChartComponent implements OnInit, OnDestroy, OnChanges {
    private readonly logHelper: LogHelper;
    private languageSubscription: Subscription | undefined;
    public tmpChartLabels: string[] | undefined;
    @Input() public chartType: ChartType | undefined;
    @Input() public chartDataSets: ChartDataset[] | undefined;
    @Input() public chartLabels: string[] | undefined;
    @Input() public chartOptions: ChartOptions | undefined;
    @Input() public chartLegend: boolean | undefined;

    //@Input() public plugins: any;

    public constructor(
        private languageService: LanguageService,
        private translatePipe: TranslatePipe,
    ) {
        this.logHelper = new LogHelper(CustomChartComponent.name);
    }

    public ngOnInit(): void {
        this.languageSubscription = this.languageService.currentLanguageSubject.subscribe(() => {
            this.tmpChartLabels = this.chartLabels?.map((l: string) => this.translatePipe.transform(l.toUpperCase()));
            this.logHelper.logDefault(this.ngOnChanges.name, 'updated labels', { value: this.tmpChartLabels });
        });
    }

    public ngOnChanges(changes: SimpleChanges): void {
        this.logHelper.logDefault(this.ngOnChanges.name, 'changes', { value: changes });
        if (changes.chartLabels) {
            this.tmpChartLabels = this.chartLabels?.map((l: string) => this.translatePipe.transform(l.toUpperCase()));
        }
    }

    public ngOnDestroy(): void {
        this.languageSubscription?.unsubscribe();
    }
}
