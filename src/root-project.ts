import { cdk } from 'projen'
import { postSynthesize, preSynthesize } from './shared'

export class RootProject extends cdk.JsiiProject {
  constructor(options: cdk.JsiiProjectOptions) {
    super(options)
  }

  preSynthesize() {
    preSynthesize(this)
    super.preSynthesize()
  }

  synth() {
    super.synth()
  }

  postSynthesize() {
    super.postSynthesize()
    postSynthesize(this)
  }
}
