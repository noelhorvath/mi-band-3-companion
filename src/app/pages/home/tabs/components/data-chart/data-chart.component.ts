import { AfterViewInit, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChildren } from '@angular/core';
import { LogHelper } from '../../../../../shared/models/classes/LogHelper';
import { ChartDataset, ChartOptions, ChartType } from 'chart.js';
import { DateType } from '../../../../../shared/types/custom.types';
import { DateTypeEnum } from '../../../../../shared/enums/date.enum';
import { getDaysInMonth } from '../../../../../shared/functions/date.functions';
import { DAYS, MONTHS } from '../../../../../shared/constants/date.constants';
import { generateStringArrayOfNumbers } from '../../../../../shared/functions/generator.funtions';

@Component({
    selector: 'app-data-chart',
    templateUrl: './data-chart.component.html',
    styleUrls: ['./data-chart.component.scss'],
})
export class DataChartComponent implements OnChanges, AfterViewInit {
    private readonly logHelper: LogHelper;
    public readonly CHART_TYPES: DateType[] = [DateTypeEnum.DAILY, DateTypeEnum.WEEKLY, DateTypeEnum.MONTHLY, DateTypeEnum.YEARLY];
    public chartType!: ChartType;
    public chartLabels!: string[];
    public chartOptions: ChartOptions;
    public chartLegend: boolean;
    public isChartDataInitialized: boolean;
    @Input() public readonly chartTypesMap: { [key: string]: ChartType };
    @Input() public readonly chartLabelsMap: { [key: string]: string[] };
    @Input() public chartDateType: DateType | undefined;
    @Input() public chartData: ChartDataset[] | undefined;
    @Input() public isDailyDisabled: boolean;
    @Output() public chartDateTypeChanged: EventEmitter<DateType>;
    @ViewChildren('dateTypeSegBtn') public segmentButtons: HTMLIonSegmentButtonElement[] | undefined;

    public constructor() {
        this.isChartDataInitialized = !!this.chartData;
        this.logHelper = new LogHelper(DataChartComponent.name);
        this.chartDateTypeChanged = new EventEmitter<DateType>();
        this.chartLabelsMap = {
            daily: generateStringArrayOfNumbers(0, 24),
            weekly: DAYS,
            monthly: generateStringArrayOfNumbers(1, getDaysInMonth(new Date()) + 1),
            yearly: MONTHS
        };
        this.chartTypesMap = { daily: 'bar', weekly: 'bar', monthly: 'bar', yearly: 'bar' };
        this.chartOptions = {
            responsive: true,
            scales: {
                y: {
                    min: 0
                }
            }
        };
        this.chartLegend = false;
        this.isDailyDisabled = false;
    }

    public ngOnChanges(changes: SimpleChanges): void {
        this.logHelper.logDefault(this.ngOnChanges.name, 'changes', { value: changes });
        // init labels and char type after restoring saved values for segment(s)
        if (changes['chartDateType']?.currentValue !== undefined && !this.isChartDataInitialized) {
            this.isChartDataInitialized = !this.isChartDataInitialized;
            this.dateTypeSegmentHandler();
            this.logHelper.logDefault(this.ngOnChanges.name, 'Initializing chart labels and type...');
        }

        if (changes['isDailyDisabled']) {
            this.setSegmentButtons();
        }

    }

    public ngAfterViewInit(): void {
        this.setSegmentButtons();
    }

    public setSegmentButtons(): void {
        if (this.segmentButtons !== undefined) {
            this.segmentButtons.map( (button: HTMLIonSegmentButtonElement) => {
                if (button.value === DateTypeEnum.DAILY) {
                    button.disabled = this.isDailyDisabled;
                }
            });
        }
    }

    public dateTypeSegmentHandler(_event?: unknown): void {
        this.logHelper.logDefault(this.dateTypeSegmentHandler.name, 'Selected chart DateType', { value: this.chartDateType });
        this.chartDateTypeChanged.emit(this.chartDateType);
        this.chartLabels = this.chartLabelsMap[`${ this.chartDateType }`];
        this.chartType = this.chartTypesMap[`${ this.chartDateType }`];
    }
}
