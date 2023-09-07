import { RootProject } from './root-project'

export class CustomJsii extends RootProject {
  constructor(options: any = {}) {
    super(options)
    // this.addDeps('@vladcos/projen-base@^0.0')
    this.addPeerDeps('@vladcos/projen-base@^0.0')
  }
}
