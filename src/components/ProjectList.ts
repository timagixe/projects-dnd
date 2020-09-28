import { Autobind } from '../decorators/Autobind';
import { DragTarget } from '../models/DragAndDrop';
import { Project, ProjectStatus } from '../models/Project';
import { projectState } from '../state/ProjectState';
import { Component } from './Component';
import { ProjectItem } from './ProjectItem';

export class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
  assignedProjects: Project[] = [];

  constructor(private type: 'active' | 'finished') {
    super('project-list', 'app', false, `${type}-projects`);
    this.configureListener();
    this.renderContent();
  }

  @Autobind
  dragOver(event: DragEvent) {
    if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
      event.preventDefault();
      const listElement = this.element.querySelector('ul')!;
      listElement.classList.add('droppable');
    }
  }

  @Autobind
  dragLeave(_: DragEvent) {
    const listElement = this.element.querySelector('ul')!;
    listElement.classList.remove('droppable');
  }

  @Autobind
  dropItem(event: DragEvent) {
    const projectId = event.dataTransfer!.getData('text/plain');
    projectState.updateProjectState(projectId, this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished);

    const listElement = this.element.querySelector('ul')!;
    listElement.classList.remove('droppable');
  }

  configureListener() {
    this.element.addEventListener('dragover', this.dragOver);
    this.element.addEventListener('dragleave', this.dragLeave);
    this.element.addEventListener('drop', this.dropItem);

    projectState.addListener((projects: Project[]) => {
      const relevantProjects = projects.filter((project) =>
        this.type === 'active' ? project.status === ProjectStatus.Active : project.status === ProjectStatus.Finished
      );
      this.assignedProjects = relevantProjects;
      this.renderProjects();
    });
  }

  renderContent() {
    const listId = `${this.type}-projects-list`;
    this.element.querySelector('ul')!.id = listId;
    this.element.querySelector('h2')!.textContent = `${this.type.toUpperCase()} PROJECTS`;
  }

  private renderProjects() {
    const listElement = document.getElementById(`${this.type}-projects-list`) as HTMLUListElement;
    listElement.innerHTML = '';
    this.assignedProjects.forEach((project) => {
      new ProjectItem(this.element.querySelector('ul')!.id, project);
    });
  }
}
