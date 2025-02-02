import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ChatStore } from './chat.store';
import { ChatApiService } from '../home/chat-api.service';
import { Channel } from '../model/chat';
import {FakeSignalRService} from "../home/fakeSignalR.service";
import {of} from "rxjs";

describe('ChatStore', ()=>{

    const chatService = {
      GetAllUsers: () =>
        of([
          { id: 1, username: 'user1', status: false },
          { id: 2, username: 'user2', status: true },
          { id: 3, username: 'user3', status: true },
        ]),
      GetChannelUsersIds: (channelId:number) => of([1,2]),
      GetChannelMessages: (channelId:number) => of([
        {id: 1, userId: 1, channelId: channelId, content: "message_1", date:"2025-02-02T10:44:27Z"},
        {id: 2, userId: 2, channelId: channelId, content: "message_2", date:"2025-02-02T11:44:27Z"},
        {id: 3, userId: 1, channelId: channelId, content: "message_3", date:"2025-02-02T12:44:27Z"},
        {id: 4, userId: 2, channelId: channelId, content: "message_4", date:"2025-02-02T13:44:27Z"},
      ]),
      AddChannelMessage: (channelId:number, userId:number, content:string) =>
        of({id: 111, userId: userId, channelId: channelId, content: content, date: new Date().toUTCString()}),
      UpdateChannelUsers: (channelId:number, users: number[])=> of(users)
    };


    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [ChatStore, FakeSignalRService, {provide: ChatApiService, useValue: chatService}]
    });})


    it('should created ChatStore', ()=>{
        const store = TestBed.inject(ChatStore);

        expect(store).toBeTruthy()
        expect(store).not.toBeNaN();
        expect(store).not.toBeNull();
        expect(store).not.toBeUndefined();
    });

    it('should be empty ChatStore with loaded allUsers', ()=>{
      const store = TestBed.inject(ChatStore);

      expect(store.isLoading()).toBe(false);
      expect(store.selectedChannel()).toBeNull();
      expect(store.selectedChannelState()).toEqual({ usersIds: [  ], messages: [  ] });

      expect(store.allUsers().length).toBe(3);
    });

    it('should operate null channel', ()=>{
      const store = TestBed.inject(ChatStore);
      store.selectChannel(null);
      expect(store.selectedChannel()).toBeNull();
      expect(store.selectedChannelState()).toEqual({ usersIds: [  ], messages: [  ] });
    });

    it('should load channel (messages and users)', fakeAsync(()=>{
      const store = TestBed.inject(ChatStore);
      let channel:Channel = {id:1,  name:"channel 1"};
      store.selectChannel(channel);
      tick(500);

      expect(store.selectedChannelState()).not.toBeNull();
      expect(store.selectedChannelState().usersIds.length).toBe(2);
      expect(store.selectedChannelUsers().length).toBe(2);
      expect(store.selectedChannelState().messages.length).toBe(4);
      expect(store.selectedChannelState().messages[0].channelId).toBe(channel.id);
    }))

    it('should compute selected channel users', fakeAsync(()=>{
      const store = TestBed.inject(ChatStore);
      let channel:Channel = {id:1,  name:"channel 1"};
      store.selectChannel(channel);
      tick(500);

      expect(store.selectedChannelState()).not.toBeNull();
      expect(store.selectedChannelUsers().length).toBe(store.selectedChannelState().usersIds.length);
      for(let i=0; i<store.selectedChannelState().usersIds.length; i++)
        expect(store.selectedChannelUsers()[i].id).toBe(store.selectedChannelState().usersIds[i]);
    }))

    it('should add new message to channel', fakeAsync(()=>{
        const store = TestBed.inject(ChatStore); 

        expect(store.selectedChannelState.messages().length).toBe(0);
        let data = {userId : 1, content:"added message"};
        store.addChannelMessage(data);
        expect(store.selectedChannelState.messages().length).toBe(1);
        expect(store.selectedChannelState.messages().at(0)?.content).toEqual(data.content);
        expect(store.selectedChannelState.messages().at(0)?.userId).toEqual(data.userId);
    }));

    it('should update channel users', fakeAsync(()=>{
      const store = TestBed.inject(ChatStore);
      let channel:Channel = {id:1,  name:"channel 1"};
      store.selectChannel(channel);
      tick(500);
      expect(store.selectedChannelState.usersIds().length).toBe(2);

      let data = [3];
      store.updateChannelUsers(data);

      expect(store.selectedChannelState.usersIds().length).toBe(data.length);
      expect(store.selectedChannelState.usersIds()).toEqual(data);
    }));

});
