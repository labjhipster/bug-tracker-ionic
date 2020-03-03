import { BaseEntity } from 'src/model/base-entity';
import { Project } from '../project/project.model';
import { User } from '../../../services/user/user.model';
import { Label } from '../label/label.model';

export class Ticket implements BaseEntity {
    constructor(
        public id?: number,
        public title?: string,
        public description?: string,
        public dueDate?: any,
        public done?: boolean,
        public project?: Project,
        public assignedTo?: User,
        public labels?: Label[],
    ) {
        this.done = false;
    }
}
