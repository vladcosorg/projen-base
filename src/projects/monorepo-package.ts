import { TypeScriptProject } from './typescript'

import type { typescript } from 'projen'

export class MonorepoPackage extends TypeScriptProject {
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
    // new ScriptFile(this, './packemon.config.ts', {
    //   sourcePath: resolve(join(__dirname, '../templates/packemon.config.ts')),
    //   readonly: true,
    //   marker: true,
    // })
  }
}
