import { join } from 'node:path'
import path = require('node:path')

import { Component, SampleDir } from 'projen'

import { ScriptFile } from '../script-file'

import type { TypeScriptProject } from '../projects/typescript'
import type { Project } from 'projen'

export interface VitestOptions {
  readonly manualConfig?: boolean
}
export class Vitest extends Component {
  /**
   * Returns the singletone Jest component of a project or undefined if there is none.
   */
  public static of(project: Project): Vitest | undefined {
    return project.components.find(
      (c: Component): c is Vitest => c instanceof Vitest,
    )
  }

  constructor(project: TypeScriptProject, options: VitestOptions = {}) {
    super(project)
    project.package.addDevDeps('vitest@^0.34', 'vite-tsconfig-paths@4')

    project.tsconfigDev.addInclude('vitest.config.ts')
    project.tsconfigDev.addInclude('tests/**/*.ts')

    if (!options.manualConfig) {
      new ScriptFile(project, 'vitest.config.ts', {
        sourcePath: path.resolve(
          join(__dirname, '../../templates/vitest.config.ts'),
        ),
        readonly: true,
        marker: true,
      })
    }

    new SampleDir(project, 'tests', {
      sourceDir: path.resolve(join(__dirname, '../../templates/tests')),
    })
  }
  preSynthesize() {
    super.preSynthesize()
    this.project.testTask.reset('vitest run', { receiveArgs: true })

    const testWatch = this.project.tasks.tryFind('test:watch')
    if (!testWatch) {
      this.project.addTask('test:watch', {
        description: 'Run vitest in watch mode',
        exec: `vitest watch`,
      })
    }
  }
}
