import * as fs from 'node:fs'

import { FileBase } from 'projen'

import type { FileBaseOptions, Project } from 'projen'
/**
 * Options for `TextFile`.
 */
export interface TextFileOptions extends FileBaseOptions {
  readonly sourcePath: string
}

export class ScriptFile extends FileBase {
  private readonly sourcePath: string
  constructor(project: Project, filePath: string, options: TextFileOptions) {
    super(project, filePath, options)
    this.sourcePath = options.sourcePath
  }

  protected synthesizeContent(): string {
    return `// ${this.marker} \n ${fs.readFileSync(this.sourcePath, {
      encoding: 'utf8',
    })} 
    `
  }
}
