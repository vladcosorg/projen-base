// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
import path = require('node:path')

import { javascript, JsonPatch } from 'projen'
import { PROJEN_DIR } from 'projen/lib/common'

import type { JsiiProject } from 'projen/lib/cdk'
import type {
  TypeScriptProject,
  TypeScriptProjectOptions,
} from 'projen/lib/typescript'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function getSharedOptions() {
  return {
    defaultReleaseBranch: 'main',
    packageManager: javascript.NodePackageManager.NPM,
    projenrcTs: true,
    docgen: false,
    eslint: true,
    jest: false,
    githubOptions: { mergify: false, pullRequestLint: false },
    codeCov: false,
    vscode: false,
    buildWorkflow: false,
    prettier: false,
    pullRequestTemplate: false,
    projenrcTsOptions: { swc: true },
  } satisfies Partial<TypeScriptProjectOptions>
}

export function applyProjectChanges(
  project: JsiiProject | TypeScriptProject,
): void {
  project.addDevDeps('chetzof-lint-config', 'prettier')
  const originalConfig = require('chetzof-lint-config/tsconfig/tsconfig.json')
  project.eslint?.addExtends(
    './node_modules/chetzof-lint-config/eslint/index.js',
  )
  // project.tsconfigDev.add
  project.gitignore.exclude('/.idea')

  project
    .tryFindObjectFile('.eslintrc.json')
    ?.patch(JsonPatch.replace('/rules', {}))
  // project.tryFindObjectFile(project.tsconfigDev.fileName)?.patch(
  //   JsonPatch.replace('/compilerOptions', {
  //     baseUrl: './',
  //     rootDir: 'src',
  //     outDir: 'lib',
  //   }),
  // )

  const patches: JsonPatch[] = []

  for (const [optionName, optionsValue] of Object.entries({
    ...originalConfig.compilerOptions,
    composite: true,
    emitDeclarationOnly: true,
    incremental: true,
    baseUrl: './',
    outDir: path.relative(
      project.outdir,
      path.join(project.outdir, PROJEN_DIR, 'cache/types'),
    ),
  })) {
    patches.push(
      JsonPatch.replace(`/compilerOptions/${optionName}`, optionsValue),
    )
  }

  project.tryFindObjectFile(project.tsconfigDev.fileName)?.patch(...patches)

  if (project.parent) {
    ;(project.parent as TypeScriptProject).tsconfigDev.file.addToArray(
      'references',
      { path: path.relative(project.parent.outdir, project.outdir) },
    )
    project.parent.synth()
  }

  project.package.addField(
    'prettier',
    'chetzof-lint-config/prettier/.prettierrc.js',
  )
}
