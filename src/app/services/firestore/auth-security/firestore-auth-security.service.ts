import { Injectable } from '@angular/core';
import { FirestoreBaseService } from '../base/firestore-base.service';
import { AuthSecurity } from '../../../shared/models/classes/AuthSecurity';
import { Firestore } from '@angular/fire/firestore';
import { DeviceService } from '../../device/device.service';
import { LogHelper } from '../../../shared/models/classes/LogHelper';

@Injectable({
    providedIn: 'root'
})
export class FirestoreAuthSecurityService extends FirestoreBaseService<AuthSecurity> {
    public constructor(
        firestore: Firestore,
        private deviceService: DeviceService) {
        super(firestore, AuthSecurity);
        this.deviceService.getUUID()
            .then((uuid: string) => this.collectionPath = `security/${ uuid }/authentication`)
            .catch((e: unknown) => LogHelper.log(
                {
                    mainId: FirestoreAuthSecurityService.name,
                    secondaryId: this.deviceService.getUUID.name,
                    message: e,
                })
            );
    }
}
