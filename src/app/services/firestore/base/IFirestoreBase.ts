import { Observable } from 'rxjs';
import { QueryOption } from '../../../shared/types/firestore.types';

export interface IFirestoreBase<T> {
    add(item: T, id?: string): Promise<void>;

    get(id: string): Promise<T | undefined>;

    getWithValueChanges(id: string): Observable<T | undefined>;

    list(queryOptions?: QueryOption | QueryOption[]): Promise<T[] | undefined>;

    listWithValueChanges(queryOptions?: QueryOption | QueryOption[]): Observable<T[] | undefined>;

    update(item: T): Promise<void>;

    delete(queryOptions: { id: string } | QueryOption | QueryOption[]): Promise<void>;

    updateField(queryOptions: { id: string }, fieldName: string, data: unknown, addToArray: boolean): Promise<void>;
}
