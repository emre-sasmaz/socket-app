import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { webSocket } from 'rxjs/webSocket';
import { DataModel, INTERVAL_OPT } from '../models/stream.models';

const WS_URL: string = 'ws://spring-boot-esen.herokuapp.com/data/esen';
const START_URL: string = 'https://spring-boot-esen.herokuapp.com/api/stream/start/';
const STOP_URL: string = 'https://spring-boot-esen.herokuapp.com/api/stream/stop';

@Injectable({
  providedIn: 'root',
})
export class StreamService {
  webSocketSubject$ = webSocket<DataModel[]>({
    url: WS_URL,
    deserializer: (e) => {
      let res: DataModel[] = [];
      try {
        res = JSON.parse(e.data);
      } catch (e) {}
      return res;
    },
  });

  constructor(private http: HttpClient) {}

  startStream(interval: number) {
    return this.http.post<boolean>(START_URL + (interval ?? INTERVAL_OPT.startingInt), null);
  }

  stopStream() {
    return this.http.post(STOP_URL, null, { responseType: 'text' });
  }
}
