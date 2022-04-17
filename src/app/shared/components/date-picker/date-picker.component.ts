import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { LanguageService } from '../../../services/language/language.service';

@Component({
    selector: 'app-date-picker',
    templateUrl: './date-picker.component.html',
    styleUrls: ['./date-picker.component.scss'],
})
export class DatePickerComponent implements OnInit {
    public dateTimeLocale: string;
    @Input() public control: FormControl | undefined | null;
    @Input() public placeholderText: string;
    @Input() public dateDisplayFormat: string;
    @Input() public max: string | undefined;
    @Input() public min: string | undefined;
    @Input() public presentationMode: string;
    @Input() public pickerId: string;

    public constructor(private languageService: LanguageService) {
        this.placeholderText = 'SELECT';
        this.dateDisplayFormat = 'YYYY/MM/dd';
        this.presentationMode = 'date';
        this.pickerId = 'date-time-picker';
        this.dateTimeLocale = this.languageService.getCurrentLanguage() === 'en' ? 'en-US' : 'hu-HU';
    }

    public ngOnInit(): void {
        this.languageService.currentLanguageSubject.subscribe( (lang: string) => {
           if (lang === 'en') {
               this.dateTimeLocale = 'en-US';
           } else if (lang === 'hu') {
               this.dateTimeLocale = 'hu-HU';
           }
        });
    }
}
