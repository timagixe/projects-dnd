import { Autobind } from '../decorators/Autobind';
import { Draggable } from '../models/DragAndDrop';
import { Project } from '../models/Project';
import { Component } from './Component';

export class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable {
  project: Project;

  constructor(templatedId: string, project: Project) {
    super('single-project', templatedId, false, project.id);
    this.project = project;

    this.configureListener();
    this.renderContent();
  }

  get persons() {
    return this.project.people > 1 ? `${this.project.people} persons` : `${this.project.people} person`;
  }

  @Autobind
  dragStart(event: DragEvent) {
    event.dataTransfer!.setData('text/plain', this.project.id);
    event.dataTransfer!.effectAllowed = 'move';
  }

  @Autobind
  dragEnd(_: DragEvent) {
    console.log('Drag End');
  }

  configureListener() {
    this.element.addEventListener('dragstart', this.dragStart);
    this.element.addEventListener('dragend', this.dragEnd);
  }

  renderContent() {
    this.element.querySelector('h2')!.innerText = this.project.title;
    this.element.querySelector('h3')!.innerText = `Assigned to ${this.persons}`;
    this.element.querySelector('p')!.innerText = this.project.description;
  }
}
