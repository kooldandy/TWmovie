import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';

interface Movies {
    movie_title: any;
    director_name: any;
    actor_1_name: any;
    actor_2_name: any;
    genres: any;
    language: any;
    country: any;
    content_rating: any;
    budget: any;
    title_year: any;
    plot_keywords: any;
    movie_imdb_link: any;
}

@Injectable()
export class BackendService {
  constructor(private http: HttpClient) { }

  getData(url: any): Observable<Movies> {
    return this.http.get<Movies>(url)
    .pipe(
        map((res: any) => res)
    );
  }
}
