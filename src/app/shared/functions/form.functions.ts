import { FormControl, FormGroup } from '@angular/forms';

export const getFormControlFromFormGroup = (formGroup: FormGroup, formControlName: string): FormControl | null =>
    formGroup.get(formControlName) as FormControl;
