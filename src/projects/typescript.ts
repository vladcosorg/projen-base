import { typescript } from 'projen'

import { Vitest } from '../components/vitest'
import { getSharedOptions, preSynthesize, postSynthesize } from '../shared'

import type { VitestOptions } from '../components/vitest'

export { Vitest, VitestOptions } from '../components/vitest'
export interface TypeScriptProjectOptions
  extends typescript.TypeScriptProjectOptions {
  readonly tsconfigTemplatePath?: string
  readonly vitest?: VitestOptions
}

export class TypeScriptProject extends typescript.TypeScriptProject {
  public readonly tsconfigTemplatePath?: string
  public readonly vitest?: Vitest

  constructor(options: TypeScriptProjectOptions) {
    super(getSharedOptions(options))

    this.tsconfigTemplatePath = options.tsconfigTemplatePath
    if (options.vitest) {
      this.vitest = new Vitest(this, options.vitest)
    }
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
