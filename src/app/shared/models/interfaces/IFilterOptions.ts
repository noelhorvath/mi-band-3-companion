import { OrderByDirection } from '@angular/fire/firestore';
import { FilterOperator } from '../../types/custom.types';

export interface IFilterOptions {
    measurementType: string;
    startDate: string | undefined;
    endDate: string | undefined;
    fieldName: string;
    fieldValue: number | undefined;
    matchOperator: FilterOperator;
    orderDirection: OrderByDirection;
}
