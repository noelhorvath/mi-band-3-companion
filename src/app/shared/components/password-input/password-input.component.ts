import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
    selector: 'app-password-input',
    templateUrl: './password-input.component.html',
    styleUrls: ['./password-input.component.scss'],
})
export class PasswordInputComponent {
    public isPasswordHidden: boolean;
    public passwordInputIcon: 'eye-outline' | 'eye-off-outline';
    public passwordInputType: 'password' | 'text';
    @Input() public labelPosition: 'fixed'| 'floating' | 'stacked' | undefined;
    @Input() public inputLabel: string;
    @Input() public inputFormControl: FormControl | undefined;
    @Input() public clearInput: boolean;

    public constructor() {
        this.clearInput = true;
        this.isPasswordHidden = true;
        this.passwordInputType = 'password';
        this.inputLabel = this.passwordInputType.toUpperCase();
        this.passwordInputIcon = 'eye-off-outline';
    }

    public togglePasswordVisibility(): void {
        this.isPasswordHidden = !this.isPasswordHidden;
        this.passwordInputType = this.isPasswordHidden ? 'password' : 'text';
        this.passwordInputIcon = this.isPasswordHidden ? 'eye-outline' : 'eye-off-outline';
    }

}
