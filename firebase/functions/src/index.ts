/*
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { IActivity } from '../../../src/app/shared/models/interfaces/IActivity';

admin.initializeApp();
const firestore = admin.firestore();

export const onCreateActivity = functions.firestore
    .document('userData/{userId}/activity/{deviceId}')
    .onCreate( async (snap: functions.firestore.QueryDocumentSnapshot, context: functions.EventContext): Promise<void> => {
        try {
            const collectionRef = firestore.collection(`userData/${ context.params.userId }/activityData`);
            const querySnap = await collectionRef.where('measurementInfo.date', '==', snap.data().measurementInfo.date).limit(1).get();
            if (!querySnap.empty && querySnap.docs[0].exists) {
                const activity = snap.data() as IActivity;
                // existing activity data with synced activity
                await querySnap.docs[0].ref.update({
                    steps: activity.steps,
                    category: activity.category,
                    intensity: activity.intensity
                });
                // delete created synced activity
                await snap.ref.delete({ exists: true });
            }
        } catch (e: unknown) {
            console.error(onCreateActivity.name + ' error: ' + JSON.stringify(e));
        }
    });
*/
