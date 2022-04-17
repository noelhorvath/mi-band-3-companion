import { IFirestoreBase } from './IFirestoreBase';
import { Observable } from 'rxjs';
import { IEntityModel } from '../../../shared/models/interfaces/IEntityModel';
import { map } from 'rxjs/operators';
import {
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
    Firestore, FirestoreDataConverter,
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
    where,
    WhereFilterOp
} from '@angular/fire/firestore';
import { instantiate } from '../../../shared/functions/parser.functions';
import { CursorQuery, LimitQuery, OrderByQuery, PaginateOptions, PaginateResult, QueryOption, WhereQuery } from '../../../shared/types/firestore.types';
import { QueryOperator } from '../../../shared/enums/firestore.enum';
import { LogHelper } from '../../../shared/models/classes/LogHelper';
import { LogInfo } from '../../../shared/models/classes/LogInfo';

export abstract class FirestoreBaseService<T extends IEntityModel<T>> implements IFirestoreBase<T> {
    public static readonly INVALID_ID_ERROR = 'ID is invalid';
    private readonly factory: new (id?: string) => T;
    private readonly firestoreConverter: FirestoreDataConverter<T>;
    private _collectionReference: CollectionReference<T> | undefined;
    private _collectionPath: string | undefined;

    public static isQueryValid<T>(constraints: QueryOption<T>[] | QueryOption<T>): { isValid: boolean; errorMsg?: string } {
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
            if ((whereOpStats[QueryOperator.LESS].field !== undefined && orderByFields.length > 0 && orderByFields[0] !== whereOpStats[QueryOperator.LESS].field)
                || (whereOpStats[QueryOperator.LESS_OR_EQUAL].field !== undefined && orderByFields.length > 0 && orderByFields[0] !== whereOpStats[QueryOperator.LESS_OR_EQUAL].field)
                || (whereOpStats[QueryOperator.GREATER].field !== undefined && orderByFields.length > 0 && orderByFields[0] !== whereOpStats[QueryOperator.GREATER].field)
                || (whereOpStats[QueryOperator.GREATER_OR_EQUAL].field !== undefined && orderByFields.length > 0 && orderByFields[0] !== whereOpStats[QueryOperator.GREATER_OR_EQUAL].field)
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
                if (whereOpStats[QueryOperator.LESS].count > 1 && whereOpStats[QueryOperator.LESS_OR_EQUAL].count > 1
                    && whereOpStats[QueryOperator.GREATER].count > 1 && whereOpStats[QueryOperator.GREATER_OR_EQUAL].count > 1
                    && whereOpStats[QueryOperator.NOT_EQUAL].count > 1 && whereOpStats[QueryOperator.NOT_IN].count > 1) {
                    return { isValid: false, errorMsg: 'Only one of each range and not equals comparisons is allowed' };
                }

                if (whereOpStats[QueryOperator.LESS].field !== undefined) {
                    if ((whereOpStats[QueryOperator.LESS_OR_EQUAL].field !== undefined && whereOpStats[QueryOperator.LESS].field !== whereOpStats[QueryOperator.LESS_OR_EQUAL].field)
                        || (whereOpStats[QueryOperator.GREATER].field !== undefined && whereOpStats[QueryOperator.LESS].field !== whereOpStats[QueryOperator.GREATER].field)
                        || (whereOpStats[QueryOperator.GREATER_OR_EQUAL].field !== undefined && whereOpStats[QueryOperator.LESS].field !== whereOpStats[QueryOperator.GREATER_OR_EQUAL].field)
                        || (whereOpStats[QueryOperator.NOT_EQUAL].field !== undefined && whereOpStats[QueryOperator.LESS].field !== whereOpStats[QueryOperator.NOT_EQUAL].field)
                        || (whereOpStats[QueryOperator.NOT_IN].field !== undefined && whereOpStats[QueryOperator.LESS].field !== whereOpStats[QueryOperator.NOT_IN].field)) {
                        return { isValid: false, errorMsg: 'Range (<, <=, >, >=) and not equals (!=, not-in) comparisons must all filter on the same field' };
                    }
                }

                if (whereOpStats[QueryOperator.LESS_OR_EQUAL].field !== undefined) {
                    if ((whereOpStats[QueryOperator.LESS].field !== undefined && whereOpStats[QueryOperator.LESS_OR_EQUAL].field !== whereOpStats[QueryOperator.LESS].field)
                        || (whereOpStats[QueryOperator.GREATER].field !== undefined && whereOpStats[QueryOperator.LESS_OR_EQUAL].field !== whereOpStats[QueryOperator.GREATER].field)
                        || (whereOpStats[QueryOperator.GREATER_OR_EQUAL].field !== undefined && whereOpStats[QueryOperator.LESS_OR_EQUAL].field !== whereOpStats[QueryOperator.GREATER_OR_EQUAL].field)
                        || (whereOpStats[QueryOperator.NOT_EQUAL].field !== undefined && whereOpStats[QueryOperator.LESS_OR_EQUAL].field !== whereOpStats[QueryOperator.NOT_EQUAL].field)
                        || (whereOpStats[QueryOperator.NOT_IN].field !== undefined && whereOpStats[QueryOperator.LESS_OR_EQUAL].field !== whereOpStats[QueryOperator.NOT_IN].field)) {
                        return { isValid: false, errorMsg: 'Range (<, <=, >, >=) and not equals (!=, not-in) comparisons must all filter on the same field' };
                    }
                }

                if (whereOpStats[QueryOperator.GREATER].field !== undefined) {
                    if ((whereOpStats[QueryOperator.LESS_OR_EQUAL].field !== undefined && whereOpStats[QueryOperator.GREATER].field !== whereOpStats[QueryOperator.LESS_OR_EQUAL].field)
                        || (whereOpStats[QueryOperator.LESS].field !== undefined && whereOpStats[QueryOperator.GREATER].field !== whereOpStats[QueryOperator.LESS].field)
                        || (whereOpStats[QueryOperator.GREATER_OR_EQUAL].field !== undefined && whereOpStats[QueryOperator.GREATER].field !== whereOpStats[QueryOperator.GREATER_OR_EQUAL].field)
                        || (whereOpStats[QueryOperator.NOT_EQUAL].field !== undefined && whereOpStats[QueryOperator.GREATER].field !== whereOpStats[QueryOperator.NOT_EQUAL].field)
                        || (whereOpStats[QueryOperator.NOT_IN].field !== undefined && whereOpStats[QueryOperator.GREATER].field !== whereOpStats[QueryOperator.NOT_IN].field)) {
                        return { isValid: false, errorMsg: 'Range (<, <=, >, >=) and not equals (!=, not-in) comparisons must all filter on the same field' };
                    }
                }

                if (whereOpStats[QueryOperator.GREATER_OR_EQUAL].field !== undefined) {
                    if ((whereOpStats[QueryOperator.LESS_OR_EQUAL].field !== undefined && whereOpStats[QueryOperator.GREATER_OR_EQUAL].field !== whereOpStats[QueryOperator.LESS_OR_EQUAL].field)
                        || (whereOpStats[QueryOperator.GREATER].field !== undefined && whereOpStats[QueryOperator.GREATER_OR_EQUAL].field !== whereOpStats[QueryOperator.GREATER].field)
                        || (whereOpStats[QueryOperator.LESS].field !== undefined && whereOpStats[QueryOperator.GREATER_OR_EQUAL].field !== whereOpStats[QueryOperator.LESS].field)
                        || (whereOpStats[QueryOperator.NOT_EQUAL].field !== undefined && whereOpStats[QueryOperator.GREATER_OR_EQUAL].field !== whereOpStats[QueryOperator.NOT_EQUAL].field)
                        || (whereOpStats[QueryOperator.NOT_IN].field !== undefined && whereOpStats[QueryOperator.GREATER_OR_EQUAL].field !== whereOpStats[QueryOperator.NOT_IN].field)) {
                        return { isValid: false, errorMsg: 'Range (<, <=, >, >=) and not equals (!=, not-in) comparisons must all filter on the same field' };
                    }
                }

                if (whereOpStats[QueryOperator.NOT_EQUAL].field !== undefined) {
                    if ((whereOpStats[QueryOperator.LESS_OR_EQUAL].field !== undefined && whereOpStats[QueryOperator.NOT_EQUAL].field !== whereOpStats[QueryOperator.LESS_OR_EQUAL].field)
                        || (whereOpStats[QueryOperator.GREATER].field !== undefined && whereOpStats[QueryOperator.NOT_EQUAL].field !== whereOpStats[QueryOperator.GREATER].field)
                        || (whereOpStats[QueryOperator.GREATER_OR_EQUAL].field !== undefined && whereOpStats[QueryOperator.NOT_EQUAL].field !== whereOpStats[QueryOperator.GREATER_OR_EQUAL].field)
                        || (whereOpStats[QueryOperator.LESS].field !== undefined && whereOpStats[QueryOperator.NOT_EQUAL].field !== whereOpStats[QueryOperator.LESS].field)
                        || (whereOpStats[QueryOperator.NOT_IN].field !== undefined && whereOpStats[QueryOperator.NOT_EQUAL].field !== whereOpStats[QueryOperator.NOT_IN].field)) {
                        return { isValid: false, errorMsg: 'Range (<, <=, >, >=) and not equals (!=, not-in) comparisons must all filter on the same field' };
                    }
                }

                if (whereOpStats[QueryOperator.NOT_IN].field !== undefined) {
                    if ((whereOpStats[QueryOperator.LESS_OR_EQUAL].field !== undefined && whereOpStats[QueryOperator.NOT_IN].field !== whereOpStats[QueryOperator.LESS_OR_EQUAL].field)
                        || (whereOpStats[QueryOperator.GREATER].field !== undefined && whereOpStats[QueryOperator.NOT_IN].field !== whereOpStats[QueryOperator.GREATER].field)
                        || (whereOpStats[QueryOperator.GREATER_OR_EQUAL].field !== undefined && whereOpStats[QueryOperator.NOT_IN].field !== whereOpStats[QueryOperator.GREATER_OR_EQUAL].field)
                        || (whereOpStats[QueryOperator.NOT_EQUAL].field !== undefined && whereOpStats[QueryOperator.NOT_IN].field !== whereOpStats[QueryOperator.NOT_EQUAL].field)
                        || (whereOpStats[QueryOperator.LESS].field !== undefined && whereOpStats[QueryOperator.NOT_IN].field !== whereOpStats[QueryOperator.LESS].field)) {
                        return { isValid: false, errorMsg: 'Range (<, <=, >, >=) and not equals (!=, not-in) comparisons must all filter on the same field' };
                    }
                }

                // You cannot order your query by any field included in an equality (=) or in clause
                if ((whereOpStats[QueryOperator.EQUAL].field !== undefined && orderByFields.includes(whereOpStats[QueryOperator.EQUAL].field as string | FieldPath))
                    || (whereOpStats[QueryOperator.IN].field !== undefined && orderByFields.includes(whereOpStats[QueryOperator.IN].field as string | FieldPath))) {
                    return { isValid: false, errorMsg: 'Query cannot be ordered by any field included in an equality or in clause' };
                }

                // in, not-in, and array-contains-any support up to 10 comparison values
                if ((constraint as WhereQuery).opStr === QueryOperator.IN || (constraint as WhereQuery).opStr === QueryOperator.NOT_IN
                    || (constraint as WhereQuery).opStr === QueryOperator.ARRAY_CONTAINS_ANY) {
                    if ((constraint as WhereQuery).value instanceof Array) {
                        if ((((constraint as WhereQuery).value) as Array<any>).length > 10) {
                            return { isValid: false, errorMsg: 'More than 10 comparison values are not supported with the use of in, not-in and array-contains-any' };
                        }
                    } else {
                        return { isValid: false, errorMsg: 'Value used for not-in, in, array-contains-any comparisons must be an array' };
                    }
                }

                // You can use at most one array-contains clause per query. You can't combine array-contains with array-contains-any
                if ((whereOpStats[QueryOperator.ARRAY_CONTAINS].count + whereOpStats[QueryOperator.ARRAY_CONTAINS_ANY].count) > 1) {
                    return { isValid: false, errorMsg: 'Only one array-contains clause is allows in a query' };
                }

                // You can use at most one in, not-in, or array-contains-any clause per query. You can't combine these operators in the same query.
                if ((whereOpStats[QueryOperator.IN].count + whereOpStats[QueryOperator.NOT_IN].count + whereOpStats[QueryOperator.ARRAY_CONTAINS_ANY].count) > 1) {
                    return { isValid: false, errorMsg: 'Only one in, not-in, or array-contains-any clause per query is allowed' };
                }

            } else if ('fieldPath' in constraint) {
                const field: string | FieldPath = (constraint as OrderByQuery).fieldPath;
                orderByFields.push(field);
                // You cannot order your query by any field included in an equality (=) or in clause
                if (whereOpStats[QueryOperator.IN].field !== undefined && whereOpStats[QueryOperator.IN].field === field
                    //|| whereOpStats[QueryOperator.NOT_IN].field !== undefined && whereOpStats[QueryOperator.NOT_IN].field === field
                    || whereOpStats[QueryOperator.EQUAL].field !== undefined && whereOpStats[QueryOperator.EQUAL].field === field) {
                    //|| whereOpStats[QueryOperator.NOT_EQUAL].field !== undefined && whereOpStats[QueryOperator.NOT_EQUAL].field === field
                    return { isValid: false, errorMsg: 'Query cannot be ordered by any field included in an equality or in clause' };
                }
            }
        }
        return { isValid: true };
    }

    protected constructor(
        protected readonly firestore: Firestore,
        factory: new () => T,
        firestoreConverter: FirestoreDataConverter<T>,
        collectionPath?: string
    ) {
        this.factory = factory;
        this.firestoreConverter = firestoreConverter;
        this._collectionPath = collectionPath;
        this._collectionReference = collectionPath !== undefined
            ? collection(this.firestore, collectionPath).withConverter<T>(firestoreConverter)
            : collectionPath;
    }

    private set collectionReference(collectionReference: CollectionReference<T> | undefined) {
        this._collectionReference = collectionReference;
    }

    protected get collectionReference(): CollectionReference<T> | undefined {
        return this._collectionReference;
    }

    protected set collectionPath(path: string | undefined) {
        this._collectionPath = path;
        this.collectionReference = path !== undefined ? collection(this.firestore, path)
            .withConverter(this.firestoreConverter) : path;
    }

    public get collectionPath(): string | undefined {
        return this._collectionPath;
    }

    protected getDocRef(id?: string): DocumentReference<T> {
        if (this.collectionPath === undefined) {
            throw new Error('Collection path is undefined');
        }
        return id !== undefined
            ? doc(this.firestore, this.collectionPath, id).withConverter(this.firestoreConverter)
            : doc(this.firestore, this.collectionPath).withConverter(this.firestoreConverter);
    }

    private createQuery(queryOptions: QueryOption<T> | QueryOption<T>[] | undefined): Query<T> {
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
                        if ((queryOption as CursorQuery<T>).type === 'startAt') {
                            queryResult.push(startAt((queryOption as CursorQuery<T>).snapshot));
                        } else if ((queryOption as CursorQuery<T>).type === 'startAfter') {
                            queryResult.push(startAfter((queryOption as CursorQuery<T>).snapshot));
                        } else if ((queryOption as CursorQuery<T>).type === 'endAt') {
                            queryResult.push(endAt((queryOption as CursorQuery<T>).snapshot));
                        } else if ((queryOption as CursorQuery<T>).type === 'endBefore') {
                            queryResult.push(endBefore((queryOption as CursorQuery<T>).snapshot));
                        }
                    }
                }
                return query<T>(this.collectionReference, ...queryResult);
            }
        }
    }

    public async add(item: T): Promise<void> {
        try {
            if (item.id === 'undefined' || item.id === undefined) {
                // generate id from a non-existing document
                item.id = doc(collection(this.firestore, 'tmp')).id;
            }
            return setDoc<T>(this.getDocRef(item.id), item);
        } catch (e: unknown) {
            return Promise.reject(e);
        }
    }

    public async delete(queryOptions: { id: string } | QueryOption<T> | QueryOption<T>[]): Promise<void> {
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
                querySnapshots.docs.map((result: QueryDocumentSnapshot<T>) => {
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
            return Promise.reject(e);
        }
    }

    public getWithValueChanges(id: string): Observable<T | undefined> {
        try {
            return docData<T>(this.getDocRef(id)).pipe(map((item: T | undefined) => item !== undefined ? instantiate(item, this.factory) : item));
        } catch (e: unknown) {
            throw e;
        }
    }

    public async list(queryOptions?: QueryOption<T> | QueryOption<T>[]): Promise<T[] | undefined> {
        try {
            const docSnaps = await getDocs<T>(this.createQuery(queryOptions));
            if (docSnaps.empty) {
                return Promise.resolve(undefined);
            }
            return Promise.resolve(docSnaps.docs.map((docSnap: DocumentSnapshot<T>) => instantiate(docSnap.data() as T, this.factory)));
        } catch (e: unknown) {
            return Promise.reject(e);
        }
    }

    public async paginate(options: PaginateOptions<T>): Promise<PaginateResult<T> | undefined>  {
        let queryArray: QueryOption<T>[] = [];
        if (options.queryOptions instanceof Array) {
            queryArray = options.queryOptions;
        } else {
            queryArray.push(options.queryOptions);
        }

        if (options.lastDocSnap !== undefined) {
            queryArray.push({ type: 'startAfter', snapshot: options.lastDocSnap });
        }
        queryArray.push({ limit: options.size });

        try {
            const docSnaps = await getDocs<T>(this.createQuery(queryArray));
            if (docSnaps.empty) {
                return Promise.resolve(undefined);
            }
            return Promise.resolve(
                {
                    items: docSnaps.docs.map((docSnap: DocumentSnapshot<T>) => instantiate(docSnap.data() as T, this.factory)),
                    lastDocSnap: docSnaps.docs[docSnaps.docs.length - 1]
                }
            );
        } catch (e: unknown) {
            return Promise.reject(e);
        }

    }

    public listWithValueChanges(queryOptions?: QueryOption<T> | QueryOption<T>[]): Observable<T[] | undefined> {
        try {
            return collectionData(this.createQuery(queryOptions)).pipe(map((items: T[] | undefined) => items?.map((item: T) => instantiate(item, this.factory))));
        } catch (e: unknown) {
            throw e;
        }
    }

    public async update(queryOptions: { id: string } | QueryOption<T> | QueryOption<T>[], data: Partial<T>): Promise<void> {
        try {
            if ('id' in queryOptions && queryOptions.id === 'undefined') {
                return Promise.reject(FirestoreBaseService.INVALID_ID_ERROR);
            }

            if ('id' in queryOptions) {
                return setDoc<T>(this.getDocRef(queryOptions.id), data, { merge: true });
            } else {
                const itemList = await this.list(queryOptions);
                itemList?.map((item: T) => item.id === undefined ? Promise.resolve()
                    : setDoc<T>(this.getDocRef(item.id), data, { merge: true }));
            }
        } catch (e: unknown) {
            return Promise.reject(e);
        }
    }
}
