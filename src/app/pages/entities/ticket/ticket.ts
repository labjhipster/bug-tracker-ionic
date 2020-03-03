import { Component } from '@angular/core';
import { NavController, ToastController, Platform, IonItemSliding } from '@ionic/angular';
import { filter, map } from 'rxjs/operators';
import { HttpResponse } from '@angular/common/http';
import { Ticket } from './ticket.model';
import { TicketService } from './ticket.service';

@Component({
    selector: 'page-ticket',
    templateUrl: 'ticket.html'
})
export class TicketPage {
    tickets: Ticket[];

    // todo: add pagination

    constructor(
        private navController: NavController,
        private ticketService: TicketService,
        private toastCtrl: ToastController,
        public plt: Platform
    ) {
        this.tickets = [];
    }

    ionViewWillEnter() {
        this.loadAll();
    }

    async loadAll(refresher?) {
        this.ticketService.query().pipe(
            filter((res: HttpResponse<Ticket[]>) => res.ok),
            map((res: HttpResponse<Ticket[]>) => res.body)
        )
        .subscribe(
            (response: Ticket[]) => {
                this.tickets = response;
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

    trackId(index: number, item: Ticket) {
        return item.id;
    }

    new() {
        this.navController.navigateForward('/tabs/entities/ticket/new');
    }

    edit(item: IonItemSliding, ticket: Ticket) {
        this.navController.navigateForward('/tabs/entities/ticket/' + ticket.id + '/edit');
        item.close();
    }

    async delete(ticket) {
        this.ticketService.delete(ticket.id).subscribe(async () => {
            const toast = await this.toastCtrl.create(
                {message: 'Ticket deleted successfully.', duration: 3000, position: 'middle'});
            toast.present();
            this.loadAll();
        }, (error) => console.error(error));
    }

    view(ticket: Ticket) {
        this.navController.navigateForward('/tabs/entities/ticket/' + ticket.id + '/view');
    }
}
