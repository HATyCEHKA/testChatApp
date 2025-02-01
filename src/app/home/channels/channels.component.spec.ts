import {fakeAsync, TestBed, tick} from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ChannelsComponent } from './channels.component';
import {AuthService} from '../../login/auth.service';
import {ChannelsStore} from './channels.store';
import {ChatApiService} from '../chat-api.service';
import {HttpClientTestingModule, HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {FakeSignalRService} from '../fakeSignalR.service';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {authSelectors} from '../../store/auth.selectors';
import authUserSelector = authSelectors.authUserSelector;
import {BsModalService} from "ngx-bootstrap/modal";

describe('ChannelsComponent', () => {

  const initialState = {
    isAuthenticated: false,
    user: {
      id: 1,
      username: 'user1',
      password: 'password1',
      status: true
    },
    errorMessage: null
  };
  let httpTestingController: HttpTestingController;
  let store: MockStore;

  beforeEach(async () => {

    await TestBed.configureTestingModule({
      imports: [ChannelsComponent, TranslateModule.forRoot(), HttpClientTestingModule],
      providers: [TranslateService, BsModalService, ChannelsStore, AuthService, ChatApiService, provideHttpClientTesting(), FakeSignalRService, provideMockStore({ initialState })]
    }).compileComponents();

    store = TestBed.inject(MockStore);
    httpTestingController = TestBed.inject(HttpTestingController);

    let mockauthUserSelector = store.overrideSelector(authUserSelector,  {
      id: 1,
      username: 'user1',
      password: 'password1',
      status: true
    })
  });

  it('should create the ChannelsComponent', () => {
    const fixture = TestBed.createComponent(ChannelsComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();

    fixture.destroy();
  });

  it('should load channels and change channel on click', fakeAsync(() => {
    const fixture = TestBed.createComponent(ChannelsComponent);
    const app = fixture.componentInstance;

    app.ngOnInit();

    let apiReq = httpTestingController.expectOne({method:'GET',url:'http://localhost:3000/user_channels?userId=1'});

    let data = [
      {
        userId: 1,
        id: "1",
        channelId: 1
      }, {
        userId: 1,
        id: "2",
        channelId: 2
      }];

    apiReq.request;
    apiReq.flush(data);

    apiReq = httpTestingController.expectOne({method:'GET', url:'http://localhost:3000/channels'});
    let dataChannels = [ {
      id: 1,
      name: "channel1"
    },
      {
        id: 2,
        name: "channel2"
      }];
    apiReq.request;
    apiReq.flush(dataChannels);

    fixture.detectChanges();

    const compiled = fixture.debugElement.nativeElement;

    let items = compiled.querySelectorAll('a');
    expect(items.length).toBe(2);

    app.ChannelSelected.subscribe(channel => {
      expect(channel.id).toBe(1);
    })

    items[0].click();
    tick();
    fixture.detectChanges();
    //const onClickMock = spyOn(items[0], 'click');
    //items[0].triggerEventHandler('click', null);
    //expect(onClickMock).toHaveBeenCalled();
  }))

});
