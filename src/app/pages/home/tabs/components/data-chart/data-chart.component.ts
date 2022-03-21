import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { LogHelper } from '../../../../../shared/models/classes/LogHelper';
import { ChartDataset, ChartOptions, ChartType } from 'chart.js';
import { DateType } from '../../../../../shared/types/custom.types';
import { DateTypeEnum } from '../../../../../shared/enums/date.enum';
import { generateStringArrayOfNumbers, getNumOfWeeksInCurrentMonth } from '../../../../../shared/functions/date.functions';
import { DAYS, MONTHS } from '../../../../../shared/constants/date.constants';

@Component({
    selector: 'app-data-chart',
    templateUrl: './data-chart.component.html',
    styleUrls: ['./data-chart.component.scss'],
})
export class DataChartComponent implements OnChanges {
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
    @Output() public chartDateTypeChanged: EventEmitter<DateType>;

    public constructor() {
        this.isChartDataInitialized = !!this.chartData;
        this.logHelper = new LogHelper(DataChartComponent.name);
        this.chartDateTypeChanged = new EventEmitter<DateType>();
        this.chartLabelsMap = {
            daily: generateStringArrayOfNumbers(0, 24),
            weekly: DAYS,
            monthly: generateStringArrayOfNumbers(1, getNumOfWeeksInCurrentMonth(new Date()) + 1),
            yearly: MONTHS
        };
        this.chartTypesMap = { daily: 'line', weekly: 'bar', monthly: 'bar', yearly: 'bar' };
        this.chartOptions = { responsive: true };
        this.chartLegend = false;
    }

    public ngOnChanges(changes: SimpleChanges): void {
        this.logHelper.logDefault(this.ngOnChanges.name, 'changes', { value: changes });
        // init labels and char type after restoring saved values for segment(s)
        if (changes.chartDateType?.currentValue !== undefined && !this.isChartDataInitialized) {
            this.logHelper.logDefault(this.ngOnChanges.name, 'Initializing chart labels and type');
            this.isChartDataInitialized = true;
            this.dateTypeSegmentHandler();
        }
    }

    public dateTypeSegmentHandler(_event?: unknown): void {
        this.logHelper.logDefault(this.dateTypeSegmentHandler.name, 'Selected chart DateType', { value: this.chartDateType });
        this.chartDateTypeChanged.emit(this.chartDateType);
        this.chartLabels = this.chartLabelsMap[`${ this.chartDateType }`];
        this.chartType = this.chartTypesMap[`${ this.chartDateType }`];
    }
}
