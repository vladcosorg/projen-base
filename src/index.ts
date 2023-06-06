import * as path from 'node:path'

import { javascript, typescript } from 'projen'
import { GitHubActionTypeScriptProject } from 'projen-github-action-typescript'

import { ScriptFile } from './script-file'
import { applyProjectChanges, getSharedOptions } from './shared'

import type { GitHubActionTypeScriptOptions } from 'projen-github-action-typescript'

export class CustomTypescriptProject extends typescript.TypeScriptProject {
  constructor(options: typescript.TypeScriptProjectOptions) {
    options = {
      ...getSharedOptions(),
      ...options,
    }
    super(options)
    applyProjectChanges(this)
  }
}

export class LightNodeProject extends javascript.NodeProject {
  constructor(options: javascript.NodeProjectOptions) {
    super({
      ...getSharedOptions(),
      jest: false,
      codeCov: false,
      vscode: false,
      prettier: true,
      pullRequestTemplate: false,
      ...options,
    })

    // project.tsconfigDev.add
    this.gitignore.exclude('/.idea')
    // this.package.addField(
    //   'prettier',
    //   '@chetzof/.prettierrc.js',
    // )
  }
}

export class GithubAction extends GitHubActionTypeScriptProject {
  constructor(options: GitHubActionTypeScriptOptions) {
    options = {
      ...getSharedOptions(),
      ...options,
    }
    super(options)
    applyProjectChanges(this)
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
