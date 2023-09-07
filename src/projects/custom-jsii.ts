import { RootProject } from './root-project'

export class CustomJsii extends RootProject {
  constructor(options: any = {}) {
    super(options)
    this.addDeps('@vladcos/projen-base@latest')
    this.addPeerDeps('@vladcos/projen-base@latest')
  }
}
