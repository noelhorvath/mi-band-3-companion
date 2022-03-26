import { IFirestoreBase } from './IFirestoreBase';
import { Observable } from 'rxjs';
import { IEntityModel } from '../../../shared/models/interfaces/IEntityModel';
import { map } from 'rxjs/operators';
import {
    addDoc,
    arrayUnion,
    collection,
    collectionData,
    CollectionReference,
    deleteDoc,
    doc,
    docData,
    DocumentReference,
    DocumentSnapshot,
    endAt,
    endBefore,
    FieldPath,
    Firestore,
    getDoc,
    getDocs,
    limit,
    orderBy,
    query,
    Query,
    QueryConstraint,
    QueryDocumentSnapshot,
    setDoc,
    startAfter,
    startAt,
    updateDoc,
    where,
    WhereFilterOp
} from '@angular/fire/firestore';
import { genericFirebaseConverter, instantiate } from '../../../shared/functions/parser.functions';
import { CursorQuery, LimitQuery, OrderByQuery, QueryOption, WhereQuery } from '../../../shared/types/firestore.types';
import { QueryOperators } from '../../../shared/enums/firestore.enum';
import { LogHelper } from '../../../shared/models/classes/LogHelper';
import { LogInfo } from '../../../shared/models/classes/LogInfo';
import { Copyable } from '../../../shared/types/custom.types';

export abstract class FirestoreBaseService<T extends IEntityModel<T> & Copyable<T>> implements IFirestoreBase<T> {
    public static readonly INVALID_ID_ERROR = 'ID is invalid';
    public static readonly INVALID_FIELD_NAME_ERROR = 'fieldName is invalid';
    private readonly factory: new (id?: string) => T;
    private _collectionReference: CollectionReference<T> | undefined;
    private _collectionPath: string | undefined;

