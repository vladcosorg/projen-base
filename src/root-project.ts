import { cdk } from 'projen'

export class RootProject extends cdk.JsiiProject {
  constructor(options: cdk.JsiiProjectOptions) {
    super(options)
  }

  synth() {
    super.synth()
  }

  postSynthesize() {
    super.postSynthesize()

  }
}
