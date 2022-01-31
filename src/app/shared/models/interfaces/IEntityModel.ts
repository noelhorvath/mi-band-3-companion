export interface IEntityModel<T> {
    id: string;
    copy?(entity: T): void;
}
