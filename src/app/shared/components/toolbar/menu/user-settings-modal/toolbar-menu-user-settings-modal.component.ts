import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { PickerButton, PickerColumn } from '@ionic/angular';
import { LogHelper } from '../../../../models/classes/LogHelper';
import { PickerService } from '../../../../../services/picker/picker.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FirestoreUserService } from '../../../../../services/firestore/user/firestore-user.service';
import { FirebaseAuthService } from '../../../../../services/firebase/auth/firebase-auth.service';
import { User } from '../../../../models/classes/User';
import { Subscription } from 'rxjs';
import { LogInfo } from '../../../../models/classes/LogInfo';
import { MessageService } from '../../../../../services/message/message.service';
import { FireTimestamp } from '../../../../models/classes/FireTimestamp';
import { ConnectionInfo } from '../../../../models/classes/ConnectionInfo';
import { BleDeviceSettingsService } from '../../../../../services/ble/device-settings/ble-device-settings.service';

@Component({
    selector: 'app-toolbar-menu-user-settings-modal',
    templateUrl: './toolbar-menu-user-settings-modal.component.html',
    styleUrls: ['./toolbar-menu-user-settings-modal.component.scss'],
})
export class ToolbarMenuUserSettingsModalComponent implements OnDestroy, OnChanges {
    private readonly logHelper: LogHelper;
    private selectedGenderIndex: number;
    private authUserSubscription: Subscription | undefined;
    private userSubscription: Subscription | undefined;
    public emailUpdateFormGroup: FormGroup;
    public profileUpdateForm: FormGroup;
    public genderText: string | undefined;
    public datePickerMinValue: string;
    public datePickerMaxValue: string;
    @Input() public connectionInfo: ConnectionInfo | undefined;
    @Input() public user: User | undefined;
    @Input() public triggerId: string;

