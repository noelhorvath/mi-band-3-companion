import {AngularFirestore, AngularFirestoreCollection} from "@angular/fire/compat/firestore";
import {BaseFirestoreInterface} from "./base-firestore-interface";
import {Observable} from "rxjs";
import {IEntityModel} from "../../../shared/models/interfaces/IEntityModel";
import {map} from "rxjs/operators";
import {arrayUnion} from "@angular/fire/firestore";

export abstract class BaseFirestoreService<T extends IEntityModel<T>> implements BaseFirestoreInterface<T> {
    protected collection: AngularFirestoreCollection<T>;
    private readonly factory: { new(id?: string): T };

    protected constructor(protected firestore: AngularFirestore, collectionPath: string, factory: { new(id?: string): T } ) {
        this.factory = factory;
        this.collection = this.firestore.collection<T>(collectionPath);
    }

    public async add(item: T): Promise<void> {
        if (!item) { return; }
        if (item.id) {
            return this.collection.doc<T>(item.id).set(JSON.parse(JSON.stringify(item)));
        } else {
            const ref = this.collection.doc<T>().ref;
            item.id = ref.id;
            return ref.set(JSON.parse(JSON.stringify(item)));
        }
    }

    public async delete(id: string): Promise<void> {
        if (!id) { return; }
        return this.collection.doc<T>(id).delete();
    }

    public get(id: string): Observable<T | null> {
        if (!id) { return null; }
        return this.collection.doc<T>(id)
            .snapshotChanges()
            .pipe(map( doc => {
                if (!doc.payload.exists) { return null; }
                const item: T = new this.factory();
                item.copy(doc.payload.data() as T);
                return item;
            }));
    }

    public list(): Observable<T[] | null> {
        return this.collection.snapshotChanges().pipe(map( changes => {
            return changes.map( action => {
                if (!action.payload.doc.exists) { return null; }
                const item: T = new this.factory();
                item.copy(action.payload.doc.data() as T);
                return item;
            });
        }))
    }

    public async update(item: T): Promise<void> {
        if (!item.id || !item) { return; }
        return this.collection.doc(item.id).update(JSON.parse(JSON.stringify(item)));
    }

    public async updateField(id: string, fieldName: string, data: any, isArray: boolean = false, addToArray: boolean = false): Promise<void> {
        if (fieldName == null || id == null) { return; }
        const updateData = {};
        updateData[`${fieldName}`] = addToArray ? arrayUnion(JSON.parse(JSON.stringify(data))) : data;
        const ref = this.collection.doc(id).ref;
        return isArray ? ref.update(JSON.parse(JSON.stringify(updateData))) : ref.update(updateData);
    }

}
