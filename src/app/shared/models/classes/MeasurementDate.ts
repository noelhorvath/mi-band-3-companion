import { IMeasurementDate } from '../interfaces/IMeasurementDate';
import { DateType } from '../../types/custom.types';
import { DateTypeEnum } from '../../enums/date.enum';

export class MeasurementDate implements IMeasurementDate {
    public dateType: DateType;
    public uploadDate: string;

    public constructor(
        dateType = DateTypeEnum.PER_MINUTE,
        uploadDate: string | Date = new Date())
    {
        this.dateType = dateType;
        this.uploadDate = typeof uploadDate === 'string' ? uploadDate : uploadDate.toISOString();
    }

    public copy(other: IMeasurementDate): void {
        if (!this.isEqual(other)) {
            this.dateType = other.dateType;
            this.uploadDate = other.uploadDate;
        }
    }

    public toString(): string {
        return 'dateType: ' + this.dateType + ', uploadDate: ' + this.uploadDate;
    }

    public isEqual(other: IMeasurementDate | undefined): boolean {
        return this !== other ? this.dateType === other?.dateType
            && this.uploadDate === other.uploadDate : true;
    }
}
