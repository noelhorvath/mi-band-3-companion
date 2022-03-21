import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { HomeTabBarComponent } from './home-tab-bar.component';

describe('HomeTabBarComponent', () => {
    let component: HomeTabBarComponent;
    let fixture: ComponentFixture<HomeTabBarComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [HomeTabBarComponent],
            imports: [IonicModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(HomeTabBarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