    public constructor(
        private pickerService: PickerService,
        private formBuilder: FormBuilder,
        private userService: FirestoreUserService,
        private authService: FirebaseAuthService,
        private messageService: MessageService,
        private bleDeviceSettings: BleDeviceSettingsService
    ) {
        this.triggerId = 'user-settings-modal';
        this.logHelper = new LogHelper(ToolbarMenuUserSettingsModalComponent.name);
        this.emailUpdateFormGroup = this.formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
        });
        this.profileUpdateForm = this.formBuilder.group({
            firstName: ['', [Validators.required]],
            lastName: ['', [Validators.required]],
            gender: [null, [Validators.required]],
            birthDate: [null, [Validators.required]],
            weight: [60, [Validators.required]],
            height: [165, [Validators.required]],
        });
        this.selectedGenderIndex = 0;
        this.datePickerMinValue = `${new Date().getFullYear() - 125}`;
        this.datePickerMaxValue = new Date().toISOString();
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes['user'] !== undefined && this.user !== undefined) {
            const tmpDate = this.user.birthDate.toDate();
            const birthDate = new Date(Date.UTC(tmpDate.getFullYear(), tmpDate.getMonth(), tmpDate.getDate(), 0, 0, 0, 0)).toISOString();
            this.profileUpdateForm.patchValue({
                firstName: this.user.firstName,
                lastName: this.user.lastName,
                gender: this.user.gender,
                birthDate,
                weight: this.user.weight,
                height: this.user.height,
            });
            this.emailUpdateFormGroup.patchValue({ email: this.user.email });
            this.genderText = this.user.gender.toUpperCase();
            switch (this.user.gender) {
                case 'female':
                    this.selectedGenderIndex = 0;
                    break;
                case 'male':
                    this.selectedGenderIndex = 1;
                    break;
                default:
                    this.selectedGenderIndex = 2;
            }
        }
    }


    public resetEmailUpdateForm(): void {
        this.emailUpdateFormGroup.reset({ email: this.user?.email });
    }

    public async updateEmail(): Promise<void> {
        try {
            await this.messageService.createLoading('UPDATING_EMAIL_WITH_DOTS');
            await this.authService.updateUserEmail(this.emailUpdateFormGroup.value.email);
            await this.messageService.dismissLoading();
            return await this.messageService.createToast('ACCOUNT_SETTINGS', 'EMAIL_SUCCESSFULLY_UPDATED', 'top', 'success');
        } catch (e: unknown) {
            return await this.messageService.displayErrorMessage(new LogInfo(ToolbarMenuUserSettingsModalComponent.name, this.updateEmail.name, e), 'toast', true, 5000, 'top');
        }
    }

    public resetProfileUpdateForm(): void {
        this.profileUpdateForm.reset({
            firstName: this.user?.firstName ?? '',
            lastName: this.user?.lastName ?? '',
            gender: this.user?.gender ?? this.genderText?.toUpperCase(),
            birthDate: this.user?.birthDate.toDate().toISOString() ?? '',
            weight: this.user?.weight ?? 60,
            height: this.user?.height ?? 165,
        });
    }

    public async updateProfile(): Promise<void> {
        try {
            await this.messageService.createLoading('UPDATING_PROFILE_WITH_DOTS');
            const tmpDate = new Date(this.profileUpdateForm.value.birthDate);
            const birthDate = new Date(Date.UTC(tmpDate.getFullYear(), tmpDate.getMonth(), tmpDate.getDate(), 0, 0, 0, 0));
            await this.userService.update({ id: this.user?.id ?? 'unknown'},{
                firstName: this.profileUpdateForm.value.firstName,
                lastName: this.profileUpdateForm.value.lastName,
                gender: this.profileUpdateForm.value.gender,
                birthDate: FireTimestamp.fromDate(birthDate),
                weight: this.profileUpdateForm.value.weight,
                height: this.profileUpdateForm.value.height,
            });
            if (this.connectionInfo?.device !== undefined && this.user !== undefined) {
                await this.bleDeviceSettings.setUserInfo(this.connectionInfo.device, this.user);
            } else {
                this.logHelper.logDefault(this.updateProfile.name, 'failed to update band user settings', { value: this.connectionInfo });
            }
            await this.messageService.dismissLoading();
            return await this.messageService.createToast('ACCOUNT_SETTINGS', 'PROFILE_SUCCESSFULLY_UPDATED', 'top', 'success');
        } catch (e: unknown) {
            return await this.messageService.displayErrorMessage(new LogInfo(ToolbarMenuUserSettingsModalComponent.name, this.updateProfile.name, e), 'toast', true, 5000, 'top');
        }
    }

    public isProfileUpdateValid(): boolean {
        return this.profileUpdateForm.valid && (this.user?.gender !== this.profileUpdateForm.value.gender
            || this.user?.height !== this.profileUpdateForm.value.height
            || this.user?.weight !== this.profileUpdateForm.value.weight
            || this.user?.birthDate.toDate().toISOString() !== this.profileUpdateForm.value.birthDate
            || this.user?.firstName !== this.profileUpdateForm.value.firstName
            || this.user?.lastName !== this.profileUpdateForm.value.lastName);
    }

    public async showPicker(type: 'gender'): Promise<void> {
        try {
            const buttons: PickerButton[] = [
                {
                    text: 'CANCEL',
                    role: 'cancel'
                }
            ];
            const columns: PickerColumn[] = [];
            switch(type) {
                case 'gender':
                    columns.push(
                        {
                            name: type,
                            options: [
                                {
                                    text: 'FEMALE',
                                    value: 'female'
                                },
                                {
                                    text: 'MALE',
                                    value: 'male'
                                },
                                {
                                    text: 'OTHER',
                                    value: 'other',
                                }
                            ],
                            selectedIndex: this.selectedGenderIndex ?? 0
                        }
                    );
                    buttons.push(
                        {
                            text: 'CONFIRM',
                            handler: (selected: any): void =>
                            {
                                this.logHelper.logDefault(this.showPicker.name, 'picker selected option', { value: selected });
                                this.logHelper.logDefault(this.showPicker.name, 'picker selected value', { value: selected[type]?.value });
                                this.profileUpdateForm.value.gender = selected[type]?.value;
                                this.profileUpdateForm.patchValue({ gender: selected[type]?.value ?? '' });
                                if (typeof this.profileUpdateForm.value.gender === 'string') {
                                    this.genderText = this.profileUpdateForm.value.gender.toUpperCase();
                                }
                                this.pickerService.getColumn(type).then( (column: PickerColumn | undefined ) => {
                                    if (column !== undefined && column.selectedIndex) {
                                        this.selectedGenderIndex = column.selectedIndex;
                                    }
                                    this.logHelper.logDefault(this.showPicker.name, 'picker selected index', { value: column?.selectedIndex });
                                });
                            }
                        }
                    );
                    await this.pickerService.createPicker(columns, buttons);
                    break;
                default:
                    break;
            }
        } catch (e: unknown) {
            this.logHelper.logError(this.showPicker.name, e);
        }
    }

    public async sendPasswordChangeLink(): Promise<void> {
        try {
            await this.messageService.createLoading('SENDING_PASSWORD_CHANGE_LINK_WITH_DOTS');
            await this.authService.sendPasswordResetEmail(this.user?.email ?? 'unknown');
            this.logHelper.logDefault(this.sendPasswordChangeLink.name, 'Password change link has been sent');
            await this.messageService.dismissLoading();
            return await this.messageService.createToast('ACCOUNT_SETTINGS', 'PASSWORD_CHANGE_EMAIL_SENT', 'top', 'success');
        } catch (error: unknown) {
            return await this.messageService.displayErrorMessage(new LogInfo(ToolbarMenuUserSettingsModalComponent.name, this.sendPasswordChangeLink.name, error), 'toast', true, 5000, 'top');
        }
    }

    public ngOnDestroy(): void {
        this.authUserSubscription?.unsubscribe();
        this.userSubscription?.unsubscribe();
    }

    public isEmailUpdateValid(): boolean {
        return this.emailUpdateFormGroup.valid && this.user?.email !== this.emailUpdateFormGroup.value.email;
    }
}
