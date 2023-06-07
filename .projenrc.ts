import { cdk } from 'projen'

import { RootProject } from './src/root-project'
import { preSynthesize, getSharedOptions, postSynthesize } from './src/shared'

const project = new RootProject({
  ...getSharedOptions(),
  author: 'Vlad Cos',
  authorAddress: 'vcosvic@gmail.com',
  jsiiVersion: '~5.0.0',
  name: '@chetzof/projen-base',
  repositoryUrl: 'https://github.com/chetzof/projen-base',
  peerDeps: ['projen'],
  deps: ['projen', 'projen-github-action-typescript'],
})

project.synth()
