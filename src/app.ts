class ProjectInput {
  templateElement: HTMLTemplateElement;
  rootElement: HTMLDivElement;
  formElement: HTMLFormElement;

  constructor() {
    this.templateElement = document.getElementById(
      'project-input'
    ) as HTMLTemplateElement;
    this.rootElement = document.getElementById('app') as HTMLDivElement;

    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );
    this.formElement = importedNode.firstElementChild as HTMLFormElement;
    this.appendToRoot(this.formElement);
  }

  private appendToRoot(el: HTMLElement) {
    this.rootElement.insertAdjacentElement('afterbegin', el);
  }
}

const projectInput = new ProjectInput();
