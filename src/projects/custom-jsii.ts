import { RootProject } from './root-project'

export class CustomJsii extends RootProject {
  constructor(options: any = {}) {
    super(options)
    this.addDevDeps('@vladcos/projen-base')
  }
}
