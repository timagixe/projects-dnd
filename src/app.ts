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

  @Autobind
  private submitHandler(event: Event) {
    event.preventDefault();
    console.log(this.titleInputElement.value);
  }

  private configureListener() {
    this.formElement.addEventListener('submit', this.submitHandler);
  }

  private appendToRoot(el: HTMLElement) {
    this.rootElement.insertAdjacentElement('afterbegin', el);
  }
}

const projectInput = new ProjectInput();
