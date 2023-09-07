import { RootProject } from './root-project'

export class CustomJsii extends RootProject {
  constructor(options: any = {}) {
    super(options)
    this.addDeps('@vladcos/projen-base')
    // this.addPeerDeps('@vladcos/projen-base')
  }
}
