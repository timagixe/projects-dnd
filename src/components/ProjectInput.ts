import { Autobind } from '../decorators/Autobind.js';
import { projectState } from '../state/ProjectState.js';
import { Validatable, validate } from '../utils/Validate.js';
import { Component } from './Component.js';

export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
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

    if (validate(titleInputValidatable) && validate(descriptionInputValidatable) && validate(peopleInputValidatable)) {
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