    public static isQueryValid(constraints: QueryOption[] | QueryOption): { isValid: boolean; errorMsg?: string } {
        const whereOpStats: { [filterOperator in WhereFilterOp]: { count: number; field?: string | FieldPath | undefined } } = {
            '<': { count: 0 },
            '<=': { count: 0 },
            '==': { count: 0 },
            '>': { count: 0 },
            '>=': { count: 0 },
            '!=': { count: 0 },
            in: { count: 0 },
            'not-in': { count: 0 },
            'array-contains': { count: 0 },
            'array-contains-any': { count: 0 },
        };
        const orderByFields: (string | FieldPath)[] = [];
        for (const constraint of constraints instanceof Array ? constraints : Array.of(constraints)) {

            // If you include a filter with a range comparison (<, <=, >, >=), your first ordering must be on the same field
            if ((whereOpStats[QueryOperators.LESS].field !== undefined && orderByFields.length > 0 && orderByFields[0] !== whereOpStats[QueryOperators.LESS].field)
                || (whereOpStats[QueryOperators.LESS_OR_EQUAL].field !== undefined && orderByFields.length > 0 && orderByFields[0] !== whereOpStats[QueryOperators.LESS_OR_EQUAL].field)
                || (whereOpStats[QueryOperators.GREATER].field !== undefined && orderByFields.length > 0 && orderByFields[0] !== whereOpStats[QueryOperators.GREATER].field)
                || (whereOpStats[QueryOperators.GREATER_OR_EQUAL].field !== undefined && orderByFields.length > 0 && orderByFields[0] !== whereOpStats[QueryOperators.GREATER_OR_EQUAL].field)
            ) {
                return { isValid: false, errorMsg: 'First ordering must be on the same field as the range comparison(s)' };
            }

            if ('limit' in constraint) {
                if ((constraint as LimitQuery).limit <= 0) {
                    return { isValid: false, errorMsg: 'Limit must be higher than 0' };
                }
            } else if ('fieldPath' in constraint && 'value' in constraint && 'opStr' in constraint) {
                const field: string | FieldPath = (constraint as WhereQuery).fieldPath;
                whereOpStats[(constraint as WhereQuery).opStr].count++;

                if (whereOpStats[(constraint as WhereQuery).opStr].field === undefined) {
                    whereOpStats[(constraint as WhereQuery).opStr].field = field;
                }

                // In a compound query, range (<, <=, >, >=) and not equals (!=, not-in) comparisons must all filter on the same field.
                // Range filter and orderBy cannot be on different fields
                if (whereOpStats[QueryOperators.LESS].count > 1 && whereOpStats[QueryOperators.LESS_OR_EQUAL].count > 1
                    && whereOpStats[QueryOperators.GREATER].count > 1 && whereOpStats[QueryOperators.GREATER_OR_EQUAL].count > 1
                    && whereOpStats[QueryOperators.NOT_EQUAL].count > 1 && whereOpStats[QueryOperators.NOT_IN].count > 1) {
                    return { isValid: false, errorMsg: 'Only one of each range and not equals comparisons is allowed' };
                }

                if (whereOpStats[QueryOperators.LESS].field !== undefined) {
                    if ((whereOpStats[QueryOperators.LESS_OR_EQUAL].field !== undefined && whereOpStats[QueryOperators.LESS].field !== whereOpStats[QueryOperators.LESS_OR_EQUAL].field)
                        || (whereOpStats[QueryOperators.GREATER].field !== undefined && whereOpStats[QueryOperators.LESS].field !== whereOpStats[QueryOperators.GREATER].field)
                        || (whereOpStats[QueryOperators.GREATER_OR_EQUAL].field !== undefined && whereOpStats[QueryOperators.LESS].field !== whereOpStats[QueryOperators.GREATER_OR_EQUAL].field)
                        || (whereOpStats[QueryOperators.NOT_EQUAL].field !== undefined && whereOpStats[QueryOperators.LESS].field !== whereOpStats[QueryOperators.NOT_EQUAL].field)
                        || (whereOpStats[QueryOperators.NOT_IN].field !== undefined && whereOpStats[QueryOperators.LESS].field !== whereOpStats[QueryOperators.NOT_IN].field)) {
                        return { isValid: false, errorMsg: 'Range (<, <=, >, >=) and not equals (!=, not-in) comparisons must all filter on the same field' };
                    }
                }

                if (whereOpStats[QueryOperators.LESS_OR_EQUAL].field !== undefined) {
                    if ((whereOpStats[QueryOperators.LESS].field !== undefined && whereOpStats[QueryOperators.LESS_OR_EQUAL].field !== whereOpStats[QueryOperators.LESS].field)
                        || (whereOpStats[QueryOperators.GREATER].field !== undefined && whereOpStats[QueryOperators.LESS_OR_EQUAL].field !== whereOpStats[QueryOperators.GREATER].field)
                        || (whereOpStats[QueryOperators.GREATER_OR_EQUAL].field !== undefined && whereOpStats[QueryOperators.LESS_OR_EQUAL].field !== whereOpStats[QueryOperators.GREATER_OR_EQUAL].field)
                        || (whereOpStats[QueryOperators.NOT_EQUAL].field !== undefined && whereOpStats[QueryOperators.LESS_OR_EQUAL].field !== whereOpStats[QueryOperators.NOT_EQUAL].field)
                        || (whereOpStats[QueryOperators.NOT_IN].field !== undefined && whereOpStats[QueryOperators.LESS_OR_EQUAL].field !== whereOpStats[QueryOperators.NOT_IN].field)) {
                        return { isValid: false, errorMsg: 'Range (<, <=, >, >=) and not equals (!=, not-in) comparisons must all filter on the same field' };
                    }
                }

                if (whereOpStats[QueryOperators.GREATER].field !== undefined) {
                    if ((whereOpStats[QueryOperators.LESS_OR_EQUAL].field !== undefined && whereOpStats[QueryOperators.GREATER].field !== whereOpStats[QueryOperators.LESS_OR_EQUAL].field)
                        || (whereOpStats[QueryOperators.LESS].field !== undefined && whereOpStats[QueryOperators.GREATER].field !== whereOpStats[QueryOperators.LESS].field)
                        || (whereOpStats[QueryOperators.GREATER_OR_EQUAL].field !== undefined && whereOpStats[QueryOperators.GREATER].field !== whereOpStats[QueryOperators.GREATER_OR_EQUAL].field)
                        || (whereOpStats[QueryOperators.NOT_EQUAL].field !== undefined && whereOpStats[QueryOperators.GREATER].field !== whereOpStats[QueryOperators.NOT_EQUAL].field)
                        || (whereOpStats[QueryOperators.NOT_IN].field !== undefined && whereOpStats[QueryOperators.GREATER].field !== whereOpStats[QueryOperators.NOT_IN].field)) {
                        return { isValid: false, errorMsg: 'Range (<, <=, >, >=) and not equals (!=, not-in) comparisons must all filter on the same field' };
                    }
                }

                if (whereOpStats[QueryOperators.GREATER_OR_EQUAL].field !== undefined) {
                    if ((whereOpStats[QueryOperators.LESS_OR_EQUAL].field !== undefined && whereOpStats[QueryOperators.GREATER_OR_EQUAL].field !== whereOpStats[QueryOperators.LESS_OR_EQUAL].field)
                        || (whereOpStats[QueryOperators.GREATER].field !== undefined && whereOpStats[QueryOperators.GREATER_OR_EQUAL].field !== whereOpStats[QueryOperators.GREATER].field)
                        || (whereOpStats[QueryOperators.LESS].field !== undefined && whereOpStats[QueryOperators.GREATER_OR_EQUAL].field !== whereOpStats[QueryOperators.LESS].field)
                        || (whereOpStats[QueryOperators.NOT_EQUAL].field !== undefined && whereOpStats[QueryOperators.GREATER_OR_EQUAL].field !== whereOpStats[QueryOperators.NOT_EQUAL].field)
                        || (whereOpStats[QueryOperators.NOT_IN].field !== undefined && whereOpStats[QueryOperators.GREATER_OR_EQUAL].field !== whereOpStats[QueryOperators.NOT_IN].field)) {
                        return { isValid: false, errorMsg: 'Range (<, <=, >, >=) and not equals (!=, not-in) comparisons must all filter on the same field' };
                    }
                }

                if (whereOpStats[QueryOperators.NOT_EQUAL].field !== undefined) {
                    if ((whereOpStats[QueryOperators.LESS_OR_EQUAL].field !== undefined && whereOpStats[QueryOperators.NOT_EQUAL].field !== whereOpStats[QueryOperators.LESS_OR_EQUAL].field)
                        || (whereOpStats[QueryOperators.GREATER].field !== undefined && whereOpStats[QueryOperators.NOT_EQUAL].field !== whereOpStats[QueryOperators.GREATER].field)
                        || (whereOpStats[QueryOperators.GREATER_OR_EQUAL].field !== undefined && whereOpStats[QueryOperators.NOT_EQUAL].field !== whereOpStats[QueryOperators.GREATER_OR_EQUAL].field)
                        || (whereOpStats[QueryOperators.LESS].field !== undefined && whereOpStats[QueryOperators.NOT_EQUAL].field !== whereOpStats[QueryOperators.LESS].field)
                        || (whereOpStats[QueryOperators.NOT_IN].field !== undefined && whereOpStats[QueryOperators.NOT_EQUAL].field !== whereOpStats[QueryOperators.NOT_IN].field)) {
                        return { isValid: false, errorMsg: 'Range (<, <=, >, >=) and not equals (!=, not-in) comparisons must all filter on the same field' };
                    }
                }

                if (whereOpStats[QueryOperators.NOT_IN].field !== undefined) {
                    if ((whereOpStats[QueryOperators.LESS_OR_EQUAL].field !== undefined && whereOpStats[QueryOperators.NOT_IN].field !== whereOpStats[QueryOperators.LESS_OR_EQUAL].field)
                        || (whereOpStats[QueryOperators.GREATER].field !== undefined && whereOpStats[QueryOperators.NOT_IN].field !== whereOpStats[QueryOperators.GREATER].field)
                        || (whereOpStats[QueryOperators.GREATER_OR_EQUAL].field !== undefined && whereOpStats[QueryOperators.NOT_IN].field !== whereOpStats[QueryOperators.GREATER_OR_EQUAL].field)
                        || (whereOpStats[QueryOperators.NOT_EQUAL].field !== undefined && whereOpStats[QueryOperators.NOT_IN].field !== whereOpStats[QueryOperators.NOT_EQUAL].field)
                        || (whereOpStats[QueryOperators.LESS].field !== undefined && whereOpStats[QueryOperators.NOT_IN].field !== whereOpStats[QueryOperators.LESS].field)) {
                        return { isValid: false, errorMsg: 'Range (<, <=, >, >=) and not equals (!=, not-in) comparisons must all filter on the same field' };
                    }
                }

                // You cannot order your query by any field included in an equality (=) or in clause
                if ((whereOpStats[QueryOperators.EQUAL].field !== undefined && orderByFields.includes(whereOpStats[QueryOperators.EQUAL].field as string | FieldPath))
                    || (whereOpStats[QueryOperators.NOT_EQUAL].field !== undefined && orderByFields.includes(whereOpStats[QueryOperators.NOT_EQUAL].field as string | FieldPath))
                    || (whereOpStats[QueryOperators.NOT_IN].field !== undefined && orderByFields.includes(whereOpStats[QueryOperators.NOT_IN].field as string | FieldPath))
                    || (whereOpStats[QueryOperators.IN].field !== undefined && orderByFields.includes(whereOpStats[QueryOperators.IN].field as string | FieldPath))) {
                    return { isValid: false, errorMsg: 'Query cannot be ordered by any field included in an equality or in clause' };
                }

                // in, not-in, and array-contains-any support up to 10 comparison values
                if ((constraint as WhereQuery).opStr === QueryOperators.IN || (constraint as WhereQuery).opStr === QueryOperators.NOT_IN
                    || (constraint as WhereQuery).opStr === QueryOperators.ARRAY_CONTAINS_ANY) {
                    if ((constraint as WhereQuery).value instanceof Array) {
                        if ((((constraint as WhereQuery).value) as Array<any>).length > 10) {
                            return { isValid: false, errorMsg: 'More than 10 comparison values are not supported with the use of in, not-in and array-contains-any' };
                        }
                    } else {
                        return { isValid: false, errorMsg: 'Value used for not-in, in, array-contains-any comparisons must be an array' };
                    }
                }

                // You can use at most one array-contains clause per query. You can't combine array-contains with array-contains-any
                if ((whereOpStats[QueryOperators.ARRAY_CONTAINS].count + whereOpStats[QueryOperators.ARRAY_CONTAINS_ANY].count) > 1) {
                    return { isValid: false, errorMsg: 'Only one array-contains clause is allows in a query' };
                }

                // You can use at most one in, not-in, or array-contains-any clause per query. You can't combine these operators in the same query.
                if ((whereOpStats[QueryOperators.IN].count + whereOpStats[QueryOperators.NOT_IN].count + whereOpStats[QueryOperators.ARRAY_CONTAINS_ANY].count) > 1) {
                    return { isValid: false, errorMsg: 'Only one in, not-in, or array-contains-any clause per query is allowed' };
                }

            } else if ('fieldPath' in constraint) {
                const field: string | FieldPath = (constraint as OrderByQuery).fieldPath;
                orderByFields.push(field);
                // You cannot order your query by any field included in an equality (=) or in clause
                if (whereOpStats[QueryOperators.IN].field !== undefined && whereOpStats[QueryOperators.IN].field === field
                    || whereOpStats[QueryOperators.NOT_IN].field !== undefined && whereOpStats[QueryOperators.NOT_IN].field === field
                    || whereOpStats[QueryOperators.EQUAL].field !== undefined && whereOpStats[QueryOperators.EQUAL].field === field
                    || whereOpStats[QueryOperators.NOT_EQUAL].field !== undefined && whereOpStats[QueryOperators.NOT_EQUAL].field === field
                    || whereOpStats[QueryOperators.GREATER_OR_EQUAL].field !== undefined && whereOpStats[QueryOperators.GREATER_OR_EQUAL].field === field) {
                    return { isValid: false, errorMsg: 'Query cannot be ordered by any field included in an equality or in clause' };
                }
            }
        }
        return { isValid: true };
    }

