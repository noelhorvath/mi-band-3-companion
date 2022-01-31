import {Component, OnDestroy, OnInit} from '@angular/core';
import {BleConnectionService} from "../../../../services/ble/connection/ble-connection.service";
import {Subscription} from "rxjs";
import {AuthService} from "../../../../services/firebase/auth/auth.service";
import {UserService} from "../../../../services/firebase/firestore/user/user.service";
import {BleDataService} from "../../../../services/ble/data/ble-data.service";
import {Device} from "../../../../shared/models/classes/Device";
import {User} from "../../../../shared/models/classes/User";
import {Activity} from "../../../../shared/models/classes/Activity";

@Component({
    selector: 'app-device',
    templateUrl: './device.component.html',
    styleUrls: ['./device.component.scss'],
})
export class DeviceComponent implements OnInit, OnDestroy {
    public connectedDevice: Device;
    public connectedDeviceSubscription: Subscription;
    public connectionStatus: string;
    public connectionStatusSubscription: Subscription;
    public userSubscription: Subscription;
    public user: User;
    public activitySubscription: Subscription;
    public activity: Activity;

    constructor(
        private bleConnectionService: BleConnectionService,
        private authService: AuthService,
        private userService: UserService,
        public bleDataService: BleDataService
    ) {
        this.connectedDeviceSubscription = this.bleConnectionService.connectedDeviceSubject.subscribe( device => {
            this.connectedDevice = device;
        });
        this.connectionStatusSubscription = this.bleConnectionService.connectionStatusSubject.subscribe( status => {
            this.connectionStatus = status;
        });
        this.activitySubscription = this.bleDataService.activitySubject.subscribe( activity => {
            this.activity = activity;
        })
        this.authService.isServiceInitializedSubject.subscribe( ready => {
            if (ready) {
                this.userSubscription = this.authService.authUserSubject.subscribe( aUser => {
                    this.userService.get(aUser.uid).toPromise()
                        .then( user => { this.user = user; })
                        .catch( e => console.error(DeviceComponent.name + " -> user sub: " + e));
                });
            }
        })
    }

    ngOnInit() { }

    ngOnDestroy() {
        if (this.connectedDeviceSubscription) { this.connectedDeviceSubscription.unsubscribe() }
        if (this.connectionStatusSubscription) { this.connectionStatusSubscription.unsubscribe() }
        if (this.userSubscription) { this.userSubscription.unsubscribe() }
        if (this.activitySubscription) { this.activitySubscription.unsubscribe() }
    }


}
