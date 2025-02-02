import { fakeAsync, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule} from '@angular/common/http/testing';
import { ChannelsStore } from './channels.store';
import {ChatApiService} from "../chat-api.service";
import {Observable} from 'rxjs';
import {Channel} from '../../model/chat';

describe('ChannelsStore', ()=>{
  let valueServiceSpy: jasmine.SpyObj<ChatApiService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('ChatApiService',
      ['GetUserChannels', 'GetChannelUsers', 'GetChannelMessages', 'AddChannelMessage', 'AddUserChannel', 'UpdateChannelUsers', 'GetAllUsers']);


    TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [ChannelsStore, {provide: ChatApiService, useValue: spy}]
        })
      valueServiceSpy = TestBed.inject(ChatApiService) as jasmine.SpyObj<ChatApiService>;
    });

    it('should created ChannelsStore', ()=>{
        const store = TestBed.inject(ChannelsStore);

        expect(store).toBeTruthy()
    });

    it('should be empty ChannelsStore', ()=>{
        const store = TestBed.inject(ChannelsStore);
        expect(store.isLoading()).toBe(false);
        expect(store.channels()).toEqual([]);
        expect(store.selectedChannel()).toBeNull();
    });

    it('should have user channels', ()=>{
      const store = TestBed.inject(ChannelsStore);

      let _data:Observable<Channel[]|undefined> = new Observable<Channel[]|undefined>(obs=>{
        obs.next([{id:1, name:'asdasd'}, {id:2, name:"asdasd"}]);
      });

      valueServiceSpy.GetUserChannels.and.returnValue(_data);

      store.loadChannels(2);

      expect(valueServiceSpy.GetUserChannels).toHaveBeenCalled();

      expect(store.channels().length).toBe(2);
    });

    it('should have Error | UNABLE to test error', fakeAsync(()=>{
      const store = TestBed.inject(ChannelsStore);
      let _data:Observable<Channel[]|undefined> = new Observable<Channel[]|undefined>(obs=>{
        obs.error('ERROR: Unathorized access');
      });

      valueServiceSpy.GetUserChannels.and.returnValue(_data);

      store.loadChannels(2);

      expect(valueServiceSpy.GetUserChannels).toHaveBeenCalled();
      expect(store.channels().length).toBe(0);

    }));

    it('should operate null channel', ()=>{
          const store = TestBed.inject(ChannelsStore);
          store.selectChannel(null);
          expect(store.selectedChannel()).toBeNull();

      });

});
