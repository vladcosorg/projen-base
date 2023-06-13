import { typescript } from 'projen'

import { getSharedOptions, preSynthesize, postSynthesize } from '../shared'

export interface TypeScriptProjectOptions
  extends typescript.TypeScriptProjectOptions {
  readonly tsconfigTemplatePath?: string
}

export class TypeScriptProject extends typescript.TypeScriptProject {
  public readonly tsconfigTemplatePath?: string

  constructor(options: TypeScriptProjectOptions) {
    super(getSharedOptions(options))

    this.tsconfigTemplatePath = options.tsconfigTemplatePath
  }

  preSynthesize() {
    super.preSynthesize()
    preSynthesize(this)
  }

  postSynthesize() {
    super.postSynthesize()
    postSynthesize(this)
  }
}
