import { Component } from '@angular/core';
import { NavController, ToastController, Platform, IonItemSliding } from '@ionic/angular';
import { filter, map } from 'rxjs/operators';
import { HttpResponse } from '@angular/common/http';
import { Project } from './project.model';
import { ProjectService } from './project.service';

@Component({
    selector: 'page-project',
    templateUrl: 'project.html'
})
export class ProjectPage {
    projects: Project[];

    // todo: add pagination

    constructor(
        private navController: NavController,
        private projectService: ProjectService,
        private toastCtrl: ToastController,
        public plt: Platform
    ) {
        this.projects = [];
    }

    ionViewWillEnter() {
        this.loadAll();
    }

    async loadAll(refresher?) {
        this.projectService.query().pipe(
            filter((res: HttpResponse<Project[]>) => res.ok),
            map((res: HttpResponse<Project[]>) => res.body)
        )
        .subscribe(
            (response: Project[]) => {
                this.projects = response;
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

    trackId(index: number, item: Project) {
        return item.id;
    }

    new() {
        this.navController.navigateForward('/tabs/entities/project/new');
    }

    edit(item: IonItemSliding, project: Project) {
        this.navController.navigateForward('/tabs/entities/project/' + project.id + '/edit');
        item.close();
    }

    async delete(project) {
        this.projectService.delete(project.id).subscribe(async () => {
            const toast = await this.toastCtrl.create(
                {message: 'Project deleted successfully.', duration: 3000, position: 'middle'});
            toast.present();
            this.loadAll();
        }, (error) => console.error(error));
    }

    view(project: Project) {
        this.navController.navigateForward('/tabs/entities/project/' + project.id + '/view');
    }
}
