import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FirebaseAuthService } from '../../services/firebase/auth/firebase-auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from '../../services/message/message.service';
import { LogInfo } from '../../shared/models/classes/LogInfo';
import { first } from 'rxjs';
import { User } from '../../shared/models/classes/User';
import { LogHelper } from '../../shared/models/classes/LogHelper';
import { PickerButton, PickerColumn } from '@ionic/angular';
import { PickerService } from '../../services/picker/picker.service';
import { FireTimestamp } from '../../shared/models/classes/FireTimestamp';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
    private readonly logHelper: LogHelper;
    public readonly registrationFormGroup: FormGroup;
    private selectedGenderIndex: number;
    public datePickerMinValue: string;
    public datePickerMaxValue: string;
    public genderText: string | undefined;

    public constructor(
        private router: Router,
        private authService: FirebaseAuthService,
        private messageService: MessageService,
        private route: ActivatedRoute,
        private formBuilder: FormBuilder,
        private pickerService: PickerService
    ) {
        this.logHelper = new LogHelper(RegisterComponent.name);
        this.registrationFormGroup = this.formBuilder.group({
            firstName: ['', [Validators.required]],
            lastName: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.email]],
            gender: [null, [Validators.required]],
            birthDate: [null, [Validators.required]],
            weight: [60, [Validators.required]],
            height: [165, [Validators.required]],
            password: ['', [Validators.required, Validators.minLength(8)]],
            passwordAgain: ['', [Validators.required, Validators.minLength(8)]],
        });
        this.selectedGenderIndex = 0;
        this.datePickerMinValue = `${new Date().getFullYear() - 125}`;
        this.datePickerMaxValue = new Date().toISOString();
    }

    public ngOnInit(): void {
        this.route.params.pipe(first()).subscribe({
            next: (params: Params) => {
                this.registrationFormGroup.patchValue(
                    {
                        email: params['email'] ?? '',
                        password: params['password'] ?? '',
                        passwordAgain: params['password'] ?? ''
                    }
                );
            },
            error: (e: unknown) => {
                this.logHelper.logError('Get route parameters error', e);
            }
        });
    }

    public async register(): Promise<void> {
        try {
            if (this.registrationFormGroup.value.password === this.registrationFormGroup.value.passwordAgain) {
                await this.messageService.createLoading('CREATING_ACCOUNT_WITH_DOTS', 'circular', false, 0, true, true);
                const user = new User();
                user.email = this.registrationFormGroup.value.email;
                user.firstName = this.registrationFormGroup.value.firstName;
                user.lastName = this.registrationFormGroup.value.lastName;
                user.gender = this.registrationFormGroup.value.gender;
                const tmpDate = new Date(this.registrationFormGroup.value.birthDate);
                const birthDate = new Date(Date.UTC(tmpDate.getFullYear(), tmpDate.getMonth(), tmpDate.getDate(), 0, 0, 0, 0));
                user.birthDate = FireTimestamp.fromDate(birthDate);
                user.height = this.registrationFormGroup.value.height;
                user.weight = this.registrationFormGroup.value.weight;
                const tmpId: Uint32Array = Uint32Array.from([0x00000000]);
                crypto.getRandomValues(tmpId);
                user.bandUserId = tmpId[0];
                await this.authService.register(user, this.registrationFormGroup.value.password);
                await this.messageService.dismissLoading();
                await this.messageService.createAlert('REGISTRATION', 'SUCCESSFUL_REGISTRATION', true);
                await this.router.navigate(['/login', { email: this.registrationFormGroup.value.email, password: this.registrationFormGroup.value.password }], { replaceUrl: true });
            } else {
                return this.messageService.displayErrorMessage(new LogInfo(RegisterComponent.name, this.register.name, 'PASSWORDS_NOT_MATCHING'), 'toast', false, 5000, 'top');
            }
        } catch (e: unknown) {
            await this.messageService.dismissLoading();
            await this.messageService.displayErrorMessage(new LogInfo(RegisterComponent.name, this.register.name, e), 'toast', false, 5000, 'top');
        }
    }

    public resetForm(): void {
        this.registrationFormGroup.reset({
            firstName: '',
            lastName: '',
            email: '',
            gender: '',
            birthDate: '',
            weight: 60,
            height: 165,
            password: '',
            passwordAgain: '',
        });
        this.selectedGenderIndex = 0;
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
                                this.registrationFormGroup.value.gender = selected[type]?.value;
                                this.registrationFormGroup.patchValue({ gender: selected[type]?.value ?? '' });
                                if (typeof this.registrationFormGroup.value.gender === 'string') {
                                    this.genderText = this.registrationFormGroup.value.gender.toUpperCase();
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
}
