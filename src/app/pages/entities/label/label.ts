import { Component } from '@angular/core';
import { NavController, ToastController, Platform, IonItemSliding } from '@ionic/angular';
import { filter, map } from 'rxjs/operators';
import { HttpResponse } from '@angular/common/http';
import { Label } from './label.model';
import { LabelService } from './label.service';

@Component({
    selector: 'page-label',
    templateUrl: 'label.html'
})
export class LabelPage {
    labels: Label[];

    // todo: add pagination

    constructor(
        private navController: NavController,
        private labelService: LabelService,
        private toastCtrl: ToastController,
        public plt: Platform
    ) {
        this.labels = [];
    }

    ionViewWillEnter() {
        this.loadAll();
    }

    async loadAll(refresher?) {
        this.labelService.query().pipe(
            filter((res: HttpResponse<Label[]>) => res.ok),
            map((res: HttpResponse<Label[]>) => res.body)
        )
        .subscribe(
            (response: Label[]) => {
                this.labels = response;
                if (typeof(refresher) !== 'undefined') {
                    setTimeout(() => {
                        refresher.target.complete();
                    }, 750);
                }
            },
            async (error) => {
                console.error(error);
                const toast = await this.toastCtrl.create({message: 'Failed to load data', duration: 2000, position: 'middle'});
                toast.present();
            });
    }

    trackId(index: number, item: Label) {
        return item.id;
    }

    new() {
        this.navController.navigateForward('/tabs/entities/label/new');
    }

    edit(item: IonItemSliding, label: Label) {
        this.navController.navigateForward('/tabs/entities/label/' + label.id + '/edit');
        item.close();
    }

    async delete(label) {
        this.labelService.delete(label.id).subscribe(async () => {
            const toast = await this.toastCtrl.create(
                {message: 'Label deleted successfully.', duration: 3000, position: 'middle'});
            toast.present();
            this.loadAll();
        }, (error) => console.error(error));
    }

    view(label: Label) {
        this.navController.navigateForward('/tabs/entities/label/' + label.id + '/view');
    }
}
