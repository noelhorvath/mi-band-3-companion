import { Observable } from 'rxjs';
import { PaginateOptions, PaginateResult, QueryOption } from '../../../shared/types/firestore.types';

export interface IFirestoreBase<T> {
    add(item: T, id?: string): Promise<void>;

    get(id: string): Promise<T | undefined>;

    getWithValueChanges(id: string): Observable<T | undefined>;

    list(queryOptions?: QueryOption<T> | QueryOption<T>[]): Promise<T[] | undefined>;

    listWithValueChanges(queryOptions?: QueryOption<T> | QueryOption<T>[]): Observable<T[] | undefined>;

    delete(queryOptions: { id: string } | QueryOption<T> | QueryOption<T>[]): Promise<void>;

    update(queryOptions: { id: string } | QueryOption<T> | QueryOption<T>[], data: Partial<T>): Promise<void>;

    paginate(options: PaginateOptions<T>): Promise<PaginateResult<T> | undefined>;
}
