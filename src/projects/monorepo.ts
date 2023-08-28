import { TypeScriptProject } from './typescript'

import type { typescript } from 'projen'

export class Monorepo extends TypeScriptProject {
  constructor(options: typescript.TypeScriptProjectOptions) {
    super({
      sampleCode: false,
      disableTsconfig: true,
      tsconfigDevFile: 'tsconfig.json',
      ...options,
    })
    this.package.addField('workspaces', ['./packages/*'])
    this.package.addField('private', true)
    this.tsconfigDev.file.addDeletionOverride('include')
    this.tsconfigDev.file.addDeletionOverride('files')
    this.tsconfigDev.file.addDeletionOverride('exclude')
  }
}
