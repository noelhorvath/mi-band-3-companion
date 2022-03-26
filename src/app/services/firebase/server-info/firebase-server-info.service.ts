import { Injectable } from '@angular/core';
import { Database, onValue, ref, DataSnapshot } from '@angular/fire/database';
import { FireTimestamp } from '../../../shared/models/classes/FireTimestamp';
import { LogHelper } from '../../../shared/models/classes/LogHelper';
import { BehaviorSubject } from 'rxjs';
import { NetworkStatus } from '../../../shared/types/custom.types';
import { FirebaseConnectionStatus, FirebaseErrorMessages } from '../../../shared/enums/firebase.enum';
import { doc, DocumentReference, Firestore, getDocFromServer, serverTimestamp, setDoc, updateDoc } from '@angular/fire/firestore';
import { IFireTimestamp } from '../../../shared/models/interfaces/IFireTimestamp';
import { instantiate } from '../../../shared/functions/parser.functions';
import { timeDifferenceInSeconds } from '../../../shared/functions/date.functions';

@Injectable({
    providedIn: 'root'
})
export class FirebaseServerInfoService {
    private readonly logHelper: LogHelper;
    private readonly serverTimeDocRef: DocumentReference;
    private isConnected: boolean;
    public connectionStatusSubject: BehaviorSubject<NetworkStatus>;

    public constructor(
        private firestore: Firestore,
        private database: Database)
    {
        this.logHelper = new LogHelper(FirebaseServerInfoService.name);
        this.isConnected = false;
        this.serverTimeDocRef = doc(this.firestore, 'info', 'serverTimestamp');
        this.connectionStatusSubject = new BehaviorSubject<NetworkStatus>(FirebaseConnectionStatus.OFFLINE);
        onValue(ref(this.database, '/.info/connected'), (snap: DataSnapshot) => {
            this.isConnected = snap.val();
            this.connectionStatusSubject.next(snap.val() ? FirebaseConnectionStatus.ONLINE : FirebaseConnectionStatus.OFFLINE);
            this.logHelper.logDefault('connectionStatusListener', 'is connected', { value: snap.val() });
        }, (error: Error) => this.logHelper.logError('connectionStatusListener', 'firebase connectionStatusListener error', { value: error }));
    }

    public async getServerTime(): Promise<FireTimestamp> {
        try {
            if (this.isConnected) {
                let docSnap = await getDocFromServer(this.serverTimeDocRef);
                if (docSnap.exists()) {
                    await updateDoc(this.serverTimeDocRef, { currentTime: serverTimestamp() });
                } else {
                    await setDoc(this.serverTimeDocRef, { currentTime: serverTimestamp() });
                }
                docSnap = await getDocFromServer(this.serverTimeDocRef);
                if (!docSnap.exists()) {
                    return Promise.reject('serverTimestamp document does not exist');
                }
                return instantiate((docSnap.data() as { currentTime: IFireTimestamp }).currentTime, FireTimestamp);
            } else {
                return Promise.reject(FirebaseErrorMessages.NETWORK_REQUEST_FAILED);
            }
        } catch (e: unknown) {
            throw e;
        }
    }

    public async timePassedSinceServerTimeInSeconds(timestamp: IFireTimestamp): Promise<number> {
        try {
            return timeDifferenceInSeconds(await this.getServerTime(), timestamp);
        } catch (e: unknown) {
            return Promise.reject(e);
        }
    }

}
