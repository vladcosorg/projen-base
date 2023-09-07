// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types

import * as path from 'node:path'

import { omit } from 'lodash'
import { github, javascript, JsonPatch } from 'projen'
import { NpmAccess } from 'projen/lib/javascript'
import { UpgradeDependenciesSchedule } from 'projen/lib/javascript/upgrade-dependencies'
import { mergeTsconfigOptions } from 'projen/lib/typescript'
import { execOrUndefined } from 'projen/lib/util'

import { ScriptFile } from './script-file'

import type {
  TypeScriptProject,
  TypeScriptProjectOptions,
} from './projects/typescript'
import type { JsiiProject, JsiiProjectOptions } from 'projen/lib/cdk'

export function getSharedOptions<
  T extends JsiiProjectOptions | TypeScriptProjectOptions,
>(options: Partial<T>): T {
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
    testdir: 'tests',
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
    depsUpgradeOptions: {
      workflowOptions: { schedule: UpgradeDependenciesSchedule.WEEKLY },
    },
    tsconfigDev: mergeTsconfigOptions(
      JSON.parse(
        execOrUndefined(
          'curl https://raw.githubusercontent.com/vladcosorg/tsconfig/main/src/tsconfig.json',
          { cwd: '.' },
        )!,
      ),
      { compilerOptions: { baseUrl: '.' } },
      options.tsconfigDev ?? { compilerOptions: {} },
    ),
    ...omit(options, 'tsconfigDev'),
  } satisfies Partial<TypeScriptProjectOptions> as T
}

export function preSynthesize(project: JsiiProject | TypeScriptProject): void {
  project.testTask.reset()
  const version = 'projen@0.72.19'
  project.addDevDeps(version)

  if (!('vitest' in project)) {
    project.addPeerDeps(version)
  }

  project.npmrc.addConfig('install-links', 'false')
  project.addDevDeps('@vladcos/tsconfig')
  project.package.addDevDeps(
    'packemon',
    'alias-hq',
    'babel-plugin-module-resolver',
    'tsconfig-paths',
    '@bleed-believer/path-alias',
    'tsx',
  )

  project.defaultTask?.reset(
    `npx -y tsx -r tsconfig-paths/register .projenrc.ts`,
  )
  project.package.addField('packemon', {
    format: 'lib',
    platform: 'node',
  })

  if (
    !project.name.startsWith('@vladcos/projen') &&
    'packemon' in project &&
    project.packemon
  ) {
    project.compileTask.reset('packemon build --loadConfigs')
  }

  new ScriptFile(project, './packemon.config.ts', {
    sourcePath: path.resolve(
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
    // project.tasks.removeTask('eslint')
    const task = project.tasks.addTask('format')
    task.exec(
      'prettier --write --cache --no-error-on-unmatched-pattern --ignore-unknown . || true',
    )
    task.spawn(project.eslint.eslintTask)
  }

  project.gitignore.exclude('/.idea')

  project.prettier?.addIgnorePattern('lib')
  project.prettier?.addIgnorePattern('dist')
  project.prettier?.addIgnorePattern('.projen')

  project.deps.removeDependency(project.name)
}

export function postSynthesize(
  _project: JsiiProject | TypeScriptProject,
): void {}
