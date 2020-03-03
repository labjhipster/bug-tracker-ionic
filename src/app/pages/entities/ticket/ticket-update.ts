import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { NavController, Platform, ToastController } from '@ionic/angular';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { Ticket } from './ticket.model';
import { TicketService } from './ticket.service';
import { Project, ProjectService } from '../project';
import { User } from '../../../services/user/user.model';
import { UserService } from '../../../services/user/user.service';
import { Label, LabelService } from '../label';

@Component({
    selector: 'page-ticket-update',
    templateUrl: 'ticket-update.html'
})
export class TicketUpdatePage implements OnInit {

    ticket: Ticket;
    projects: Project[];
    users: User[];
    labels: Label[];
    dueDateDp: any;
    isSaving = false;
    isNew = true;
    isReadyToSave: boolean;

    form = this.formBuilder.group({
        id: [],
        title: [null, [Validators.required]],
        description: [null, []],
        dueDate: [null, []],
        done: ['false', []],
        project: [null, []],
        assignedTo: [null, []],
          labels: [null, []],
    });

    constructor(
        protected activatedRoute: ActivatedRoute,
        protected navController: NavController,
        protected formBuilder: FormBuilder,
        public platform: Platform,
        protected toastCtrl: ToastController,
        private projectService: ProjectService,
        private userService: UserService,
        private labelService: LabelService,
        private ticketService: TicketService
    ) {

        // Watch the form for changes, and
        this.form.valueChanges.subscribe((v) => {
            this.isReadyToSave = this.form.valid;
        });

    }

    ngOnInit() {
        this.projectService.query()
            .subscribe(data => { this.projects = data.body; }, (error) => this.onError(error));
        this.userService.findAll().subscribe(data => this.users = data, (error) => this.onError(error));
        this.labelService.query()
            .subscribe(data => { this.labels = data.body; }, (error) => this.onError(error));
        this.activatedRoute.data.subscribe((response) => {
            this.updateForm(response.data);
            this.ticket = response.data;
            this.isNew = this.ticket.id === null || this.ticket.id === undefined;
        });
    }

    updateForm(ticket: Ticket) {
        this.form.patchValue({
            id: ticket.id,
            title: ticket.title,
            description: ticket.description,
            dueDate: ticket.dueDate,
            done: ticket.done,
            project: ticket.project,
            assignedTo: ticket.assignedTo,
            labels: ticket.labels,
        });
    }

    save() {
        this.isSaving = true;
        const ticket = this.createFromForm();
        if (!this.isNew) {
            this.subscribeToSaveResponse(this.ticketService.update(ticket));
        } else {
            this.subscribeToSaveResponse(this.ticketService.create(ticket));
        }
    }

    protected subscribeToSaveResponse(result: Observable<HttpResponse<Ticket>>) {
        result.subscribe((res: HttpResponse<Ticket>) => this.onSaveSuccess(res), (res: HttpErrorResponse) => this.onError(res.error));
    }

    async onSaveSuccess(response) {
        let action = 'updated';
        if (response.status === 201) {
          action = 'created';
        }
        this.isSaving = false;
        const toast = await this.toastCtrl.create({message: `Ticket ${action} successfully.`, duration: 2000, position: 'middle'});
        toast.present();
        this.navController.navigateBack('/tabs/entities/ticket');
    }

    previousState() {
        window.history.back();
    }

    async onError(error) {
        this.isSaving = false;
        console.error(error);
        const toast = await this.toastCtrl.create({message: 'Failed to load data', duration: 2000, position: 'middle'});
        toast.present();
    }

    private createFromForm(): Ticket {
        return {
            ...new Ticket(),
            id: this.form.get(['id']).value,
            title: this.form.get(['title']).value,
            description: this.form.get(['description']).value,
            dueDate: this.form.get(['dueDate']).value,
            done: this.form.get(['done']).value,
            project: this.form.get(['project']).value,
            assignedTo: this.form.get(['assignedTo']).value,
            labels: this.form.get(['labels']).value,
        };
    }

    compareProject(first: Project, second: Project): boolean {
        return first && second ? first.id === second.id : first === second;
    }

    trackProjectById(index: number, item: Project) {
        return item.id;
    }
    compareUser(first: User, second: User): boolean {
        return first && second ? first.id === second.id : first === second;
    }

    trackUserById(index: number, item: User) {
        return item.id;
    }
    compareLabel(first: Label, second: Label): boolean {
        return first && second ? first.id === second.id : first === second;
    }

    trackLabelById(index: number, item: Label) {
        return item.id;
    }
}
