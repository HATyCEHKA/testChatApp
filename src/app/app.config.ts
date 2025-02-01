import {APP_INITIALIZER, ApplicationConfig, importProvidersFrom, provideZoneChangeDetection} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import {TranslateLoader, TranslateModule} from "@ngx-translate/core";
import {HttpClient, provideHttpClient} from "@angular/common/http";
import {TranslateHttpLoader} from "@ngx-translate/http-loader";
import {StoreModule} from "@ngrx/store";
import {EffectsModule} from "@ngrx/effects";
import {AuthEffects} from "./store/auth.effects";
import {authFeature} from './store/auth.reducers';
import {BsModalService} from "ngx-bootstrap/modal";

const httpLoaderFactory: (http: HttpClient) => TranslateHttpLoader = (http: HttpClient) =>
  new TranslateHttpLoader(http, './i18n/', '.json');

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    importProvidersFrom([
      TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: httpLoaderFactory,
        deps: [HttpClient],
      },}),
      StoreModule.forRoot({}),
      StoreModule.forFeature( authFeature ),
      EffectsModule.forRoot([AuthEffects]),
    ]),

    BsModalService,
    {
      provide: APP_INITIALIZER,
      multi: true,
      deps: [BsModalService],
      useFactory: (bsModalService: BsModalService) => {
        return () => {
          bsModalService.config.animated = true;
          bsModalService.config.focus = true;
          bsModalService.config.ignoreBackdropClick = false;
          bsModalService.config.keyboard = true;
          bsModalService.config.class = "modal-xs";
        };
      }
    }

  ]
};
