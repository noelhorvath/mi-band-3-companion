import { DocumentData, FieldPath, DocumentSnapshot, QueryDocumentSnapshot, SnapshotOptions, WhereFilterOp, WithFieldValue, OrderByDirection } from '@angular/fire/firestore';

export type FirestoreConverter<T> = { toFirestore: (data: WithFieldValue<T>) => DocumentData; fromFirestore: (snapshot: QueryDocumentSnapshot, options?: SnapshotOptions) => T };
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
export type QueryOption = WhereQuery | LimitQuery | OrderByQuery | CursorQuery;
export type CursorQueryType = 'startAt' | 'startAfter' | 'endAt' | 'endBefore';
export type CursorQuery = { type: CursorQueryType; snapshot: DocumentSnapshot<unknown> };
