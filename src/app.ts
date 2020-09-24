/// <reference="./ProjectModel.ts" />
/// <reference="./DragAndDropModel.ts" />

namespace App {
  type Listener<T> = (projects: T[]) => void;

  interface Validatable {
    value: string | number;
    required?: boolean;
    maxLength?: number;
    minLength?: number;
    maxValue?: number;
    minValue?: number;
  }

  const validate = (validatable: Validatable): boolean => {
    const { value, required, maxLength, minLength, maxValue, minValue } = validatable;
    let isValid = true;

    if (required) {
      isValid = isValid && value.toString().length !== 0;
    }

    if (typeof value === 'string' && maxLength != null) {
      isValid = isValid && value.length <= maxLength;
    }

    if (typeof value === 'string' && minLength != null) {
      isValid = isValid && value.length >= minLength;
    }

    if (typeof value === 'number' && maxValue != null) {
      isValid = isValid && value <= maxValue;
    }

    if (typeof value === 'number' && minValue != null) {
      isValid = isValid && value >= minValue;
    }

    return isValid;
  };

  const Autobind = (_target: any, _methodName: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    const adjustedDescriptor: PropertyDescriptor = {
      configurable: true,
      get() {
        return originalMethod.bind(this);
      },
    };
    return adjustedDescriptor;
  };

  abstract class State<T> {
    protected listeners: Listener<T>[] = [];

    addListener(listenerFunction: Listener<T>) {
      this.listeners.push(listenerFunction);
    }
  }

  class ProjectState extends State<Project> {
    private projects: Project[] = [];
    private static instance: ProjectState;

    private constructor() {
      super();
    }

    static getInstance() {
      if (this.instance) {
        return this.instance;
      } else {
        this.instance = new ProjectState();
        return this.instance;
      }
    }

    addProject(title: string, description: string, people: number) {
      const project = new Project((Math.random() * 1000).toFixed(0), title, description, people, ProjectStatus.Active);
      this.projects.push(project);
      this.triggerListeners();
    }

    updateProjectState(projectId: string, newStatus: ProjectStatus) {
      const project = this.projects.find((project) => project.id === projectId);

      if (project && project.status !== newStatus) {
        project.status = newStatus;
        this.triggerListeners();
      }
    }

    private triggerListeners() {
      this.listeners.forEach((listenerFn) => {
        listenerFn(this.projects.slice());
      });
    }
  }

  const projectState = ProjectState.getInstance();

  abstract class Component<T extends HTMLElement, U extends HTMLElement> {
    templateElement: HTMLTemplateElement;
    rootElement: T;
    element: U;

    constructor(templateId: string, rootElementId: string, insertAfterBegin: boolean, elementId?: string) {
      this.templateElement = document.getElementById(templateId) as HTMLTemplateElement;
      this.rootElement = document.getElementById(rootElementId) as T;

      const importedNode = document.importNode(this.templateElement.content, true);

      this.element = importedNode.firstElementChild as U;
      if (elementId) this.element.id = elementId;

      this.appendToRoot(this.element, insertAfterBegin);
    }

    private appendToRoot(element: HTMLElement, afterBegin: boolean) {
      this.rootElement.insertAdjacentElement(afterBegin ? 'afterbegin' : 'beforeend', element);
    }

    abstract configureListener(): void;
    abstract renderContent(): void;
  }

  class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable {
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

  class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
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
      projectState.updateProjectState(
        projectId,
        this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished
      );

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

  class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;

    constructor() {
      super('project-input', 'app', true, 'user-input');
      this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement;
      this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement;
      this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement;
      this.configureListener();
    }

    configureListener() {
      this.element.addEventListener('submit', this.submitHandler);
    }

    renderContent() {}

    private clearInputs() {
      this.titleInputElement.value = '';
      this.descriptionInputElement.value = '';
      this.peopleInputElement.value = '';
    }

    private getUserInput(): [string, string, number] | void {
      const titleInput = this.titleInputElement.value.trim();
      const descriptionInput = this.descriptionInputElement.value.trim();
      const peopleInput = this.peopleInputElement.value.trim();

      const titleInputValidatable: Validatable = { value: titleInput, required: true, minLength: 4 };
      const descriptionInputValidatable: Validatable = {
        value: descriptionInput,
        required: true,
        minLength: 8,
        maxLength: 120,
      };
      const peopleInputValidatable: Validatable = { value: +peopleInput, required: true, minValue: 1, maxValue: 8 };

      if (
        validate(titleInputValidatable) &&
        validate(descriptionInputValidatable) &&
        validate(peopleInputValidatable)
      ) {
        return [titleInput, descriptionInput, Number(peopleInput)];
      } else {
        alert('Please enter valid data');
      }
    }

    @Autobind
    private submitHandler(event: Event) {
      event.preventDefault();
      const userInput = this.getUserInput();

      if (Array.isArray(userInput)) {
        const [title, description, people] = userInput;
        projectState.addProject(title, description, people);
        this.clearInputs();
      }
    }
  }

  new ProjectInput();
  new ProjectList('active');
  new ProjectList('finished');
}
