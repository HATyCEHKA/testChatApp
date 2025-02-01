import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpClientTestingModule, HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ChannelsStore } from './channels.store';
import {ChatApiService} from "../chat-api.service";
import {FakeSignalRService} from "../fakeSignalR.service";

describe('ChannelsStore', ()=>{
  let httpTestingController: HttpTestingController;

  let operateRequest = (url:string, method:string, data:any)=>{
    let apiReq = httpTestingController.expectOne(url);
    expect(apiReq.cancelled).toBeFalsy();
    expect(apiReq.request.method).toBe(method, "Invalid request type");
    expect(apiReq.request.responseType).toBe('json', "Invalid response type");
    apiReq.request;
    apiReq.flush(data);
  };

  beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), HttpClientTestingModule],
            providers: [TranslateService, provideHttpClientTesting(), ChannelsStore, ChatApiService, FakeSignalRService]
        })
        httpTestingController = TestBed.inject(HttpTestingController);
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
      store.loadChannels(2);

      let data = [
        {
          userId: 2,
          id: "2",
          channelId: 1
        },
        {
          userId: 2,
          id: "3",
          channelId: 2
        },
        {
          id: "4",
          userId: 2,
          channelId: 3
        }];
      operateRequest('http://localhost:3000/user_channels?userId=2', 'GET',data );

      let dataChannels = [ {
          id: 1,
          name: "channel1"
      },
      {
          id: 2,
          name: "channel2"
      },
      {
          id: 3,
          name: "channel3"
      },
      {
          id: 4,
          name: "channel4"
      }];
      operateRequest('http://localhost:3000/channels', 'GET', dataChannels);

      expect(store.channels().length).toBe(3);
    });

    it('should have Error | UNABLE to test error', fakeAsync(()=>{
        const store = TestBed.inject(ChannelsStore);
        store.loadChannels(2);

        tick(500);
        const apiReq = httpTestingController.expectOne('http://localhost:3000/user_channels?userId=2');
        expect(apiReq.cancelled).toBeFalsy();
        expect(apiReq.request.method).toBe("GET", "Invalid request type");
        expect(apiReq.request.responseType).toBe('json', "Invalid response type");
        apiReq.request;
        apiReq.flush("error request", { status: 401, statusText: 'Unathorized access' });

        expect(store.channels().length).toBe(0);
    }))

    it('should operate null channel', ()=>{
        const store = TestBed.inject(ChannelsStore);
        store.selectChannel(null);
        expect(store.selectedChannel()).toBeNull();

    });

});
