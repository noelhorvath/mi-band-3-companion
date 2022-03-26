import { IMeasurementDate } from '../interfaces/IMeasurementDate';
import { DateType } from '../../types/custom.types';
import { DateTypeEnum } from '../../enums/date.enum';
import { IFireTimestamp } from '../interfaces/IFireTimestamp';
import { FireTimestamp } from './FireTimestamp';
import { copyProperty } from '../../functions/parser.functions';
import { equals } from '../../functions/comparison.functions';

export class MeasurementDate implements IMeasurementDate {
    public dateType: DateType;
    public uploadDate!: FireTimestamp;

    public constructor(
        dateType = DateTypeEnum.PER_MINUTE,
        uploadDate: IFireTimestamp = FireTimestamp.now())
    {
        this.dateType = dateType;
        copyProperty<IMeasurementDate, MeasurementDate, 'uploadDate', IFireTimestamp, FireTimestamp>
            (this, { uploadDate } as Partial<IMeasurementDate>, 'uploadDate', FireTimestamp);
    }

    public copy(other: IMeasurementDate): void {
        if (!this.isEqual(other)) {
            this.dateType = other.dateType;
            copyProperty<IMeasurementDate, MeasurementDate, 'uploadDate', IFireTimestamp, FireTimestamp>(this, other, 'uploadDate', FireTimestamp);
        }
    }

    public toString(): string {
        return 'dateType: ' + this.dateType + ', uploadDate: ' + this.uploadDate.toString();
    }

    public isEqual(other: IMeasurementDate | undefined): boolean {
        return this !== other ? this.dateType === other?.dateType && equals<IFireTimestamp>(this.uploadDate, other.uploadDate) : true;
    }
}
