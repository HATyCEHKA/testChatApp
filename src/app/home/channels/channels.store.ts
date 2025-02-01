import {patchState, signalStore, withMethods, withState} from '@ngrx/signals';
import {Channel} from "../../model/chat";
import {inject} from "@angular/core";
import {ChatApiService} from "../chat-api.service";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {debounceTime, distinctUntilChanged, switchMap, tap, pipe, catchError, of} from "rxjs";
import {tapResponse} from "@ngrx/operators";

type ChatState = {
  channels: Channel[];
  isLoading: boolean;
  selectedChannel: Channel | null;
};

const initialState: ChatState = {
  channels: [],
  isLoading: false,
  selectedChannel: null,
};

export interface AddChannelData {
  userId: number;
  channelName: string;
};

export const ChannelsStore = signalStore(
  withState(initialState),
  withMethods((store, chatService = inject(ChatApiService)) => {

    function selectChannel(channel: Channel|null): void {
      //console.log("STORE SELECT CHANNEL", channel);
      patchState(store, (state) => ({ selectedChannel: channel }));
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

    const addChannel = rxMethod<AddChannelData>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        //debounceTime(2000),
        switchMap((data: AddChannelData) => {
          return chatService.AddUserChannel(data.userId, data.channelName).pipe(
            tapResponse({
              next: (channel) => {
                if(channel)
                  patchState(store, (state: ChatState) => ({channels: [...state.channels, channel]}));
                patchState(store, { isLoading: false });
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

    return { selectChannel, loadChannels, addChannel};
  })
);

//export type ChannelsStore = InstanceType<typeof ChannelsStore>;
