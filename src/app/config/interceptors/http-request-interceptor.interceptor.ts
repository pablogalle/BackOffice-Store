import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Observable, catchError, retry, throwError } from "rxjs";

export class HttpRequestIntercept implements HttpInterceptor {
    intercept(
        req: HttpRequest<any>,
        next: HttpHandler
    ): Observable<HttpEvent<any>> {
        const retryNumber = 3;
        return next.handle(req)
            .pipe(
                retry(retryNumber),
                catchError((error: HttpErrorResponse) => {
                    let errorMessage = '';
                    if (error.status) {
                        errorMessage = `Error Status: ${error.status}\nMessage: ${error.message}`;
                    } else {
                        errorMessage = `Error: ${error.message}`;
                    }
                    console.log(errorMessage);
                    return throwError(() => error)
                }
                )
            )

    }
}