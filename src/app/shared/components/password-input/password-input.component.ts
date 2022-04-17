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
    @Input() public labelText: string;
    @Input() public control: FormControl | undefined | null;
    @Input() public clearInput: boolean;

    public constructor() {
        this.clearInput = true;
        this.isPasswordHidden = true;
        this.passwordInputType = 'password';
        this.labelText = this.passwordInputType.toUpperCase();
        this.passwordInputIcon = 'eye-off-outline';
    }

    public togglePasswordVisibility(): void {
        this.isPasswordHidden = !this.isPasswordHidden;
        this.passwordInputType = this.isPasswordHidden ? 'password' : 'text';
        this.passwordInputIcon = this.isPasswordHidden ? 'eye-outline' : 'eye-off-outline';
    }

}
