import { TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthApiService } from './auth_api_service';
import { HttpClientTestingModule, HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

describe('AuthApiService', () => {
    let httpTestingController: HttpTestingController;
    let service:AuthApiService;
    beforeEach(async () => {
        
        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), HttpClientTestingModule],
            providers: [TranslateService, AuthApiService, provideHttpClientTesting() ]
        })
        httpTestingController = TestBed.inject(HttpTestingController);
        service = TestBed.inject(AuthApiService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should have logIn function', () => {
        expect(service.logIn).toBeTruthy();
    });

    it('should logIn dummy user', ()=>{
        service.logIn('user2', 'pass2').subscribe({
            next: (response) => {
              expect(response).toBeTruthy();
              expect(response).not.toBeUndefined();
              expect(response).not.toBeNull();
              expect(response).not.toBeNaN();
              expect(response?.id).toBe(2);
              expect(response?.username).toBe("user2");
              expect(response?.password).toBe("pass2");
              expect(response?.status).toBe(true);
            }
          });
        
        const apiReq = httpTestingController.expectOne('http://localhost:3000/users?username=user2&password=pass2');
        expect(apiReq.cancelled).toBeFalsy();
        expect(apiReq.request.method).toBe("GET", "Invalid request type");
        expect(apiReq.request.responseType).toBe('json', "Invalid response type");
        
        let data = [{ id: 2,
            username: 'user2',
            password: 'pass2',
            status: true
        }];

        apiReq.request;
        apiReq.flush(data);
    })

    it('should have error', ()=>{
        service.logIn('err','err').subscribe(res=>{

        }, error=>{
            expect(error).toBeTruthy();
            expect(error.status).withContext('status').toEqual(401);
        });
        const apiReq = httpTestingController.expectOne('http://localhost:3000/users?username=err&password=err');
        expect(apiReq.cancelled).toBeFalsy();
        expect(apiReq.request.method).toBe("GET", "Invalid request type");
        expect(apiReq.request.responseType).toBe('json', "Invalid response type");
        apiReq.request;
        apiReq.flush("error request", { status: 401, statusText: 'Unathorized access' });

    });



});
