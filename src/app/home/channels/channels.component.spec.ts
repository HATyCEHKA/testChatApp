import {fakeAsync, TestBed, tick} from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { ChannelsComponent } from './channels.component';
import {ChannelsStore} from './channels.store';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {authSelectors} from '../../store/auth.selectors';
import authUserSelector = authSelectors.authUserSelector;
import {BsModalService} from "ngx-bootstrap/modal";
import {signal, WritableSignal} from "@angular/core";
import {Channel} from "../../model/chat";


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
  let store: MockStore;

  const channels = [ {
    id: 1,
    name: "channel1"
  },
  {
    id: 2,
    name: "channel2"
  }]

  class MockChannelsStore{
    channels:WritableSignal<Channel[]|null> = signal([]);
    isLoading = signal(false);
    selectedChannel:WritableSignal<Channel|null> =  signal( null);

    selectChannel (channel: Channel|null): void{
      this.selectedChannel.set(channel);
    };

    loadChannels (id: number): void{
      this.channels.set(channels);
    }
  }

  beforeEach(async () => {

    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), HttpClientTestingModule],
      providers: [BsModalService, provideMockStore({ initialState })]
    })
      .overrideComponent(ChannelsComponent, {set: {providers: [{provide: ChannelsStore, useValue: new MockChannelsStore()}]}} )
      .compileComponents();

    store = TestBed.inject(MockStore);
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


  it('should call "loadChannels" on ngOnInit', fakeAsync(() => {
     const fixture = TestBed.createComponent(ChannelsComponent);
     let store = fixture.debugElement.injector.get(ChannelsStore);
     expect(store.channels()).toEqual([]);
     let spyLoadChannels = spyOn(store, 'loadChannels');
     fixture.detectChanges();
     expect(spyLoadChannels).toHaveBeenCalled();
  }));


  it('should show channels from store and change channel on click', fakeAsync(() => {
    const fixture = TestBed.createComponent(ChannelsComponent);
    const app = fixture.componentInstance;
    fixture.detectChanges();

    const compiled = fixture.debugElement.nativeElement;
    let items = compiled.querySelectorAll('a');
    expect(items.length).toBe(2);

    app.ChannelSelected.subscribe(channel => {
      expect(channel.id).toBe(2);
    })

    items[1].click();
    tick();
    fixture.detectChanges();
  }));

});
