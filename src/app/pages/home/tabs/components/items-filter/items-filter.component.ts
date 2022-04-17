import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IFilterOptions } from '../../../../../shared/models/interfaces/IFilterOptions';
import { MessageService } from '../../../../../services/message/message.service';
import { LogHelper } from '../../../../../shared/models/classes/LogHelper';

@Component({
    selector: 'app-items-filter',
    templateUrl: './items-filter.component.html',
    styleUrls: ['./items-filter.component.scss'],
})
export class ItemsFilterComponent {
    private readonly logHelper: LogHelper;
    public filterFormGroup: FormGroup;
    public datePickerMode: 'date' | 'time' | 'date-time' | 'time-date';
    public datePickerFormat: string;
    @Input() public fields: { fieldName: string; text: string }[] | undefined;
    @Input() public dateFieldName: string;
    @Input() public measurementTypes: ('daily' | 'hourly' | 'weekly' | 'monthly' | 'all')[];
    @Input() public startDatePickerId: string;
    @Input() public endDatePickerId: string;
    @Output() public filterOptions: EventEmitter<IFilterOptions>;

    public constructor(
        private formBuilder: FormBuilder,
        private messageService: MessageService
    ) {
        this.logHelper = new LogHelper(ItemsFilterComponent.name);
        this.startDatePickerId = 'start-date-picker';
        this.endDatePickerId = 'end-date-picker';
        this.filterOptions = new EventEmitter<IFilterOptions>();
        this.measurementTypes = ['hourly', 'daily', 'weekly', 'all'];
        this.dateFieldName = 'measurementInfo.date';
        this.datePickerMode = 'date-time';
        this.datePickerFormat = 'YYYY-MM-dd HH:00';
        this.filterFormGroup = this.formBuilder.group({
            measurementType: ['all'],
            startDate: [''],
            endDate: [''],
            fieldName: [this.fields !== undefined && this.fields.length > 0 ? this.fields[0].fieldName : this.dateFieldName],
            fieldValue: [''],
            matchOperator: ['=='],
            orderDirection: ['asc'],
        });
    }

    public resetForm(): void {
        this.filterFormGroup.reset({
            measurementType: 'all',
            startDate: '',
            endDate: '',
            fieldName: (this.fields !== undefined && this.fields.length > 0 ? this.fields[0].fieldName : this.dateFieldName),
            fieldValue: '',
            matchOperator: '==',
            orderDirection: 'asc',
        });
    }

    public filter(): void {
        const value = Number.parseInt(this.filterFormGroup.value.fieldValue, 10);
        if ((!Number.isFinite(value) || !Number.isSafeInteger(value) || value < 0)
            && this.filterFormGroup.value.fieldName !== this.dateFieldName
        ) {
            this.messageService.createToast('FILTER_ERROR', 'FILTER_INVALID_MEASUREMENT_FIELD', 'top', 'danger')
                .then( () => this.logHelper.logDefault(this.filter.name, 'filter error toast created'));
            this.logHelper.logError(this.filter.name, 'invalid measurement field value', { value });
        } else {
            const fieldName = this.filterFormGroup.value.fieldName;
            this.filterOptions.emit({
                measurementType: this.filterFormGroup.value.measurementType,
                startDate: fieldName === this.dateFieldName ? this.filterFormGroup.value.startDate : undefined,
                endDate: fieldName === this.dateFieldName ? this.filterFormGroup.value.endDate : undefined,
                fieldName,
                fieldValue: fieldName !== this.dateFieldName ? this.filterFormGroup.value.fieldValue : undefined,
                matchOperator: fieldName !== this.dateFieldName ? this.filterFormGroup.value.matchOperator : undefined,
                orderDirection: this.filterFormGroup.value.orderDirection,
            });
            this.logHelper.logDefault(this.filter.name, 'filter options', { value: {
                    measurementType: this.filterFormGroup.value.measurementType,
                    startDate: fieldName === this.dateFieldName ? this.filterFormGroup.value.startDate : undefined,
                    endDate: fieldName === this.dateFieldName ? this.filterFormGroup.value.endDate : undefined,
                    fieldName,
                    fieldValue: fieldName !== this.dateFieldName ? this.filterFormGroup.value.fieldValue : undefined,
                    matchOperator: fieldName !== this.dateFieldName ? this.filterFormGroup.value.matchOperator : undefined,
                    orderDirection: this.filterFormGroup.value.orderDirection,
                }
            });
        }
    }

    public measurementTypeChanged(): void {
        if (this.filterFormGroup.value.measurementType === 'hourly'
            || this.filterFormGroup.value.measurementType === 'all') {
            this.datePickerMode = 'date-time';
            this.datePickerFormat = 'YYYY-MM-dd HH:00';
        } else {
            this.datePickerMode = 'date';
            this.datePickerFormat = 'YYYY-MM-dd';
        }
    }
}
