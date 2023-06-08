import { cdk } from 'projen'

import { postSynthesize, preSynthesize } from './shared'

export class RootProject extends cdk.JsiiProject {
  preSynthesize() {
    preSynthesize(this)
    super.preSynthesize()
  }

  postSynthesize() {
    super.postSynthesize()
    postSynthesize(this)
  }
}
