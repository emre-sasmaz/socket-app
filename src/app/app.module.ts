import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { HttpErrorInterceptor } from './core/interceptors/http.error.interceptor';
import { StreamDatePipe } from './core/pipes/stream.date.pipe';
import { MapPipe } from './core/pipes/map.pipe';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [AppComponent, StreamDatePipe, MapPipe],
  imports: [BrowserModule, BrowserAnimationsModule, FormsModule, ReactiveFormsModule, HttpClientModule],
  providers: [{ provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true }],
  bootstrap: [AppComponent],
})
export class AppModule {}