    protected constructor(protected readonly firestore: Firestore, factory: new () => T, collectionPath?: string) {
        this.factory = factory;
        this._collectionPath = collectionPath;
        this._collectionReference = collectionPath !== undefined ? collection(this.firestore, collectionPath).withConverter<T>(genericFirebaseConverter<T>(factory)) : collectionPath;
    }

    private set collectionReference(collectionReference: CollectionReference<T> | undefined) {
        this._collectionReference = collectionReference;
    }

    protected get collectionReference(): CollectionReference<T> | undefined {
        return this._collectionReference;
    }

    protected set collectionPath(path: string | undefined) {
        this._collectionPath = path;
        this.collectionReference = path !== undefined ? collection(this.firestore, path).withConverter(genericFirebaseConverter(this.factory)) : path;
    }

    public get collectionPath(): string | undefined {
        return this._collectionPath;
    }

    private getDocRef(id?: string): DocumentReference<T> {
        if (this.collectionPath === undefined) {
            throw new Error('Collection path is undefined');
        }
        return id !== undefined
            ? doc(this.firestore, this.collectionPath, id).withConverter(genericFirebaseConverter(this.factory))
            : doc(this.firestore, this.collectionPath).withConverter(genericFirebaseConverter(this.factory));
    }

    private createQuery(queryOptions: QueryOption | QueryOption[] | undefined): Query<T> {
        if (this.collectionReference === undefined) {
            throw new Error('CollectionReference is undefined');
        }

        if (queryOptions === undefined) {
            return query<T>(this.collectionReference, ...[]);
        } else {
            const queryCheckResult = FirestoreBaseService.isQueryValid(queryOptions);
            if (!queryCheckResult.isValid) {
                throw new Error(queryCheckResult.errorMsg);
            } else {
                const queryResult: QueryConstraint[] = [];
                for (const queryOption of queryOptions instanceof Array ? queryOptions : Array.of(queryOptions)) {
                    if ('limit' in queryOption) {
                        queryResult.push(limit((queryOption as LimitQuery).limit));
                    } else if ('fieldPath' in queryOption && 'value' in queryOption && 'opStr' in queryOption) {
                        queryResult.push(where((queryOption as WhereQuery).fieldPath, (queryOption as WhereQuery).opStr, (queryOption as WhereQuery).value));
                    } else if ('fieldPath' in queryOption) {
                        queryResult.push(orderBy((queryOption as OrderByQuery).fieldPath, (queryOption as OrderByQuery).directionStr));
                    } else if ('snapshot' in queryOption) {
                        if ((queryOption as CursorQuery).type === 'startAt') {
                            queryResult.push(startAt((queryOption as CursorQuery).snapshot));
                        } else if ((queryOption as CursorQuery).type === 'startAt') {
                            queryResult.push(startAfter((queryOption as CursorQuery).snapshot));
                        } else if ((queryOption as CursorQuery).type === 'startAt') {
                            queryResult.push(endAt((queryOption as CursorQuery).snapshot));
                        } else if ((queryOption as CursorQuery).type === 'startAt') {
                            queryResult.push(endBefore((queryOption as CursorQuery).snapshot));
                        }
                    }
                }
                return query<T>(this.collectionReference, ...queryResult);
            }
        }
    }

