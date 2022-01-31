import {Observable} from "rxjs";

export interface BaseFirestoreInterface<T> {
    add(item: T, id?: string): Promise<void>;
    get(id: string): Observable<T | null>;
    list(): Observable<T[] | null>;
    update(item: T): Promise<void>;
    delete(id: string): Promise<void>;
    updateField(id: string, fieldName: string, data: any, isArray: boolean): Promise<void>;
}
