import { cdk } from 'projen'

import { preSynthesize, postSynthesize, getSharedOptions } from '../shared'

export class RootProject extends cdk.JsiiProject {
  constructor(options: any = {}) {
    super(
      getSharedOptions({
        defaultReleaseBranch: 'main',
        disableTsconfig: true,
        tsconfigDevFile: 'tsconfig.dev.json',
        author: 'Vlad Cos',
        authorAddress: 'vcosvic@gmail.com',
        jsiiVersion: '~5.0.0',
        name: '@vladcos/projen-base',
        repositoryUrl: 'https://github.com/chetzof/projen-base',
        tsconfigDev: {
          compilerOptions: {},
          include: ['templates/**/*.ts'],
        },
        depsUpgradeOptions: {
          satisfyPeerDependencies: false,
          exclude: ['@vladcos/projen-base', 'projen'],
        },
        bundledDeps: [
          'lodash',
          '@types/lodash',
          'type-fest',
          'app-root-path',
          // 'zod-to-json-schema',
          // 'zod',
          // 'replace-in-file',
          // 'vitest',
        ],
        // deps: ['projen@^0.73.9'],
        ...options,
      }),
    )
    const cmd =
      'npx npm-check-updates --upgrade --target=minor --no-peer --dep=dev,peer,prod,optional --filter=projen,@vladcos/projen-base'
    this.upgradeWorkflow?.postUpgradeTask.exec(cmd)
    this.upgradeWorkflow?.postUpgradeTask.exec(cmd)
    this.upgradeWorkflow?.postUpgradeTask.exec(
      'npm update projen @vladcos/projen-base',
    )
    this.upgradeWorkflow?.postUpgradeTask.exec('npx projen')
    this.upgradeWorkflow?.postUpgradeTask.exec('npm install')
  }
  override preSynthesize() {
    preSynthesize(this)
    super.preSynthesize()
  }

  override postSynthesize() {
    super.postSynthesize()
    postSynthesize(this)
  }
}