    public async add(item: T): Promise<void> {
        try {
            if (item.id !== 'undefined' && item.id !== undefined) {
                // use existing id as document id
                await setDoc<T>(this.getDocRef(item.id), item);
            } else {
                if (this.collectionReference === undefined) {
                    return Promise.reject(new Error('CollectionReference is undefined'));
                }
                // use auto-generated id
                const docRef = await addDoc<T>(this.collectionReference, item);
                await this.updateField({ id: docRef.id }, 'id', docRef.id);
            }
        } catch (e: unknown) {
            return Promise.reject(e);
        }
    }

    public async delete(queryOptions: { id: string } | QueryOption | QueryOption[]): Promise<void> {
        if ('id' in queryOptions) {
            if (queryOptions.id === 'undefined') {
                return Promise.reject(FirestoreBaseService.INVALID_ID_ERROR);
            } else if (this.collectionPath === undefined) {
                return Promise.reject('Collection path is undefined');
            }
            return deleteDoc(doc(this.firestore, this.collectionPath, queryOptions.id));
        } else {
            try {
                const querySnapshots = await getDocs(this.createQuery(queryOptions));
                querySnapshots.forEach((result: QueryDocumentSnapshot<T>) => {
                    if (result.exists()) {
                        deleteDoc(result.ref).catch((e: unknown) => LogHelper.log(new LogInfo(FirestoreBaseService.name, 'delete', 'delete document error', { value: e })));
                    }
                });
            } catch (e: unknown) {
                return Promise.reject(e);
            }
        }
    }

