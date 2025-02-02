import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods, withProps,
  withState
} from '@ngrx/signals';
import {Channel, Message} from "../model/chat";
import {computed, inject} from "@angular/core";
import {ChatApiService} from "../home/chat-api.service";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {debounceTime, distinctUntilChanged, switchMap, tap, pipe, catchError, of, interval} from "rxjs";
import {tapResponse} from "@ngrx/operators";
import {User} from "../model/user";
import {FakeSignalRService} from "../home/fakeSignalR.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";


export interface SelectedChannelState {
  messages: Message[];
  usersIds: any[];
};

type ChatState = {
  isLoading: boolean;
  selectedChannel: Channel | null;
  selectedChannelState: SelectedChannelState;
  allUsers:User[]
};

const initialState: ChatState = {
  isLoading: false,
  selectedChannel: null,
  selectedChannelState: {
    messages: [],
    usersIds: []
  },
  allUsers: []
};

export interface AddMessageData {
  userId: number;
  content: string;
};


export const ChatStore = signalStore(
  withState(initialState),

  withComputed(({ selectedChannelState, allUsers }) => ({
    selectedChannelUsers: computed(()=>{
      if(!selectedChannelState().usersIds || !selectedChannelState().usersIds.length)
        return [];
      return allUsers().filter(user=>selectedChannelState().usersIds.indexOf(user.id)>=0);
    })
  })),

  withHooks((store, chatService = inject(ChatApiService)) => {
    return {
      onInit() {
        chatService.GetAllUsers()
          .pipe(takeUntilDestroyed())
          .subscribe((userIds:User[]) => patchState(store, { allUsers: userIds }));

        //Иммитация обновления статусов пользователей.
        interval(5_000).pipe(
          takeUntilDestroyed(),
          switchMap(()=> chatService.GetAllUsers()),
        ).subscribe((userIds:User[]) => patchState(store, { allUsers: userIds }));
      },
      onDestroy() {},
    };
  }),

  withMethods((store, chatService = inject(ChatApiService), fakeSignalRService = inject(FakeSignalRService)) => {

    function selectChannel(channel: Channel|null): void {
      //console.log("STORE SELECT CHANNEL", channel);
      patchState(store, (state) => ({ selectedChannel: channel }));
      if(channel)
      {
        loadChannelUsers(channel.id);
        loadChannelMessages(channel.id);
      }
      else{
        let selectedChannelState = {
          messages: [],
            usersIds: []
        };
        patchState(store, (state:ChatState) => ({ selectedChannelState}));
      }
    }

    function messageReceived(message:Message){
      let messages = store.selectedChannelState.messages() as Message[];
      if(messages && messages.some(m=>m.id==message.id))
        return;

      console.log("NEW MESSAGE RECEIVED", message);
      patchState(store, (state:ChatState) => ({ selectedChannelState: { ...state.selectedChannelState, messages:[...state.selectedChannelState.messages, message] }, isLoading: false}));
    }

    const loadChannelUsers = rxMethod<number>(
      pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => patchState(store, { isLoading: true })),
        switchMap((channelId: number) => {
          return chatService.GetChannelUsersIds(channelId).pipe(
            tapResponse({
              next: (usersIds:number[]) => {
                patchState(store, (state:ChatState) => ({ selectedChannelState: { ...state.selectedChannelState, usersIds }, isLoading: false}));
              },
              error: (err) => {
                patchState(store, { isLoading: false });
                console.error(err);
              },
            })
          );
        }),
      )
    )

    const loadChannelMessages = rxMethod<number>(
      pipe(
        debounceTime(300),
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

    const updateChannelUsers = rxMethod<number[]>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap((data:number[]) => {
          console.log("UPDATE CHANNEL USERS:", data);
          let id = store.selectedChannel()?.id;
          if(id==undefined)
            id = -1;
          return chatService.UpdateChannelUsers(id, data).pipe(
            tapResponse({
              next: (usersIds:any[]) => {
                console.log("UPDATED USERS:", usersIds);
                patchState(store, (state:ChatState) => ({ selectedChannelState: { ...state.selectedChannelState, usersIds }, isLoading: false}));
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

    return { selectChannel, addChannelMessage, updateChannelUsers};
  })
);

//export type ChatStore = InstanceType<typeof ChatStore>;
