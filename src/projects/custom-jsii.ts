import { RootProject } from './root-project'

export class CustomJsii extends RootProject {
  constructor(options: any = {}) {
    super(options)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const version = require('../../package.json').version
    this.addDevDeps(`@vladcos/projen-base@${version}`)
    this.addPeerDeps(`@vladcos/projen-base@${version}`)
  }
}