    public async get(id: string): Promise<T | undefined> {
        try {
            const docSnap = await getDoc<T>(this.getDocRef(id));
            return docSnap.exists() ? Promise.resolve(instantiate(docSnap.data(), this.factory)) : Promise.resolve(docSnap.data());
        } catch (e: unknown) {
            throw e;
        }
    }

    public getWithValueChanges(id: string): Observable<T | undefined> {
        try {
            return docData<T>(this.getDocRef(id)).pipe(map((item: T | undefined) => item !== undefined ? instantiate(item, this.factory) : item));
        } catch (e: unknown) {
            throw e;
        }
    }

    public async list(queryOptions?: QueryOption | QueryOption[]): Promise<T[] | undefined> {
        try {
            const docSnaps = await getDocs<T>(this.createQuery(queryOptions));
            if (docSnaps.empty) {
                return Promise.resolve(undefined);
            }
            return Promise.resolve(docSnaps.docs.map((docSnap: DocumentSnapshot<T>) => instantiate(docSnap.data() as T, this.factory)));
        } catch (e: unknown) {
            throw e;
        }
    }

    public listWithValueChanges(queryOptions?: QueryOption | QueryOption[]): Observable<T[] | undefined> {
        try {
            return collectionData(this.createQuery(queryOptions)).pipe(map((items: T[] | undefined) => items?.map((item: T) => instantiate(item, this.factory))));
        } catch (e: unknown) {
            throw e;
        }
    }

