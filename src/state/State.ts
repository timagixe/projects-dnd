namespace App {
  export type Listener<T> = (projects: T[]) => void;

  export abstract class State<T> {
    protected listeners: Listener<T>[] = [];

    addListener(listenerFunction: Listener<T>) {
      this.listeners.push(listenerFunction);
    }
  }
}
