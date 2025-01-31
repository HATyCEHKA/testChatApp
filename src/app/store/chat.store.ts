 import {patchState, signalStore, withMethods, withState} from '@ngrx/signals';
 import {Channel, Message} from "../model/chat";
 import {inject} from "@angular/core";
 import {ChatApiService} from "../home/chat-api.service";
 import {rxMethod} from "@ngrx/signals/rxjs-interop";
 import {debounceTime, distinctUntilChanged, switchMap, tap, pipe, catchError, of} from "rxjs";
 import {tapResponse} from "@ngrx/operators";
 import {User} from "../model/user";
 import {FakeSignalRService} from "../home/fakeSignalR.service";



 export interface SelectedChannelState {
   users: User[];
   messages: Message[];
 };

type ChatState = {
  channels: Channel[];
  isLoading: boolean;
  selectedChannel: Channel | null;
  selectedChannelState: SelectedChannelState;
};

const initialState: ChatState = {
  channels: [],
  isLoading: false,
  selectedChannel: null,
  selectedChannelState: {
    users:[],
    messages: []
  }
};

 export interface AddMessageData {
   userId: number;
   content: string;
 };

 export const ChatStore = signalStore(
   withState(initialState),
   withMethods((store, chatService = inject(ChatApiService), fakeSignalRService = inject(FakeSignalRService)) => {

     function selectChannel(channel: Channel|null): void {
       console.log("STORE SELECT CHANNEL", channel);
       patchState(store, (state) => ({ selectedChannel: channel }));
       if(channel)
       {
         loadChannelUsers(channel.id);
         loadChannelMessages(channel.id);
       }
       else{
         let users: User[] = [];
         let messages: Message[] = [];
         patchState(store, (state:ChatState) => ({ selectedChannelState: { ...state.selectedChannelState, users}}));
         patchState(store, (state:ChatState) => ({ selectedChannelState: { ...state.selectedChannelState, messages}}));
       }
     }

     function messageReceived(message:Message){
       let messages = store.selectedChannelState.messages() as Message[];
       if(messages && messages.some(m=>m.id==message.id))
           return;

       console.log("NEW MESSAGE RECEIVED", message);
       patchState(store, (state:ChatState) => ({ selectedChannelState: { ...state.selectedChannelState, messages:[...state.selectedChannelState.messages, message] }, isLoading: false}));
     }

     const loadChannels = rxMethod<number>(
       pipe(
         tap(() => patchState(store, { isLoading: true })),
         //debounceTime(2000),
         switchMap((userId: number) => {
           return chatService.GetUserChannels(userId).pipe(
             tapResponse({
               next: (channels) => patchState(store, (state: ChatState) => ({channels: channels, isLoading: false})),
               error: (err) => {
                 patchState(store, { isLoading: false });
                 console.error(err);
               },
             })
           );
         })
       )
     )

     const loadChannelUsers = rxMethod<number>(
       pipe(
         debounceTime(500),
         distinctUntilChanged(),
         tap(() => patchState(store, { isLoading: true })),
         switchMap((channelId: number) => {
           //console.log("loadChannelUsers", channelId);
           return chatService.GetChannelUsers(channelId).pipe(
             tapResponse({
               next: (users:User[]) => {
                 patchState(store, (state:ChatState) => ({ selectedChannelState: { ...state.selectedChannelState, users }, isLoading: false}));
               },
               error: (err) => {
                 patchState(store, { isLoading: false });
                 console.error(err);
               },
             })
           );
         })
       )
     )

     const loadChannelMessages = rxMethod<number>(
       pipe(
         debounceTime(500),
         distinctUntilChanged(),
         tap(() => patchState(store, { isLoading: true })),
         switchMap((channelId: number) => {
           //console.log("loadChannelMessages", channelId);
           return chatService.GetChannelMessages(channelId).pipe(
             switchMap((messages:Message[]) => {
               patchState(store, (state:ChatState) => ({ selectedChannelState: { ...state.selectedChannelState, messages }, isLoading: false}));

               let dates = messages.map(m => m.date?Date.parse(m.date):0);
               let maxDate =  new Date(Math.max.apply(null, dates));

               return fakeSignalRService.subscribeNewMessageFromServer(channelId, maxDate).pipe(
                 tap((newMessage:Message)=>{
                   messageReceived(newMessage);
                 })
               );
             }),
             catchError((err) => {
               patchState(store, { isLoading: false });
               console.error(err);
               return of();
             }),
           );
         })
       )
     )

     const addChannelMessage = rxMethod<AddMessageData>(
       pipe(
         //tap(() => patchState(store, { isLoading: true })),
         switchMap((data:AddMessageData) => {
           console.log("add channel Message", data);
           let id = store.selectedChannel()?.id;
           if(id==undefined)
             id = -1;
           return chatService.AddChannelMessage(id, data.userId, data.content).pipe(
             tapResponse({
               next: (message:Message) => {
                 messageReceived(message);
               },
               error: (err) => {
                 //patchState(store, { isLoading: false });
                 console.error(err);
               },
             })
           );
         })
       )
     )

     return { selectChannel, loadChannels, addChannelMessage, loadChannelMessages,  loadChannelUsers};
   })
 );

//export type ChatStore = InstanceType<typeof ChatStore>;
