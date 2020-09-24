/// <reference path="./State.ts"/>

namespace App {
  export class ProjectState extends State<Project> {
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

  export const projectState = ProjectState.getInstance();
}
