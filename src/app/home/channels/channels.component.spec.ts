import { TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ChannelsComponent } from './channels.component';
import { Channel } from '../../model/chat';

describe('ChannelsComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChannelsComponent, TranslateModule.forRoot()],
      providers: [TranslateService]
    }).compileComponents();
  });

  it('should create the ChannelsComponent', () => {
    const fixture = TestBed.createComponent(ChannelsComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should change selected channel', ()=>{
    const fixture = TestBed.createComponent(ChannelsComponent);
    const app = fixture.componentInstance;
    const componentRef = fixture.componentRef;
    
    let channel1:Channel = {id: 1, name:"channel 1"};
    let channel2:Channel = {id: 2, name:"channel 2"};
    let channel3:Channel = {id: 3, name:"channel 3"};
    
    componentRef.setInput('Channels', [channel1, channel2, channel3]);

    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;

    let items = compiled.querySelectorAll('a');

    expect(items.length).toBe(3);

    expect(app.SelectedChannel()).toBeUndefined();

    items[0].click();
    fixture.detectChanges();
    expect(app.SelectedChannel()).not.toBeUndefined();
    expect(app.SelectedChannel()?.id).toBe(1);
    expect(app.SelectedChannel()?.name).toEqual(channel1.name);

  });

  it('should have channel', ()=>{
    let channel:Channel = {id: 1, name:"aaaa"};
    
    const fixture = TestBed.createComponent(ChannelsComponent);
    const app = fixture.componentInstance;
    const componentRef = fixture.componentRef;

    componentRef.setInput('Channels', [channel])

    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    
    expect(compiled.querySelector('a').textContent).toBe('aaaa');

  });

});
