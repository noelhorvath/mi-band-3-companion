import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {HeartRateComponent} from './heart-rate.component';

describe('HeartRateComponent', () => {
    let component: HeartRateComponent;
    let fixture: ComponentFixture<HeartRateComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [HeartRateComponent],
            imports: [IonicModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(HeartRateComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
