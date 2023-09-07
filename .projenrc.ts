import { RootProject } from './src/projects/root-project'

const project = new (class extends RootProject {
  override preSynthesize() {
    super.preSynthesize()
  }
})({})

project.synth()
