/// <reference path="./components/ProjectInput.ts"/>
/// <reference path="./components/ProjectList.ts"/>

namespace App {
  new ProjectInput();
  new ProjectList('active');
  new ProjectList('finished');
}
