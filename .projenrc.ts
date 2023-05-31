import { cdk } from 'projen'

import { applyProjectChanges, getSharedOptions } from './src/shared'

const project = new cdk.JsiiProject({
  ...getSharedOptions(),
  author: 'Vlad Cos',
  authorAddress: 'vcosvic@gmail.com',
  defaultReleaseBranch: 'main',
  jsiiVersion: '~5.0.0',
  name: 'projen-base',
  repositoryUrl: 'https://github.com/chetzof/projen-base',
  peerDeps: ['projen'],
  deps: ['projen'],
})
applyProjectChanges(project)
project.synth()
