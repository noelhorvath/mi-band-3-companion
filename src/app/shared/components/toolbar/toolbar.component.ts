import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {TranslateService} from "../../../services/translate/translate.service";
import {IonSelect} from "@ionic/angular";

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
})
export class ToolbarComponent implements OnInit, OnDestroy {
  @ViewChild('languageSelect') languageSelect: IonSelect;
  @Input() type: string;
  @Input() showBackButton: boolean;
  @Output() switchTemplate: EventEmitter<any>;

  public isBackButtonEnabled: boolean;

  constructor(
    private translateService: TranslateService
  ) {
    this.switchTemplate = new EventEmitter<any>();
  }

  ngOnInit() {

  }

  ngOnDestroy() {
  }

  openLanguageSelect(event: any) {
    this.languageSelect.open(event).then(() => {
      this.languageSelect.value = this.translateService.getCurrentLanguage();
      const langSelectSubscription = this.languageSelect.ionChange.subscribe( () => {
        const lang = this.languageSelect.value;
        console.log(ToolbarComponent.name + " -> Selected language: " + lang);
        if (this.translateService.getCurrentLanguage() != lang) {
          this.translateService.changeLanguage(lang);
          langSelectSubscription.unsubscribe();
        }
      });
    });
  }

  goBack() {
    this.switchTemplate.emit(false);
  }
}
