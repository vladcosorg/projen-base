// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
import path = require('node:path')

import { github, javascript, JsonPatch } from 'projen'
import type { JsiiProject } from 'projen/lib/cdk'
import { PROJEN_DIR } from 'projen/lib/common'
import { NpmAccess } from 'projen/lib/javascript'

import type {
  TypeScriptProject,
  TypeScriptProjectOptions,
} from 'projen/lib/typescript'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function getSharedOptions() {
  return {
    projenCredentials: github.GithubCredentials.fromApp(),
    npmAccess: NpmAccess.PUBLIC,
    autoApproveUpgrades: true,
    autoApproveOptions: {
      allowedUsernames: ['myappchetzof[bot]'],
    },
    defaultReleaseBranch: 'main',
    packageManager: javascript.NodePackageManager.NPM,
    projenrcTs: true,
    docgen: false,
    eslint: true,
    releaseToNpm: true,
    mutableBuild: true,
    jest: false,
    githubOptions: { mergify: true, pullRequestLint: false },
    codeCov: false,
    vscode: false,
    buildWorkflow: true,
    prettier: true,
    pullRequestTemplate: false,
    projenrcTsOptions: { swc: true },
  } satisfies Partial<TypeScriptProjectOptions>
}

export function preSynthesize(project: JsiiProject | TypeScriptProject): void {
  project.testTask.reset()

  if (project.prettier) {
    project.addDevDeps('chetzof-lint-config', '@chetzof/prettier-config')
    project.package.addField('prettier', '@chetzof/prettier-config')
    project.tryRemoveFile('.prettierrc.json')
  }

  if (project.eslint) {
    project
      .tryFindObjectFile('.eslintrc.json')
      ?.patch(JsonPatch.replace('/rules', {}))
  }

  if (project.prettier && project.eslint) {
    project.deps.removeDependency('eslint-plugin-prettier')
    // @ts-ignore
    project.eslint._plugins = project.eslint._plugins.filter(
      (item: string) => item !== 'prettier',
    )
    // @ts-ignore
    project.eslint._extends = project.eslint._extends.filter(
      (item: string) =>
        item !== 'prettier' && item !== 'plugin:prettier/recommended',
    )
    project
      .tryFindObjectFile('.eslintrc.json')
      ?.patch(JsonPatch.remove('/plugins/prettier'))
  }

  project.gitignore.exclude('/.idea')

  project.prettier?.addIgnorePattern('lib')
  project.prettier?.addIgnorePattern('dist')
  project.prettier?.addIgnorePattern('.projen')
}

export function postSynthesize(project: JsiiProject | TypeScriptProject): void {
  const originalConfig = require('chetzof-lint-config/tsconfig/tsconfig.json')
  project.eslint?.addExtends(
    './node_modules/chetzof-lint-config/eslint/index.js',
  )

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
}
