export interface IProperty {
    name: string
    copy?(property: IProperty): void;
}
