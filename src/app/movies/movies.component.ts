import { Component, OnInit, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { Observable, fromEvent } from 'rxjs';
import { map, debounceTime, distinctUntilChanged, filter, tap } from 'rxjs/operators';
import { BackendService } from '../backend/backend.service';

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

@Component({
    selector: 'app-movie',
    templateUrl: './movies.component.html'
})


export class MoviesComponent implements OnInit {
    static FULLMOVIES;
    @ViewChild('moviename') seachInput: ElementRef;
    private url: any;
    moviesArray: Array<any>;
    private _dataListArr: Array<string>;
    _movieYearsArr;
    _movieLangArr;
    isAutoComp: boolean;
    dataListArr;
    isLoading: boolean;

    constructor(private bkSvc: BackendService) {
        this.url = 'http://starlord.hackerearth.com/movieslisting';
        this.moviesArray = [];
        this._movieYearsArr = [''];
        this._movieLangArr = [''];
        this.isAutoComp = false;
        this._dataListArr = [];
        this.dataListArr = [];
        this.isLoading = true;
    }

    ngOnInit() {
        this.bkSvc.getData(this.url)
            .subscribe((data: any) => {
                this.moviesArray = (!!data && data.length > 0) ? data : null;
                MoviesComponent.FULLMOVIES = JSON.parse(JSON.stringify(this.moviesArray));
                this.moviesArray.forEach((m: Movies) => {
                    if ((this._movieYearsArr.indexOf(m.title_year) < 0) && m.title_year.trim() !== '') {
                        this._movieYearsArr.push(m.title_year);
                    }
                    if ((this._movieLangArr.indexOf(m.language) < 0) && m.language.trim() !== '') {
                        this._movieLangArr.push(m.language);
                    }
                    this._dataListArr.push(m.movie_title.trim());
                });
                this._movieYearsArr = this._movieYearsArr.sort((a, b) => {
                    return a - b;
                });
                this.isLoading = false;
            },
                (error: any) => {
                    console.error(error);
                });

        const keyword = fromEvent(this.seachInput.nativeElement, 'input')
            .pipe(
                map((e: KeyboardEvent) => e.target['value']),
                tap(text => this.isAutoComp = (text.length < 3) ? false : true),
                filter(text => text.length > 2),
                debounceTime(1000)
            )
            .subscribe(val => {
                this.isAutoComp = true;
                this.typeAhead(val.trim().toLowerCase());
            });
    }

    filter() {
        this.isLoading = true;
        let arr: Array<any> = [];
        const filterYr = (<any>document.querySelector('#filteryr')).options[(<any>document.querySelector('#filteryr')).selectedIndex].value.trim().toLowerCase();;
        const filterLang = (<any>document.querySelector('#filterlang')).options[(<any>document.querySelector('#filterlang')).selectedIndex].value.trim().toLowerCase();;

        (<any>document.querySelector('#sortingrat')).innerHTML = '↑';
        (<any>document.querySelector('#sortingyr')).innerHTML = '↑';

        this.moviesArray = JSON.parse(JSON.stringify(MoviesComponent.FULLMOVIES));

        arr = this.moviesArray.filter((m: Movies) => {
            if (filterYr !== '' && filterLang !== '') {
                return (m.language.toLowerCase() === filterLang && m.title_year === filterYr);
            }
            else if (filterLang !== '') {
                return (m.language.toLowerCase() === filterLang);
            }
            else if (filterYr !== '') {
                return (m.title_year === filterYr);
            }
        });
        this.moviesArray = arr;
        this.isLoading = false;
    }

    sorting(e: any, name: any) {
        this.isLoading = true;
        e.target.innerHTML = (e.target.innerHTML === '↑') ? '&darr;' : '&uarr;';

        this.moviesArray = this.moviesArray.sort((a, b) => {
            if (name === 'rating') {
                return (e.target.innerHTML === '↑') ? (a.content_rating - b.content_rating) : (b.content_rating - a.content_rating);
            }
            if (name === 'year') {
                return (e.target.innerHTML === '↑') ? (a.title_year - b.title_year) : (b.title_year - a.title_year);
            }
        });
        this.isLoading = false;
    }

    search(movietile) {
        this.isLoading = true;
        movietile = movietile.value;
        if (movietile.trim() === '') {
            this.isLoading = false;
            return;
        }
        this.moviesArray = JSON.parse(JSON.stringify(MoviesComponent.FULLMOVIES));
        this.moviesArray = this.moviesArray.filter((m: Movies) => {
            return (m.movie_title.trim().toLowerCase() === movietile.trim().toLowerCase());
        });
        (<any>document.querySelector('#filteryr')).options[0].selected = 'selected';
        (<any>document.querySelector('#filterlang')).options[0].selected = 'selected';
        (<any>document.querySelector('#sortingrat')).innerHTML = '↑';
        (<any>document.querySelector('#sortingyr')).innerHTML = '↑';
        this.isLoading = false;
    }
    reset() {
        this.moviesArray = JSON.parse(JSON.stringify(MoviesComponent.FULLMOVIES));
        this.dataListArr = [];
        this.seachInput.nativeElement.value = '';
        (<any>document.querySelector('#filteryr')).options[0].selected = 'selected';
        (<any>document.querySelector('#filterlang')).options[0].selected = 'selected';
        return;
    }

    private typeAhead(text: any) {
        const tempArr = [];
        this._dataListArr.forEach((m: string) => {
            if ((m.toLowerCase().indexOf(text)) > -1) {
                tempArr.push({name: m, index: m.toLowerCase().indexOf(text)});
            }
        });

        tempArr.sort((a: any, b: any) => {
            return (a.index - b.index);
        });
        tempArr.forEach((a: any, b: any) => {
            return (a.index - b.index);
        });

        this.dataListArr = (tempArr.length > 0 ) ? [] : this.dataListArr;
        for (const item of tempArr) {
            this.dataListArr.push(item.name);
            if (this.dataListArr.length === 10) {
                break;
            }
        }
    }
}

