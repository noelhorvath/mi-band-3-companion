export interface IEntityModel<T> {
    id?: string;

    copy?(other: T): void;

    toString?(): string;

    isEqual?(other: T | undefined): boolean;
}
