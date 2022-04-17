import { DocumentSnapshot, FieldPath, OrderByDirection, WhereFilterOp } from '@angular/fire/firestore';

export type WhereQuery = {
    fieldPath: string | FieldPath;
    opStr: WhereFilterOp;
    value: unknown;
};
export type LimitQuery = {
    limit: number;
};
export type OrderByQuery = {
    fieldPath: string | FieldPath;
    directionStr?: OrderByDirection;
};
export type QueryOption<T> = WhereQuery | LimitQuery | OrderByQuery | CursorQuery<T>;
export type CursorQueryType = 'startAt' | 'startAfter' | 'endAt' | 'endBefore';
export type CursorQuery<T> = { type: CursorQueryType; snapshot: DocumentSnapshot<T> };
export type PaginateOptions<T> = {
    queryOptions: WhereQuery | OrderByQuery | (WhereQuery | OrderByQuery)[];
    size: number;
    lastDocSnap: DocumentSnapshot<T> | undefined;
};
export type PaginateResult<T> = {
    items: T[];
    lastDocSnap: DocumentSnapshot<T>;
};
