import { TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { Channel, Message } from '../../model/chat';
import { MessagesComponent } from './messages.component';

describe('MessagesComponent', () => {
  let message1:Message={id: 1,
    userId: 1,
    channelId: 1,
    content: 'some text string',
    date: new Date().toUTCString()};

  let message2:Message={id: 2,
    userId: 1,
    channelId: 1,
    content: 'some other text string',
    date: new Date().toUTCString()};

  let user1={
    id: 1,
    username: 'user 1',
    status: true
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessagesComponent, TranslateModule.forRoot()],
      providers: [TranslateService]
    }).compileComponents();
  });

  it('should create the MessagesComponent', () => {
    const fixture = TestBed.createComponent(MessagesComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });


  it('should have messages', ()=>{

    const fixture = TestBed.createComponent(MessagesComponent);
    const app = fixture.componentInstance;
    const componentRef = fixture.componentRef;

    expect(app.Messages()).toBeUndefined();

    componentRef.setInput('Messages', [message1, message2]);

    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;

    let items = compiled.querySelectorAll('.card');
    expect(items.length).toBe(2);
    expect(app.Messages()?.length).toBe(2);

  });

  it('should display user name', ()=>{
    const fixture = TestBed.createComponent(MessagesComponent);
    const app = fixture.componentInstance;
    const componentRef = fixture.componentRef;

    componentRef.setInput('Messages', [message1, message2]);
    componentRef.setInput('Users', [user1]);

    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;

    let items = compiled.querySelectorAll('.card');
    expect(items.length).toBeGreaterThan(0);
    let header = items[0].querySelector('span');
    expect(header.textContent).toEqual(user1.username);
  })

});
