import { typescript } from 'projen'
import { NodePackageManager } from 'projen/lib/javascript'

export class Jsiproj extends typescript.TypeScriptProject {
  constructor(options: typescript.TypeScriptProjectOptions) {
    console.log(options)
    options = Object.assign({}, options, {
      packageManager: NodePackageManager.NPM,
      docgen: false,
      eslint: false,
      jest: false,
      codeCov: false,
    })
    super(options)
    this.addDeps('@vercel/ncc')
    this.addTask('lol', { exec: 'omg' })
  }
}
