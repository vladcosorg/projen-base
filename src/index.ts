import { typescript } from 'projen'

import { applyProjectChanges, getSharedOptions } from './shared'

export class ProjenBase extends typescript.TypeScriptProject {
  constructor(options: typescript.TypeScriptProjectOptions) {
    options = {
      ...getSharedOptions(),
      ...options,
    }
    super(options)
    applyProjectChanges(this)
  }
}
