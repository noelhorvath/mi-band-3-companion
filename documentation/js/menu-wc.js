'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">mi-band-3-companion documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                        <li class="link">
                            <a href="overview.html" data-type="chapter-link">
                                <span class="icon ion-ios-keypad"></span>Overview
                            </a>
                        </li>
                        <li class="link">
                            <a href="index.html" data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>README
                            </a>
                        </li>
                        <li class="link">
                            <a href="license.html"  data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>LICENSE
                            </a>
                        </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="properties.html" data-type="chapter-link">
                                        <span class="icon ion-ios-apps"></span>Properties
                                    </a>
                                </li>
                    </ul>
                </li>
                    <li class="chapter modules">
                        <a data-type="chapter-link" href="modules.html">
                            <div class="menu-toggler linked" data-toggle="collapse" ${ isNormalMode ?
                                'data-target="#modules-links"' : 'data-target="#xs-modules-links"' }>
                                <span class="icon ion-ios-archive"></span>
                                <span class="link-name">Modules</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                        </a>
                        <ul class="links collapse " ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/ActivityItemModule.html" data-type="entity-link" >ActivityItemModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-ActivityItemModule-e528c4c1a1cc16af651dd1fbd3e7f759fae690b2ca95fa798d682b7223fa92c682c9c8eb3f4d0927bdebc0ccad230fe3fbbce9f1aca0dcee62da37d38efb1306"' : 'data-target="#xs-components-links-module-ActivityItemModule-e528c4c1a1cc16af651dd1fbd3e7f759fae690b2ca95fa798d682b7223fa92c682c9c8eb3f4d0927bdebc0ccad230fe3fbbce9f1aca0dcee62da37d38efb1306"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-ActivityItemModule-e528c4c1a1cc16af651dd1fbd3e7f759fae690b2ca95fa798d682b7223fa92c682c9c8eb3f4d0927bdebc0ccad230fe3fbbce9f1aca0dcee62da37d38efb1306"' :
                                            'id="xs-components-links-module-ActivityItemModule-e528c4c1a1cc16af651dd1fbd3e7f759fae690b2ca95fa798d682b7223fa92c682c9c8eb3f4d0927bdebc0ccad230fe3fbbce9f1aca0dcee62da37d38efb1306"' }>
                                            <li class="link">
                                                <a href="components/ActivityItemComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ActivityItemComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/ActivityModule.html" data-type="entity-link" >ActivityModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-ActivityModule-55924c1215746cc7955c121a950c2fc6d4c180b035b35f3fab50d0001b656f6f8c8b9c5b6639e746f4c1a85e15258625261be5c7f313d91ab41fa7c6f31052ad"' : 'data-target="#xs-components-links-module-ActivityModule-55924c1215746cc7955c121a950c2fc6d4c180b035b35f3fab50d0001b656f6f8c8b9c5b6639e746f4c1a85e15258625261be5c7f313d91ab41fa7c6f31052ad"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-ActivityModule-55924c1215746cc7955c121a950c2fc6d4c180b035b35f3fab50d0001b656f6f8c8b9c5b6639e746f4c1a85e15258625261be5c7f313d91ab41fa7c6f31052ad"' :
                                            'id="xs-components-links-module-ActivityModule-55924c1215746cc7955c121a950c2fc6d4c180b035b35f3fab50d0001b656f6f8c8b9c5b6639e746f4c1a85e15258625261be5c7f313d91ab41fa7c6f31052ad"' }>
                                            <li class="link">
                                                <a href="components/ActivityComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ActivityComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/ActivityRoutingModule.html" data-type="entity-link" >ActivityRoutingModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/AppModule.html" data-type="entity-link" >AppModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-AppModule-b4d79cdd5e94b7059df25297cba2197eefed22ec7c70dc3c78e1b32a0552fae818496101a42c55a7ee8f3be65c35069a0fd6d7cf29825b3dd56fd75767b4b704"' : 'data-target="#xs-components-links-module-AppModule-b4d79cdd5e94b7059df25297cba2197eefed22ec7c70dc3c78e1b32a0552fae818496101a42c55a7ee8f3be65c35069a0fd6d7cf29825b3dd56fd75767b4b704"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-AppModule-b4d79cdd5e94b7059df25297cba2197eefed22ec7c70dc3c78e1b32a0552fae818496101a42c55a7ee8f3be65c35069a0fd6d7cf29825b3dd56fd75767b4b704"' :
                                            'id="xs-components-links-module-AppModule-b4d79cdd5e94b7059df25297cba2197eefed22ec7c70dc3c78e1b32a0552fae818496101a42c55a7ee8f3be65c35069a0fd6d7cf29825b3dd56fd75767b4b704"' }>
                                            <li class="link">
                                                <a href="components/AppComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AppComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#injectables-links-module-AppModule-b4d79cdd5e94b7059df25297cba2197eefed22ec7c70dc3c78e1b32a0552fae818496101a42c55a7ee8f3be65c35069a0fd6d7cf29825b3dd56fd75767b4b704"' : 'data-target="#xs-injectables-links-module-AppModule-b4d79cdd5e94b7059df25297cba2197eefed22ec7c70dc3c78e1b32a0552fae818496101a42c55a7ee8f3be65c35069a0fd6d7cf29825b3dd56fd75767b4b704"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AppModule-b4d79cdd5e94b7059df25297cba2197eefed22ec7c70dc3c78e1b32a0552fae818496101a42c55a7ee8f3be65c35069a0fd6d7cf29825b3dd56fd75767b4b704"' :
                                        'id="xs-injectables-links-module-AppModule-b4d79cdd5e94b7059df25297cba2197eefed22ec7c70dc3c78e1b32a0552fae818496101a42c55a7ee8f3be65c35069a0fd6d7cf29825b3dd56fd75767b4b704"' }>
                                        <li class="link">
                                            <a href="injectables/BleConnectionService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >BleConnectionService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/BleDataService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >BleDataService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/BleDeviceSettingsService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >BleDeviceSettingsService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/FirebaseAuthService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FirebaseAuthService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/FirebaseServerInfoService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FirebaseServerInfoService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/FirestoreActivityService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FirestoreActivityService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/FirestoreUserService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FirestoreUserService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/LanguageService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >LanguageService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/MessageService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MessageService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/PermissionService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PermissionService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/PickerService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PickerService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/StorageService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >StorageService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/AppRoutingModule.html" data-type="entity-link" >AppRoutingModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/CustomChartModule.html" data-type="entity-link" >CustomChartModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-CustomChartModule-1fc2eb804d7d75b6e9b2991fbd5ad3586583f419cceb71cb814706d63be217dd153324e026bfebe522acd32fe2763ac9897d16ff215896ce0effbd772e12ea94"' : 'data-target="#xs-components-links-module-CustomChartModule-1fc2eb804d7d75b6e9b2991fbd5ad3586583f419cceb71cb814706d63be217dd153324e026bfebe522acd32fe2763ac9897d16ff215896ce0effbd772e12ea94"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-CustomChartModule-1fc2eb804d7d75b6e9b2991fbd5ad3586583f419cceb71cb814706d63be217dd153324e026bfebe522acd32fe2763ac9897d16ff215896ce0effbd772e12ea94"' :
                                            'id="xs-components-links-module-CustomChartModule-1fc2eb804d7d75b6e9b2991fbd5ad3586583f419cceb71cb814706d63be217dd153324e026bfebe522acd32fe2763ac9897d16ff215896ce0effbd772e12ea94"' }>
                                            <li class="link">
                                                <a href="components/CustomChartComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CustomChartComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/DataChartModule.html" data-type="entity-link" >DataChartModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-DataChartModule-f73e63361bea1ffb22c312f4a0caf1f7bdd5be393dc52b0533036457c93fdc782c933ae68d76c9a0258392da36f48a7792d3664200f63578e71ffa13dd8260dc"' : 'data-target="#xs-components-links-module-DataChartModule-f73e63361bea1ffb22c312f4a0caf1f7bdd5be393dc52b0533036457c93fdc782c933ae68d76c9a0258392da36f48a7792d3664200f63578e71ffa13dd8260dc"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-DataChartModule-f73e63361bea1ffb22c312f4a0caf1f7bdd5be393dc52b0533036457c93fdc782c933ae68d76c9a0258392da36f48a7792d3664200f63578e71ffa13dd8260dc"' :
                                            'id="xs-components-links-module-DataChartModule-f73e63361bea1ffb22c312f4a0caf1f7bdd5be393dc52b0533036457c93fdc782c933ae68d76c9a0258392da36f48a7792d3664200f63578e71ffa13dd8260dc"' }>
                                            <li class="link">
                                                <a href="components/DataChartComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DataChartComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/DatePickerModule.html" data-type="entity-link" >DatePickerModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-DatePickerModule-89915de0f9f9682d807ef9c8046169dea4d420f8a7f47e6ff65114f561a885638ccad7f304acf0b2c534cbe8856d4191e340d96e71a3175754737ebd3476f6c9"' : 'data-target="#xs-components-links-module-DatePickerModule-89915de0f9f9682d807ef9c8046169dea4d420f8a7f47e6ff65114f561a885638ccad7f304acf0b2c534cbe8856d4191e340d96e71a3175754737ebd3476f6c9"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-DatePickerModule-89915de0f9f9682d807ef9c8046169dea4d420f8a7f47e6ff65114f561a885638ccad7f304acf0b2c534cbe8856d4191e340d96e71a3175754737ebd3476f6c9"' :
                                            'id="xs-components-links-module-DatePickerModule-89915de0f9f9682d807ef9c8046169dea4d420f8a7f47e6ff65114f561a885638ccad7f304acf0b2c534cbe8856d4191e340d96e71a3175754737ebd3476f6c9"' }>
                                            <li class="link">
                                                <a href="components/DatePickerComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DatePickerComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/DeviceModule.html" data-type="entity-link" >DeviceModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-DeviceModule-00cea83fe1d46df5e090bf3257b16c955320990bdc52fb2d5c1836045677832cc77d54a61ae0124d44983d53ceb19b391758c4be7724bc36f19eb7bbbe0056b8"' : 'data-target="#xs-components-links-module-DeviceModule-00cea83fe1d46df5e090bf3257b16c955320990bdc52fb2d5c1836045677832cc77d54a61ae0124d44983d53ceb19b391758c4be7724bc36f19eb7bbbe0056b8"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-DeviceModule-00cea83fe1d46df5e090bf3257b16c955320990bdc52fb2d5c1836045677832cc77d54a61ae0124d44983d53ceb19b391758c4be7724bc36f19eb7bbbe0056b8"' :
                                            'id="xs-components-links-module-DeviceModule-00cea83fe1d46df5e090bf3257b16c955320990bdc52fb2d5c1836045677832cc77d54a61ae0124d44983d53ceb19b391758c4be7724bc36f19eb7bbbe0056b8"' }>
                                            <li class="link">
                                                <a href="components/DeviceComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DeviceComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/DeviceRoutingModule.html" data-type="entity-link" >DeviceRoutingModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/DeviceSetupModule.html" data-type="entity-link" >DeviceSetupModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-DeviceSetupModule-7769f988d6b46783fb64a97688ae473d5917f5de5ee396bfbb4eb371b2bce1b41e510cf424cc8bc52f85a3d50e55e2136d6e5fb900be9f53db3dce33590cc8cb"' : 'data-target="#xs-components-links-module-DeviceSetupModule-7769f988d6b46783fb64a97688ae473d5917f5de5ee396bfbb4eb371b2bce1b41e510cf424cc8bc52f85a3d50e55e2136d6e5fb900be9f53db3dce33590cc8cb"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-DeviceSetupModule-7769f988d6b46783fb64a97688ae473d5917f5de5ee396bfbb4eb371b2bce1b41e510cf424cc8bc52f85a3d50e55e2136d6e5fb900be9f53db3dce33590cc8cb"' :
                                            'id="xs-components-links-module-DeviceSetupModule-7769f988d6b46783fb64a97688ae473d5917f5de5ee396bfbb4eb371b2bce1b41e510cf424cc8bc52f85a3d50e55e2136d6e5fb900be9f53db3dce33590cc8cb"' }>
                                            <li class="link">
                                                <a href="components/DeviceSetupComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DeviceSetupComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/DeviceSetupRoutingModule.html" data-type="entity-link" >DeviceSetupRoutingModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/HeartRateItemModule.html" data-type="entity-link" >HeartRateItemModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-HeartRateItemModule-517c17aeadcb851a28e251c80fb5c69fe8a275dd5b40ca9f79a4b819f2237a58d99f907615d7aafdf99e860f19e9574d00e294cbfad492318f6c27e4478dedf2"' : 'data-target="#xs-components-links-module-HeartRateItemModule-517c17aeadcb851a28e251c80fb5c69fe8a275dd5b40ca9f79a4b819f2237a58d99f907615d7aafdf99e860f19e9574d00e294cbfad492318f6c27e4478dedf2"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-HeartRateItemModule-517c17aeadcb851a28e251c80fb5c69fe8a275dd5b40ca9f79a4b819f2237a58d99f907615d7aafdf99e860f19e9574d00e294cbfad492318f6c27e4478dedf2"' :
                                            'id="xs-components-links-module-HeartRateItemModule-517c17aeadcb851a28e251c80fb5c69fe8a275dd5b40ca9f79a4b819f2237a58d99f907615d7aafdf99e860f19e9574d00e294cbfad492318f6c27e4478dedf2"' }>
                                            <li class="link">
                                                <a href="components/HeartRateItemComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >HeartRateItemComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/HeartRateModule.html" data-type="entity-link" >HeartRateModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-HeartRateModule-22513da21cb060cae0e1c52708814ab5a19a9b2222da88dc67a8fd3a0dd7467809ba52e5b8972b23a52ebbe30fc6fb6397af1683a5bae5ab5399ce9db90ef16a"' : 'data-target="#xs-components-links-module-HeartRateModule-22513da21cb060cae0e1c52708814ab5a19a9b2222da88dc67a8fd3a0dd7467809ba52e5b8972b23a52ebbe30fc6fb6397af1683a5bae5ab5399ce9db90ef16a"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-HeartRateModule-22513da21cb060cae0e1c52708814ab5a19a9b2222da88dc67a8fd3a0dd7467809ba52e5b8972b23a52ebbe30fc6fb6397af1683a5bae5ab5399ce9db90ef16a"' :
                                            'id="xs-components-links-module-HeartRateModule-22513da21cb060cae0e1c52708814ab5a19a9b2222da88dc67a8fd3a0dd7467809ba52e5b8972b23a52ebbe30fc6fb6397af1683a5bae5ab5399ce9db90ef16a"' }>
                                            <li class="link">
                                                <a href="components/HeartRateComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >HeartRateComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/HeartRateRoutingModule.html" data-type="entity-link" >HeartRateRoutingModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/HomeModule.html" data-type="entity-link" >HomeModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-HomeModule-18d5c1bfc5f7893165f9a887eccb7d5cffd46b9dd7020af73c76f80e59a96f82791d9bfae9b82a5383b976bf2b61ebb5668322cb4f64fe4b4a22c7b35696b9e6"' : 'data-target="#xs-components-links-module-HomeModule-18d5c1bfc5f7893165f9a887eccb7d5cffd46b9dd7020af73c76f80e59a96f82791d9bfae9b82a5383b976bf2b61ebb5668322cb4f64fe4b4a22c7b35696b9e6"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-HomeModule-18d5c1bfc5f7893165f9a887eccb7d5cffd46b9dd7020af73c76f80e59a96f82791d9bfae9b82a5383b976bf2b61ebb5668322cb4f64fe4b4a22c7b35696b9e6"' :
                                            'id="xs-components-links-module-HomeModule-18d5c1bfc5f7893165f9a887eccb7d5cffd46b9dd7020af73c76f80e59a96f82791d9bfae9b82a5383b976bf2b61ebb5668322cb4f64fe4b4a22c7b35696b9e6"' }>
                                            <li class="link">
                                                <a href="components/HomeComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >HomeComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/HomeRoutingModule.html" data-type="entity-link" >HomeRoutingModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/HomeTabBarModule.html" data-type="entity-link" >HomeTabBarModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-HomeTabBarModule-5ac9faac6d8c02999e1231c70f7293b3d5a8c3822793e32301ccf35605054259126df35ce01a8138baf3e8091b39bb9605cb685e671ebf155aa5bb68974da8ab"' : 'data-target="#xs-components-links-module-HomeTabBarModule-5ac9faac6d8c02999e1231c70f7293b3d5a8c3822793e32301ccf35605054259126df35ce01a8138baf3e8091b39bb9605cb685e671ebf155aa5bb68974da8ab"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-HomeTabBarModule-5ac9faac6d8c02999e1231c70f7293b3d5a8c3822793e32301ccf35605054259126df35ce01a8138baf3e8091b39bb9605cb685e671ebf155aa5bb68974da8ab"' :
                                            'id="xs-components-links-module-HomeTabBarModule-5ac9faac6d8c02999e1231c70f7293b3d5a8c3822793e32301ccf35605054259126df35ce01a8138baf3e8091b39bb9605cb685e671ebf155aa5bb68974da8ab"' }>
                                            <li class="link">
                                                <a href="components/HomeTabBarComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >HomeTabBarComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/ItemsFilterModule.html" data-type="entity-link" >ItemsFilterModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-ItemsFilterModule-2c42e8ebb4a14dc533ea1d19e6a1316f4fda49333fcda769756746f5e01cf387263b2de37176b2c6aeaeec5b6ae1de843d44b86bf792582c15f3b0c2e0556d43"' : 'data-target="#xs-components-links-module-ItemsFilterModule-2c42e8ebb4a14dc533ea1d19e6a1316f4fda49333fcda769756746f5e01cf387263b2de37176b2c6aeaeec5b6ae1de843d44b86bf792582c15f3b0c2e0556d43"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-ItemsFilterModule-2c42e8ebb4a14dc533ea1d19e6a1316f4fda49333fcda769756746f5e01cf387263b2de37176b2c6aeaeec5b6ae1de843d44b86bf792582c15f3b0c2e0556d43"' :
                                            'id="xs-components-links-module-ItemsFilterModule-2c42e8ebb4a14dc533ea1d19e6a1316f4fda49333fcda769756746f5e01cf387263b2de37176b2c6aeaeec5b6ae1de843d44b86bf792582c15f3b0c2e0556d43"' }>
                                            <li class="link">
                                                <a href="components/ItemsFilterComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ItemsFilterComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/LoginModule.html" data-type="entity-link" >LoginModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-LoginModule-868205cf8633d910f2f24543ac1fb4eaecbfb4f5c6391ab98eb0eceebde05d1fae37683dae427ba2d6784381064588c0b629cfc065f4e6e26ac20193eae53443"' : 'data-target="#xs-components-links-module-LoginModule-868205cf8633d910f2f24543ac1fb4eaecbfb4f5c6391ab98eb0eceebde05d1fae37683dae427ba2d6784381064588c0b629cfc065f4e6e26ac20193eae53443"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-LoginModule-868205cf8633d910f2f24543ac1fb4eaecbfb4f5c6391ab98eb0eceebde05d1fae37683dae427ba2d6784381064588c0b629cfc065f4e6e26ac20193eae53443"' :
                                            'id="xs-components-links-module-LoginModule-868205cf8633d910f2f24543ac1fb4eaecbfb4f5c6391ab98eb0eceebde05d1fae37683dae427ba2d6784381064588c0b629cfc065f4e6e26ac20193eae53443"' }>
                                            <li class="link">
                                                <a href="components/LoginComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >LoginComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/LoginRoutingModule.html" data-type="entity-link" >LoginRoutingModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/PasswordInputModule.html" data-type="entity-link" >PasswordInputModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-PasswordInputModule-984c286d32b120460102962e6a5b1ecfa2f38e89453d979969d48cb01957d1ad8023984487291811dced1d37e7c2647a716d2fba41fc96a76b4f35c8a806473a"' : 'data-target="#xs-components-links-module-PasswordInputModule-984c286d32b120460102962e6a5b1ecfa2f38e89453d979969d48cb01957d1ad8023984487291811dced1d37e7c2647a716d2fba41fc96a76b4f35c8a806473a"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-PasswordInputModule-984c286d32b120460102962e6a5b1ecfa2f38e89453d979969d48cb01957d1ad8023984487291811dced1d37e7c2647a716d2fba41fc96a76b4f35c8a806473a"' :
                                            'id="xs-components-links-module-PasswordInputModule-984c286d32b120460102962e6a5b1ecfa2f38e89453d979969d48cb01957d1ad8023984487291811dced1d37e7c2647a716d2fba41fc96a76b4f35c8a806473a"' }>
                                            <li class="link">
                                                <a href="components/PasswordInputComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PasswordInputComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/RangeItemModule.html" data-type="entity-link" >RangeItemModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-RangeItemModule-637bd9df5b829223e9e351d1eab936bb7f0aa27bff3b230e9b3b0ee35753e0d6ad6346a8ec9ad3802b25db5057cca6fb1e7b5c36a866872c63c66f72ae251de2"' : 'data-target="#xs-components-links-module-RangeItemModule-637bd9df5b829223e9e351d1eab936bb7f0aa27bff3b230e9b3b0ee35753e0d6ad6346a8ec9ad3802b25db5057cca6fb1e7b5c36a866872c63c66f72ae251de2"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-RangeItemModule-637bd9df5b829223e9e351d1eab936bb7f0aa27bff3b230e9b3b0ee35753e0d6ad6346a8ec9ad3802b25db5057cca6fb1e7b5c36a866872c63c66f72ae251de2"' :
                                            'id="xs-components-links-module-RangeItemModule-637bd9df5b829223e9e351d1eab936bb7f0aa27bff3b230e9b3b0ee35753e0d6ad6346a8ec9ad3802b25db5057cca6fb1e7b5c36a866872c63c66f72ae251de2"' }>
                                            <li class="link">
                                                <a href="components/RangeItemComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >RangeItemComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/RegisterModule.html" data-type="entity-link" >RegisterModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-RegisterModule-e80a617fd76a3c72ab1427cd0f4a28021771bd3c54c5a084a6a5b5f98364327179ffe576cf74b77080c6739e6db52dfe5fa0af4648fee100a2e6ee39c7bdb190"' : 'data-target="#xs-components-links-module-RegisterModule-e80a617fd76a3c72ab1427cd0f4a28021771bd3c54c5a084a6a5b5f98364327179ffe576cf74b77080c6739e6db52dfe5fa0af4648fee100a2e6ee39c7bdb190"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-RegisterModule-e80a617fd76a3c72ab1427cd0f4a28021771bd3c54c5a084a6a5b5f98364327179ffe576cf74b77080c6739e6db52dfe5fa0af4648fee100a2e6ee39c7bdb190"' :
                                            'id="xs-components-links-module-RegisterModule-e80a617fd76a3c72ab1427cd0f4a28021771bd3c54c5a084a6a5b5f98364327179ffe576cf74b77080c6739e6db52dfe5fa0af4648fee100a2e6ee39c7bdb190"' }>
                                            <li class="link">
                                                <a href="components/RegisterComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >RegisterComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/RegisterRoutingModule.html" data-type="entity-link" >RegisterRoutingModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/ResetPasswordModule.html" data-type="entity-link" >ResetPasswordModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-ResetPasswordModule-73a0282d0677fdbf32b5ae3b099ee1c55da8eb20273acbf7a73ce071373a8e574b5af9e3f9545a3c937f05a3ad39077b12cbedfc710572e8d82944c51ab9fd5f"' : 'data-target="#xs-components-links-module-ResetPasswordModule-73a0282d0677fdbf32b5ae3b099ee1c55da8eb20273acbf7a73ce071373a8e574b5af9e3f9545a3c937f05a3ad39077b12cbedfc710572e8d82944c51ab9fd5f"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-ResetPasswordModule-73a0282d0677fdbf32b5ae3b099ee1c55da8eb20273acbf7a73ce071373a8e574b5af9e3f9545a3c937f05a3ad39077b12cbedfc710572e8d82944c51ab9fd5f"' :
                                            'id="xs-components-links-module-ResetPasswordModule-73a0282d0677fdbf32b5ae3b099ee1c55da8eb20273acbf7a73ce071373a8e574b5af9e3f9545a3c937f05a3ad39077b12cbedfc710572e8d82944c51ab9fd5f"' }>
                                            <li class="link">
                                                <a href="components/ResetPasswordComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ResetPasswordComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/ResetPasswordRoutingModule.html" data-type="entity-link" >ResetPasswordRoutingModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/ScannedDeviceItemModule.html" data-type="entity-link" >ScannedDeviceItemModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-ScannedDeviceItemModule-8eec4577d7481e9da875fcd7e8b41999e99c35a99f195ce3e12182df5543f7c454056b1b91d476cb6c2c1e45c6da72c53ab708bfc62ce0bab5136f55311e8ef9"' : 'data-target="#xs-components-links-module-ScannedDeviceItemModule-8eec4577d7481e9da875fcd7e8b41999e99c35a99f195ce3e12182df5543f7c454056b1b91d476cb6c2c1e45c6da72c53ab708bfc62ce0bab5136f55311e8ef9"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-ScannedDeviceItemModule-8eec4577d7481e9da875fcd7e8b41999e99c35a99f195ce3e12182df5543f7c454056b1b91d476cb6c2c1e45c6da72c53ab708bfc62ce0bab5136f55311e8ef9"' :
                                            'id="xs-components-links-module-ScannedDeviceItemModule-8eec4577d7481e9da875fcd7e8b41999e99c35a99f195ce3e12182df5543f7c454056b1b91d476cb6c2c1e45c6da72c53ab708bfc62ce0bab5136f55311e8ef9"' }>
                                            <li class="link">
                                                <a href="components/ScannedDeviceItemComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ScannedDeviceItemComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/ToolbarLanguageSelectModule.html" data-type="entity-link" >ToolbarLanguageSelectModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-ToolbarLanguageSelectModule-3bdbeb252820cfbd0a82ab36290d2ed8754d6cce99c7471fadecbefbc997e844b4315a7735ae2d2d7747df309d45bd0e9bca50af1e18357dcd552707757c8239"' : 'data-target="#xs-components-links-module-ToolbarLanguageSelectModule-3bdbeb252820cfbd0a82ab36290d2ed8754d6cce99c7471fadecbefbc997e844b4315a7735ae2d2d7747df309d45bd0e9bca50af1e18357dcd552707757c8239"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-ToolbarLanguageSelectModule-3bdbeb252820cfbd0a82ab36290d2ed8754d6cce99c7471fadecbefbc997e844b4315a7735ae2d2d7747df309d45bd0e9bca50af1e18357dcd552707757c8239"' :
                                            'id="xs-components-links-module-ToolbarLanguageSelectModule-3bdbeb252820cfbd0a82ab36290d2ed8754d6cce99c7471fadecbefbc997e844b4315a7735ae2d2d7747df309d45bd0e9bca50af1e18357dcd552707757c8239"' }>
                                            <li class="link">
                                                <a href="components/ToolbarLanguageSelectComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ToolbarLanguageSelectComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/ToolbarMenuDeviceSettingsModalModule.html" data-type="entity-link" >ToolbarMenuDeviceSettingsModalModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-ToolbarMenuDeviceSettingsModalModule-bc6bf32a2973013b7b5e097c09a2743333e0c1d289188835d3427183dae64868225fff6fdb98824e6ba87f27d8079fd45ebfb088dc6d0d449d41555aeba373d2"' : 'data-target="#xs-components-links-module-ToolbarMenuDeviceSettingsModalModule-bc6bf32a2973013b7b5e097c09a2743333e0c1d289188835d3427183dae64868225fff6fdb98824e6ba87f27d8079fd45ebfb088dc6d0d449d41555aeba373d2"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-ToolbarMenuDeviceSettingsModalModule-bc6bf32a2973013b7b5e097c09a2743333e0c1d289188835d3427183dae64868225fff6fdb98824e6ba87f27d8079fd45ebfb088dc6d0d449d41555aeba373d2"' :
                                            'id="xs-components-links-module-ToolbarMenuDeviceSettingsModalModule-bc6bf32a2973013b7b5e097c09a2743333e0c1d289188835d3427183dae64868225fff6fdb98824e6ba87f27d8079fd45ebfb088dc6d0d449d41555aeba373d2"' }>
                                            <li class="link">
                                                <a href="components/ToolbarMenuDeviceSettingsModalComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ToolbarMenuDeviceSettingsModalComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/ToolbarMenuModule.html" data-type="entity-link" >ToolbarMenuModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-ToolbarMenuModule-2fed50dfb6887b8d07542e03cc27f2f5bc0159ab3c547a374727cb8810bea96924bf5b7cf7bb59387c51f3104ddb0495a01ce7a6fdb0401379b94ec80e87afa9"' : 'data-target="#xs-components-links-module-ToolbarMenuModule-2fed50dfb6887b8d07542e03cc27f2f5bc0159ab3c547a374727cb8810bea96924bf5b7cf7bb59387c51f3104ddb0495a01ce7a6fdb0401379b94ec80e87afa9"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-ToolbarMenuModule-2fed50dfb6887b8d07542e03cc27f2f5bc0159ab3c547a374727cb8810bea96924bf5b7cf7bb59387c51f3104ddb0495a01ce7a6fdb0401379b94ec80e87afa9"' :
                                            'id="xs-components-links-module-ToolbarMenuModule-2fed50dfb6887b8d07542e03cc27f2f5bc0159ab3c547a374727cb8810bea96924bf5b7cf7bb59387c51f3104ddb0495a01ce7a6fdb0401379b94ec80e87afa9"' }>
                                            <li class="link">
                                                <a href="components/ToolbarMenuComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ToolbarMenuComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/ToolbarMenuUserSettingsModalModule.html" data-type="entity-link" >ToolbarMenuUserSettingsModalModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-ToolbarMenuUserSettingsModalModule-e31dca1c5268bb69a2f25de3bff587eb1ade9ab69a22d9e1bf6936091673a279aec2e4dc6e66d26344dd1ebcb5cee49c74889b39dd9d71bbc79207533a1ab9ff"' : 'data-target="#xs-components-links-module-ToolbarMenuUserSettingsModalModule-e31dca1c5268bb69a2f25de3bff587eb1ade9ab69a22d9e1bf6936091673a279aec2e4dc6e66d26344dd1ebcb5cee49c74889b39dd9d71bbc79207533a1ab9ff"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-ToolbarMenuUserSettingsModalModule-e31dca1c5268bb69a2f25de3bff587eb1ade9ab69a22d9e1bf6936091673a279aec2e4dc6e66d26344dd1ebcb5cee49c74889b39dd9d71bbc79207533a1ab9ff"' :
                                            'id="xs-components-links-module-ToolbarMenuUserSettingsModalModule-e31dca1c5268bb69a2f25de3bff587eb1ade9ab69a22d9e1bf6936091673a279aec2e4dc6e66d26344dd1ebcb5cee49c74889b39dd9d71bbc79207533a1ab9ff"' }>
                                            <li class="link">
                                                <a href="components/ToolbarMenuUserSettingsModalComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ToolbarMenuUserSettingsModalComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/ToolbarModule.html" data-type="entity-link" >ToolbarModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-ToolbarModule-91dc2b4f190c96063f137d9bdd126946d828e9227f65fd5e589f60fbc8651a6e301ef2e3b8e4d42f57af4dd21b14ffc5c916db5adc222e8b07b7bc6bee5c8e69"' : 'data-target="#xs-components-links-module-ToolbarModule-91dc2b4f190c96063f137d9bdd126946d828e9227f65fd5e589f60fbc8651a6e301ef2e3b8e4d42f57af4dd21b14ffc5c916db5adc222e8b07b7bc6bee5c8e69"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-ToolbarModule-91dc2b4f190c96063f137d9bdd126946d828e9227f65fd5e589f60fbc8651a6e301ef2e3b8e4d42f57af4dd21b14ffc5c916db5adc222e8b07b7bc6bee5c8e69"' :
                                            'id="xs-components-links-module-ToolbarModule-91dc2b4f190c96063f137d9bdd126946d828e9227f65fd5e589f60fbc8651a6e301ef2e3b8e4d42f57af4dd21b14ffc5c916db5adc222e8b07b7bc6bee5c8e69"' }>
                                            <li class="link">
                                                <a href="components/ToolbarComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ToolbarComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                </ul>
                </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#classes-links"' :
                            'data-target="#xs-classes-links"' }>
                            <span class="icon ion-ios-paper"></span>
                            <span>Classes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                            <li class="link">
                                <a href="classes/Activity.html" data-type="entity-link" >Activity</a>
                            </li>
                            <li class="link">
                                <a href="classes/ActivityInfo.html" data-type="entity-link" >ActivityInfo</a>
                            </li>
                            <li class="link">
                                <a href="classes/AppPage.html" data-type="entity-link" >AppPage</a>
                            </li>
                            <li class="link">
                                <a href="classes/AuthSecurity.html" data-type="entity-link" >AuthSecurity</a>
                            </li>
                            <li class="link">
                                <a href="classes/BatteryInfo.html" data-type="entity-link" >BatteryInfo</a>
                            </li>
                            <li class="link">
                                <a href="classes/Characteristic.html" data-type="entity-link" >Characteristic</a>
                            </li>
                            <li class="link">
                                <a href="classes/ConnectionInfo.html" data-type="entity-link" >ConnectionInfo</a>
                            </li>
                            <li class="link">
                                <a href="classes/Descriptor.html" data-type="entity-link" >Descriptor</a>
                            </li>
                            <li class="link">
                                <a href="classes/Device.html" data-type="entity-link" >Device</a>
                            </li>
                            <li class="link">
                                <a href="classes/FirestoreBaseService.html" data-type="entity-link" >FirestoreBaseService</a>
                            </li>
                            <li class="link">
                                <a href="classes/FireTimestamp.html" data-type="entity-link" >FireTimestamp</a>
                            </li>
                            <li class="link">
                                <a href="classes/HeartRate.html" data-type="entity-link" >HeartRate</a>
                            </li>
                            <li class="link">
                                <a href="classes/Interval.html" data-type="entity-link" >Interval</a>
                            </li>
                            <li class="link">
                                <a href="classes/LogHelper.html" data-type="entity-link" >LogHelper</a>
                            </li>
                            <li class="link">
                                <a href="classes/LogInfo.html" data-type="entity-link" >LogInfo</a>
                            </li>
                            <li class="link">
                                <a href="classes/MeasurementInfo.html" data-type="entity-link" >MeasurementInfo</a>
                            </li>
                            <li class="link">
                                <a href="classes/MeasurementValue.html" data-type="entity-link" >MeasurementValue</a>
                            </li>
                            <li class="link">
                                <a href="classes/MiBand3.html" data-type="entity-link" >MiBand3</a>
                            </li>
                            <li class="link">
                                <a href="classes/Property.html" data-type="entity-link" >Property</a>
                            </li>
                            <li class="link">
                                <a href="classes/ScanInfo.html" data-type="entity-link" >ScanInfo</a>
                            </li>
                            <li class="link">
                                <a href="classes/ScanResult.html" data-type="entity-link" >ScanResult</a>
                            </li>
                            <li class="link">
                                <a href="classes/Service.html" data-type="entity-link" >Service</a>
                            </li>
                            <li class="link">
                                <a href="classes/TaskProgressInfo.html" data-type="entity-link" >TaskProgressInfo</a>
                            </li>
                            <li class="link">
                                <a href="classes/User.html" data-type="entity-link" >User</a>
                            </li>
                            <li class="link">
                                <a href="classes/UUIDExtension.html" data-type="entity-link" >UUIDExtension</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#injectables-links"' :
                                'data-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/BleBaseService.html" data-type="entity-link" >BleBaseService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/BleConnectionService.html" data-type="entity-link" >BleConnectionService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/BleDataService.html" data-type="entity-link" >BleDataService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/BleDeviceSettingsService.html" data-type="entity-link" >BleDeviceSettingsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/DeviceService.html" data-type="entity-link" >DeviceService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FirebaseAuthService.html" data-type="entity-link" >FirebaseAuthService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FirebaseServerInfoService.html" data-type="entity-link" >FirebaseServerInfoService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FirestoreActivityInfoService.html" data-type="entity-link" >FirestoreActivityInfoService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FirestoreActivityService.html" data-type="entity-link" >FirestoreActivityService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FirestoreAuthSecurityService.html" data-type="entity-link" >FirestoreAuthSecurityService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FirestoreBatteryInfoService.html" data-type="entity-link" >FirestoreBatteryInfoService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FirestoreHeartRateService.html" data-type="entity-link" >FirestoreHeartRateService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FirestoreUserService.html" data-type="entity-link" >FirestoreUserService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/LanguageService.html" data-type="entity-link" >LanguageService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MessageService.html" data-type="entity-link" >MessageService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PermissionService.html" data-type="entity-link" >PermissionService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PickerService.html" data-type="entity-link" >PickerService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/StorageService.html" data-type="entity-link" >StorageService</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#guards-links"' :
                            'data-target="#xs-guards-links"' }>
                            <span class="icon ion-ios-lock"></span>
                            <span>Guards</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="guards-links"' : 'id="xs-guards-links"' }>
                            <li class="link">
                                <a href="guards/AuthGuard.html" data-type="entity-link" >AuthGuard</a>
                            </li>
                            <li class="link">
                                <a href="guards/DeviceGuard.html" data-type="entity-link" >DeviceGuard</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#interfaces-links"' :
                            'data-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/IActivity.html" data-type="entity-link" >IActivity</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IActivityInfo.html" data-type="entity-link" >IActivityInfo</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IAlertTranslation.html" data-type="entity-link" >IAlertTranslation</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IAuthSecurity.html" data-type="entity-link" >IAuthSecurity</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IBatteryInfo.html" data-type="entity-link" >IBatteryInfo</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ICharacteristic.html" data-type="entity-link" >ICharacteristic</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IChartDataStatus.html" data-type="entity-link" >IChartDataStatus</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IConnectionInfo.html" data-type="entity-link" >IConnectionInfo</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IDescriptor.html" data-type="entity-link" >IDescriptor</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IDevice.html" data-type="entity-link" >IDevice</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IEntityModel.html" data-type="entity-link" >IEntityModel</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IFilterOptions.html" data-type="entity-link" >IFilterOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IFirestoreBase.html" data-type="entity-link" >IFirestoreBase</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IFireTimestamp.html" data-type="entity-link" >IFireTimestamp</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IHeartRate.html" data-type="entity-link" >IHeartRate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IInterval.html" data-type="entity-link" >IInterval</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ILoadingTranslation.html" data-type="entity-link" >ILoadingTranslation</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ILogInfo.html" data-type="entity-link" >ILogInfo</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IMeasurementInfo.html" data-type="entity-link" >IMeasurementInfo</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IMeasurementValue.html" data-type="entity-link" >IMeasurementValue</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IPickerColumnTranslation.html" data-type="entity-link" >IPickerColumnTranslation</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IPickerTranslation.html" data-type="entity-link" >IPickerTranslation</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IProperty.html" data-type="entity-link" >IProperty</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IScanInfo.html" data-type="entity-link" >IScanInfo</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IScanResult.html" data-type="entity-link" >IScanResult</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IService.html" data-type="entity-link" >IService</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ITaskProgressInfo.html" data-type="entity-link" >ITaskProgressInfo</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IToastTranslation.html" data-type="entity-link" >IToastTranslation</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IUser.html" data-type="entity-link" >IUser</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IUUIDExtension.html" data-type="entity-link" >IUUIDExtension</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#miscellaneous-links"'
                            : 'data-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/enumerations.html" data-type="entity-link">Enums</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/typealiases.html" data-type="entity-link">Type aliases</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <a data-type="chapter-link" href="routes.html"><span class="icon ion-ios-git-branch"></span>Routes</a>
                        </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});