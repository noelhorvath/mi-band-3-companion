import {IProperty} from '../interfaces/IProperty';

export class Property implements IProperty {
    public name: string;

    public constructor(name: string = '') {
        this.name = name;
    }

    copy(property: Property): void {
        this.name = property?.name;
    }
}
