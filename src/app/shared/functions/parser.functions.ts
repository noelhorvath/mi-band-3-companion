import { QueryDocumentSnapshot, SnapshotOptions, WithFieldValue, DocumentData } from '@angular/fire/firestore';
import { FirestoreConverter } from '../types/firestore.types';

export const objectToClass = <T extends { copy(other: T): void }>(obj: T, type: new () => T): T => {
    const tmp = new type();
    tmp.copy(obj);
    return tmp;
};

export const parseJSON = <T extends { copy(item: T): void }>(data: Array<unknown> | object, type: new () => T): T[] | T =>
    data instanceof Array ? (data as Array<T>).map((s: T) => objectToClass(s, type) ?? new type()) : objectToClass(data as unknown as T, type) ?? new type();

export const genericFirebaseConverter = <T extends { copy(item: T): void }>(type: new () => T): FirestoreConverter<T> => ({
    toFirestore: (data: WithFieldValue<T>): DocumentData => JSON.parse(JSON.stringify(data)),
    fromFirestore: (snapshot: QueryDocumentSnapshot, options?: SnapshotOptions): T => objectToClass<T>(snapshot.data(options) as T, type)
});
