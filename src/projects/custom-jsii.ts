import { RootProject } from './root-project'

export class CustomJsii extends RootProject {
  constructor(options: any = {}) {
    super(options)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    this.addPeerDeps(`@vladcos/projen-base`)
  }
}
