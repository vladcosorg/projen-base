// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types

import * as path from 'node:path'

import { omit } from 'lodash'
import { github, javascript, JsonPatch } from 'projen'
import { PROJEN_DIR } from 'projen/lib/common'
import { NpmAccess } from 'projen/lib/javascript'
import { mergeTsconfigOptions } from 'projen/lib/typescript'
import { execOrUndefined } from 'projen/lib/util'

import { ScriptFile } from './script-file'

import type {
  TypeScriptProject,
  TypeScriptProjectOptions,
} from './projects/typescript'
import type { TSConfigStructure } from 'packemon'
import type { JsiiProject, JsiiProjectOptions } from 'projen/lib/cdk'

export function getSharedOptions<
  T extends JsiiProjectOptions | TypeScriptProjectOptions,
>(options: T): T {
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
    disableTsconfig: true,
    tsconfigDevFile: 'tsconfig.json',
    tsconfigDev: mergeTsconfigOptions(
      JSON.parse(
        execOrUndefined(
          'curl https://raw.githubusercontent.com/vladcosorg/tsconfig/main/src/tsconfig.json',
          { cwd: '.' },
        ),
      ),
      options.tsconfigDev ?? { compilerOptions: {} },
    ),
    ...omit(options, 'tsconfigDev'),
  } satisfies Partial<TypeScriptProjectOptions> as T
}

export function preSynthesize(project: JsiiProject | TypeScriptProject): void {
  project.testTask.reset()

  project.npmrc.addConfig('install-links', 'false')
  project.addDevDeps('@vladcos/tsconfig')
  project.package.addField('main', './lib/index.js')
  project.package.addDevDeps(
    'packemon',
    'alias-hq',
    'babel-plugin-module-resolver',
    'tsconfig-paths',
    '@bleed-believer/path-alias',
    'tsx',
  )

  project.defaultTask?.reset(`npx -y tsx .projenrc.ts`)
  project.package.addField('packemon', {
    format: 'lib',
    platform: 'node',
  })
  project.compileTask.reset(
    'packemon build --loadConfigs --no-addFiles --no-addExports',
  )

  new ScriptFile(project, './packemon.config.ts', {
    templatePath: path.resolve(
      path.join(__dirname, '../templates/packemon.config.ts'),
    ),
    readonly: true,
    marker: true,
  })

  if (project.prettier) {
    project.addDevDeps('@vladcos/prettier-config')
    project.package.addField('prettier', '@vladcos/prettier-config')
    project.tryRemoveFile('.prettierrc.json')
  }

  if (project.eslint) {
    project.addDevDeps('@vladcos/eslint-config')
    project.eslint.addExtends('@vladcos/eslint-config')
    project
      .tryFindObjectFile('.eslintrc.json')
      ?.patch(JsonPatch.replace('/rules', {}))
  }

  if (project.prettier && project.eslint) {
    project.deps.removeDependency('eslint-plugin-prettier')
    // @ts-expect-error
    project.eslint._plugins = project.eslint._plugins.filter(
      (item: string) => item !== 'prettier',
    )

    // @ts-expect-error ddd
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
    project.eslint._extends = project.eslint._extends.filter(
      (item: string) =>
        item !== 'prettier' && item !== 'plugin:prettier/recommended',
    )
  }

  project.gitignore.exclude('/.idea')

  project.prettier?.addIgnorePattern('lib')
  project.prettier?.addIgnorePattern('dist')
  project.prettier?.addIgnorePattern('.projen')

  project.deps.removeDependency(project.name)
}

export function postSynthesize(project: JsiiProject | TypeScriptProject): void {
  return
  const defaultConfig: TSConfigStructure = $inline(
    '../node_modules/@vladcos/tsconfig/lib/tsconfig.json',
  )
  const originalConfig =
    'tsconfigTemplatePath' in project && project.tsconfigTemplatePath
      ? require(project.tsconfigTemplatePath)
      : require('@vladcos/tsconfig')
  const tsConfigFile = project.tryFindObjectFile(project.tsconfigDev.fileName)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
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
      JsonPatch.replace('/ts-node', originalConfig['ts-node']),
    )
  }
  tsConfigFile?.patch(...patches)

  if (project.parent) {
    ;(project.parent as TypeScriptProject).tsconfigDev.file.addToArray(
      'references',
      { path: path.relative(project.parent.outdir, project.outdir) },
    )
    project.parent.synth()
  }

  tsConfigFile?.synthesize()
}
