import { cdk, github } from 'projen'
import { NpmAccess } from 'projen/lib/javascript'

import { applyProjectChanges, getSharedOptions } from './src/shared'

const project = new cdk.JsiiProject({
  ...getSharedOptions(),
  author: 'Vlad Cos',
  authorAddress: 'vcosvic@gmail.com',
  defaultReleaseBranch: 'main',
  jsiiVersion: '~5.0.0',
  npmAccess: NpmAccess.PUBLIC,
  autoApproveUpgrades: true,
  autoApproveOptions: {
    allowedUsernames: ['myappchetzof'],
  },
  projenCredentials: github.GithubCredentials.fromApp(),
  name: '@chetzof/projen-base',
  repositoryUrl: 'https://github.com/chetzof/projen-base',
  peerDeps: ['projen'],
  deps: ['projen', 'projen-github-action-typescript'],
})
project.testTask.reset()
applyProjectChanges(project)
project.synth()
