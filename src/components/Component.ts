export abstract class Component<T extends HTMLElement, U extends HTMLElement> {
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
