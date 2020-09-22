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

class ProjectList {
  templateElement: HTMLTemplateElement;
  rootElement: HTMLDivElement;
  sectionElement: HTMLElement;
  constructor(private type: 'active' | 'finished') {
    this.templateElement = document.getElementById('project-list') as HTMLTemplateElement;
    this.rootElement = document.getElementById('app') as HTMLDivElement;

    const importedNode = document.importNode(this.templateElement.content, true);

    this.sectionElement = importedNode.firstElementChild as HTMLElement;
    this.sectionElement.id = `${this.type}-projects`;
    this.appendToRoot(this.sectionElement);
    this.renderContent();
  }

  private renderContent() {
    const listId = `${this.type}-projects-list`;
    this.sectionElement.querySelector('ul')!.id = listId;
    this.sectionElement.querySelector('h2')!.textContent = `${this.type.toUpperCase()} PROJECTS`;
  }

  private appendToRoot(element: HTMLElement) {
    this.rootElement.insertAdjacentElement('beforeend', element);
  }
}

class ProjectInput {
  templateElement: HTMLTemplateElement;
  rootElement: HTMLDivElement;
  formElement: HTMLFormElement;
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    this.templateElement = document.getElementById('project-input') as HTMLTemplateElement;
    this.rootElement = document.getElementById('app') as HTMLDivElement;

    const importedNode = document.importNode(this.templateElement.content, true);

    this.formElement = importedNode.firstElementChild as HTMLFormElement;
    this.formElement.id = 'user-input';

    this.titleInputElement = this.formElement.querySelector('#title') as HTMLInputElement;
    this.descriptionInputElement = this.formElement.querySelector('#description') as HTMLInputElement;
    this.peopleInputElement = this.formElement.querySelector('#people') as HTMLInputElement;

    this.configureListener();
    this.appendToRoot(this.formElement);
  }

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
      console.log(title, description, people);
      this.clearInputs();
    }
  }

  private configureListener() {
    this.formElement.addEventListener('submit', this.submitHandler);
  }

  private appendToRoot(element: HTMLElement) {
    this.rootElement.insertAdjacentElement('afterbegin', element);
  }
}

const projectInput = new ProjectInput();
const activeProjects = new ProjectList('active');
const finishedProjects = new ProjectList('finished');
