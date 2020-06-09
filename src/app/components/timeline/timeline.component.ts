import {Component, OnInit} from '@angular/core';
import {Router, ActivatedRoute, Params} from '@angular/router';
import {Publication} from '../../models/publication';
import {GLOBAL} from '../../services/global';
import {UserService} from '../../services/user.service';
import {PublicationService} from '../../services/publication.service';
import { forkJoin, of } from 'rxjs';

@Component({
    selector: 'timeline',
    templateUrl: './timeline.component.html',
    providers: [UserService, PublicationService]
})
export class TimelineComponent implements OnInit {
    public identity;
    public token;
    public title: string;
    public url: string;
    public status: string;
    public page;
    public total;
    public pages;
    public itemsPerPage;
    public publications: Publication[];
    public showImage;

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private _userService: UserService,
        private _publicationService: PublicationService
    ) {
        this.title = 'Timeline';
        this.identity = this._userService.getIdentity();
        this.token = this._userService.getToken();
        this.url = GLOBAL.url;
        this.page = 1;
    }

    ngOnInit() {
        console.log('[OK] Component: timeline.');
        this.getPublications(this.page);
    }

    getPublications(page, adding = false) {
        forkJoin( // Esto sirve para concadenar observers
            this._publicationService.getPublication(this.token, page),
            of([{user_id: 1, publication_id: 2}, {user_id: 1, publication_id: 3} ]) // TODO: aquí tengo que crear this._publicationService.getLikes que hará la petición al backend
        ).subscribe(
            ([resPubs, respLikes]) => { // Aquí se obtiene la respuesta de cada observer, en el mismo orden que está arriba                
                console.log(respLikes); // TODO: comprueba los datos
                if (resPubs.publications) { //BUSCAR ID DE USUARIO EN LA PUBLICACION
                    const pubs = resPubs.publications.map( pub => {
                        // EXPLAIN: aquí lo que estoy haciendo es recorrer todas las publicaciones y comprobar cada una si tiene like o no
                        // TODO: comprueba que el valor es true o false;
                       // pub.hasLike = (respLikes.find( like => like.publication_id == pub._id))
                      //  console.log(pub.hasLike)
                        return pub;
                    });
                    this.total = resPubs.total_items;
                    this.pages = resPubs.pages;
                    this.itemsPerPage = resPubs.item_per_page;
                    if (!adding) {
                        this.publications = pubs;
                    } else {
                        var arrayA = this.publications;
                        var arrayB = pubs;
                        this.publications = arrayA.concat(arrayB);
                        $("html, body").animate({scrollTop: $('body').prop("scrollHeight")}, 500);
                    }
                    if (page > this.pages) {
                        //this._router.navigate(['/home']);
                    }
                } else {
                    this.status = 'error';
                }
            },
            error => {
                var errorMessage = <any>error;
                console.log(errorMessage);

                if (errorMessage != null) {
                    this.status = 'error';
                }
            }
        );
    }

    public noMore = false;

    viewMore() {
        this.page += 1;
        if (this.page == this.pages) {
            this.noMore = true;
        }
        this.getPublications(this.page, true);
    }

    refresh(event = null) {
        this.getPublications(1);
    }

    showThisImage(id) {
        this.showImage = id;
    }

    hideThisImage() {
        this.showImage = 0;
    }

    deletePublication(id) {
        this._publicationService.deletePublication(this.token, id).subscribe(
            response => {
                this.refresh();
            },
            error => {
                console.log(<any>error);
            }
        );
    }
}
