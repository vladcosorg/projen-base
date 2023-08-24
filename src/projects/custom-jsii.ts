import { RootProject } from './root-project'

import { getSharedOptions } from '../shared'

export class CustomJsii extends RootProject {
  constructor(options: any = {}) {
    super(getSharedOptions(options))
    this.addDeps('@vladcos/projen-base@../projen-base/')
    this.addPeerDeps('@vladcos/projen-base@../projen-base/')
  }
}
