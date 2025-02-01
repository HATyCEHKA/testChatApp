import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpClientTestingModule, HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ChatStore } from './chat.store';
import { ChatApiService } from '../home/chat-api.service';
import { Channel } from '../model/chat';
import {FakeSignalRService} from "../home/fakeSignalR.service";

describe('ChatStore', ()=>{
    let httpTestingController: HttpTestingController;
    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), HttpClientTestingModule],
            providers: [TranslateService, provideHttpClientTesting(), ChatStore, ChatApiService, FakeSignalRService]
        })
        httpTestingController = TestBed.inject(HttpTestingController);
    });

    it('should created ChatStore', ()=>{
        const store = TestBed.inject(ChatStore);    
        expect(store).toBeTruthy()
        expect(store).not.toBeNaN();
        expect(store).not.toBeNull();
        expect(store).not.toBeUndefined();
    });

    it('should be empty ChatStore', ()=>{
        const store = TestBed.inject(ChatStore); 
        expect(store.isLoading()).toBe(false);
        expect(store.selectedChannel()).toBeNull();
        expect(store.selectedChannelState()).toEqual({ users: [  ], messages: [  ] });
    });

    it('should get messages from channel', fakeAsync(()=>{
        const store = TestBed.inject(ChatStore); 
        store.loadChannelMessages(2);

        tick(500);
        const apiReq = httpTestingController.expectOne('http://localhost:3000/messages?channelId=2');
        expect(apiReq.cancelled).toBeFalsy();
        expect(apiReq.request.method).toBe("GET", "Invalid request type");
        expect(apiReq.request.responseType).toBe('json', "Invalid response type");
        
        let data = [
            {
                id: "4",
                userId: 2,
                channelId: 2,
                content: "hello 2_2"
            },
            {
                id: "5",
                userId: 3,
                channelId: 2,
                content: "hello 3_2"
            }];

        apiReq.request;
        apiReq.flush(data);

        expect(store.selectedChannelState.messages().length).toBe(2);
    }));

    it('should add new message to channel', fakeAsync(()=>{
        const store = TestBed.inject(ChatStore); 

        expect(store.selectedChannelState.messages().length).toBe(0);
        store.addChannelMessage({userId : 1, content:"test message"});

        const apiReq = httpTestingController.expectOne('http://localhost:3000/messages');
        expect(apiReq.cancelled).toBeFalsy();
        expect(apiReq.request.method).toBe("POST", "Invalid request type");
        expect(apiReq.request.responseType).toBe('json', "Invalid response type");
        
        let data = {
            id: "4",
            userId: 2,
            channelId: 2,
            content: "hello 2_2"
        };
        
        apiReq.request;
        apiReq.flush(data);
        expect(store.selectedChannelState.messages().length).toBe(1);
        expect(store.selectedChannelState.messages().at(0)?.content).toEqual(data.content);
    }));

    it('should get users from channel', fakeAsync(()=>{
        const store = TestBed.inject(ChatStore); 
        store.loadChannelUsers(1);
        tick(500);

        let apiReq = httpTestingController.expectOne('http://localhost:3000/user_channels?channelId=1');
        expect(apiReq.cancelled).toBeFalsy();
        expect(apiReq.request.method).toBe("GET", "Invalid request type");
        expect(apiReq.request.responseType).toBe('json', "Invalid response type");
        
        let data = [
            {
                userId: 1,
                id: "1",
                channelId: 1
            },
            {
                userId: 2,
                id: "2",
                channelId: 1
            }];

        apiReq.request;
        apiReq.flush(data);

        apiReq = httpTestingController.expectOne('http://localhost:3000/users');
        expect(apiReq.cancelled).toBeFalsy();
        expect(apiReq.request.method).toBe("GET", "Invalid request type");
        expect(apiReq.request.responseType).toBe('json', "Invalid response type");

        let dataChannels = [ {
            id: "1",
            username: "user1",
            password: "pass1",
            status: true
        },
        {
            id: "2",
            username: "user2",
            password: "pass2",
            status: false
        }];
        apiReq.request;
        apiReq.flush(dataChannels);

        expect(store.selectedChannelState.users().length).toBe(2);
    }));

    it('should have Error | UNABLE to test error', fakeAsync(()=>{
        const store = TestBed.inject(ChatStore); 
        store.loadChannelMessages(2);

        tick(500);
        const apiReq = httpTestingController.expectOne('http://localhost:3000/messages?channelId=2');
        expect(apiReq.cancelled).toBeFalsy();
        expect(apiReq.request.method).toBe("GET", "Invalid request type");
        expect(apiReq.request.responseType).toBe('json', "Invalid response type");
        apiReq.request;
        apiReq.flush("error request", { status: 401, statusText: 'Unathorized access' });

        expect(store.selectedChannelState.messages().length).toBe(0);
    }))

    it('should operate null channel', ()=>{
        const store = TestBed.inject(ChatStore); 
        store.selectChannel(null);
        expect(store.selectedChannel()).toBeNull();

    });

    it('should load channel', fakeAsync(()=>{
        const store = TestBed.inject(ChatStore); 
        let channel:Channel = {id:1, name:"channel 1"};
        store.selectChannel(channel);
        tick(500);
        let apiReq = httpTestingController.expectOne({method:'GET', url:"http://localhost:3000/user_channels?channelId=1"});
        let user_channels_data = [
            {
                userId: 1,
                id: "1",
                channelId: 1
            }];

        apiReq.request;
        apiReq.flush(user_channels_data);
        
        apiReq = httpTestingController.expectOne({method:'GET', url:'http://localhost:3000/users'});

        let dataChannels = [ {
            id: "1",
            username: "user1",
            password: "pass1",
            status: true
        }];
        apiReq.request;
        apiReq.flush(dataChannels);
        tick(500);
        
        apiReq = httpTestingController.expectOne({method:'GET', url:'http://localhost:3000/messages?channelId=1'});
        
        let messagesData = [
            {
                id: "4",
                userId: 2,
                channelId: 1,
                content: "hello 2_2"
            },
            {
                id: "5",
                userId: 3,
                channelId: 1,
                content: "hello 3_2"
            }];

        apiReq.request;
        apiReq.flush(messagesData);

        
        expect(store.selectedChannelState()).not.toBeNull();
        expect(store.selectedChannelState().users.length).toBe(1);
        expect(store.selectedChannelState().messages.length).toBe(2);
    }))
});
