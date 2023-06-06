import { get } from 'alias-hq';

import type { ConfigFile } from 'packemon';

const config: ConfigFile = {
	babelInput(config) {
		let pluginConfig;
		try {
			pluginConfig = get('babel');
		} catch {
			pluginConfig = [];
		}
		config.plugins.push([
			'module-resolver',
			{
				root: ['./'], // must match tsconfig.json srcUrl
				alias: pluginConfig,
			},
		]);
	},
};

export default config;
