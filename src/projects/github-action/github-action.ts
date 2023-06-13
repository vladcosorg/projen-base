import { YamlFile } from 'projen'
import { zodToJsonSchema } from 'zod-to-json-schema'

import { RunsUsing } from './types/actions-metadata-model'

import { TypeScriptProject } from '../typescript'

import type { Input } from './types/actions-metadata-model'
import type { GitHubActionMetadata } from './types/github-action-metadata'
import type { TypeScriptProjectOptions } from '../typescript'

export * from './types/actions-metadata-model'
export type * from './types/github-action-metadata'
/**
 * Properties for creating a GitHubActionTypeScriptProject.
 */
export interface GitHubActionTypeScriptOptions
  extends TypeScriptProjectOptions {
  /**
   * Options for the GitHub Action metadata stored in `action.yml`.
   *
   * @default - an action named after the project `name` that runs from `dist/index.js`.
   */
  readonly actionMetadata?: GitHubActionMetadata
}

export class GithubAction extends TypeScriptProject {
  readonly inputsPath?: string
  readonly actionsFile: YamlFile

  constructor(options: GitHubActionTypeScriptOptions) {
    super(options)

    // standard GitHub action packages
    this.addDeps(
      '@actions/core',
      '@actions/github',
      '@actions/core',
      '@actions/exec',
    )

    // package as a single runnable .js file in /dist
    this.addDevDeps('@vercel/ncc')
    this.packageTask.reset('ncc build --source-map --license licenses.txt')

    this.addGitIgnore('!/dist/')
    this.annotateGenerated('/dist/**')

    // Create metadata for projen managed `action.yml` file.
    const defaultMetadataOptions: GitHubActionTypeScriptOptions['actionMetadata'] =
      {
        name: this.name,
        description: `A GitHub Action for ${this.name}`,
        runs: {
          using: RunsUsing.NODE_16,
          main: 'dist/index.js',
        },
      }

    const output = {
      ...defaultMetadataOptions,
      ...options.actionMetadata,
      inputs:
        typeof options.actionMetadata?.inputs === 'string'
          ? {}
          : options.actionMetadata?.inputs,
    }

    if (typeof options.actionMetadata?.inputs === 'string') {
      this.inputsPath = options.actionMetadata.inputs
    }

    this.actionsFile = new YamlFile(this, 'action.yml', {
      obj: output,
    })

    this.addDeps('zod')
  }

  postSynthesize() {
    super.postSynthesize()

    if (!this.inputsPath) {
      return
    }
    const schema = zodToJsonSchema(require(this.inputsPath).default()) as {
      properties: Record<string, { default?: unknown; description?: string }>
      required: string[]
    }
    this.actionsFile.addOverride(
      'inputs',
      Object.fromEntries(
        Object.keys(schema.properties).map<[string, Input]>((key) => [
          key,
          {
            description: schema.properties[key].description ?? 'No description',
            required: schema.required.includes(key),
            default: schema.properties[key].default as string,
          },
        ]),
      ),
    )
    this.actionsFile.synthesize()
  }
}