    public async update(item: T): Promise<void> {
        if (!item.id || item.id === 'undefined') {
            return Promise.reject(FirestoreBaseService.INVALID_ID_ERROR);
        }
        return updateDoc<T>(this.getDocRef(item.id), JSON.parse(JSON.stringify(item)));
    }

    public async updateField(
        queryOptions: { id: string } | QueryOption | QueryOption[],
        fieldName: string,
        data: unknown,
        addToArray: boolean = false
    ): Promise<void> {
        try {
            if (fieldName === 'undefined') {
                return Promise.reject(FirestoreBaseService.INVALID_FIELD_NAME_ERROR);
            } else if ('id' in queryOptions && queryOptions.id === 'undefined') {
                return Promise.reject(FirestoreBaseService.INVALID_ID_ERROR);
            }
            const updateData: Record<string, unknown> = {};
            updateData[`${ fieldName }`] = addToArray ? arrayUnion(JSON.parse(JSON.stringify(data))) : data;
            if ('id' in queryOptions) {
                return updateDoc<T>(this.getDocRef(queryOptions.id), (data instanceof Array ? JSON.parse(JSON.stringify(updateData)) : updateData));
            } else {
                const itemList = await this.list(queryOptions);
                itemList?.map((item: T) => item.id === undefined ? Promise.resolve()
                    : updateDoc<T>(this.getDocRef(item.id), (data instanceof Array ? JSON.parse(JSON.stringify(updateData)) : updateData)));
            }
        } catch (e: unknown) {
            throw e;
        }
    }

}
