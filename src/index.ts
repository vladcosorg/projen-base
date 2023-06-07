import * as path from 'node:path'

import { typescript } from 'projen'
import { GitHubActionTypeScriptProject } from 'projen-github-action-typescript'

import { ScriptFile } from './script-file'
import { preSynthesize, getSharedOptions, postSynthesize } from './shared'

import type { GitHubActionTypeScriptOptions } from 'projen-github-action-typescript'

export class CustomTypescriptProject extends typescript.TypeScriptProject {
  constructor(options: typescript.TypeScriptProjectOptions) {
    options = {
      ...getSharedOptions(),
      ...options,
    }
    super(options)
    preSynthesize(this)
  }

  postSynthesize() {
    super.postSynthesize()
    postSynthesize(this)
  }
}

export class GithubAction extends GitHubActionTypeScriptProject {
  constructor(options: GitHubActionTypeScriptOptions) {
    options = {
      ...getSharedOptions(),
      ...options,
    }
    super(options)
    preSynthesize(this)
  }
}

export class Monorepo extends CustomTypescriptProject {
  constructor(options: typescript.TypeScriptProjectOptions) {
    super({
      sampleCode: false,
      disableTsconfig: true,
      tsconfigDevFile: 'tsconfig.json',
      ...options,
    })
    this.package.addField('workspaces', ['./packages/*'])
    this.package.addField('private', true)
    this.tsconfigDev.file.addOverride('include', [])
    this.tsconfigDev.file.addOverride('files', [])
    this.tsconfigDev.file.addOverride('exclude', [])
  }
}

export class MonorepoPackage extends CustomTypescriptProject {
  constructor(options: typescript.TypeScriptProjectOptions) {
    super({
      sampleCode: true,
      disableTsconfig: true,
      tsconfigDevFile: 'tsconfig.json',
      ...options,
    })
    this.package.addDevDeps(
      'packemon',
      'alias-hq',
      'babel-plugin-module-resolver',
    )
    this.package.addField('packemon', {
      format: ['mjs', 'lib'],
      platform: 'node',
    })
    this.compileTask.reset('packemon build --loadConfigs')
    new ScriptFile(this, './packemon.config.ts', {
      templatePath: path.resolve(
        path.join(__dirname, '../templates/packemon.config.ts'),
      ),
      readonly: true,
      marker: true,
    })
  }
}
