/* eslint-disable */
const webpack = require('webpack');

module.exports = {
	transpileDependencies: ['vuetify'],

	// publicPath: require('path').resolve(__dirname, 'dist'),
	publicPath: './',

	productionSourceMap: false,
	// process.env won't work here
	devServer: {
		// before: () => {
		// 	console.log(process.env.IS_ELECTRON);
		// },
		open: false,
		port: 8080
	},
	css: {
		extract: { ignoreOrder: true }
	},
	pages: {
		main: {
			entry: 'src/main.ts',
			template: 'public/index.html',
			filename: 'index.html',
			chunks: ['chunk-common', 'chunk-main-vendors', 'main']
		}
		// panel: {
		// 	entry: "src/pages/panel/main.ts",
		// 	template: "public/panel.html",
		// 	filename: "panel.html",
		// 	chunks: ["chunk-common", "chunk-panel-vendors", "panel"]
		// }
	},
	chainWebpack: config => {
		// 保留空白
		config.module
			.rule('vue')
			.use('vue-loader')
			.tap(args => {
				args.compilerOptions.whitespace = 'preserve';
			});

		// config.module
		// 	.rule("worker")
		// 	.test(/\.worker\.js$/)
		// 	.use("worker")
		// 	.loader('worker-loader')
		// 	.options({
		// 		inline: 'fallback'
		// 	});

		config.optimization.splitChunks({
			cacheGroups: {
				main: {
					name: 'chunk-main-vendors',
					priority: -10,
					chunks: chunk => chunk.name === 'main',
					test: /[\\/]node_modules[\\/]/,
					enforce: true
				},
				// panel: {
				// 	name: 'chunk-panel-vendors',
				// 	priority: -11,
				// 	chunks: chunk => chunk.name === "panel",
				// 	test: /[\\/]node_modules[\\/]/,
				// 	enforce: true
				// },
				common: {
					name: 'chunk-common',
					priority: -20,
					chunks: 'initial',
					minChunks: 1,
					reuseExistingChunk: true,
					enforce: true
				}
			}
		});
	},
	configureWebpack: () => {
		return {
			plugins: [new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /zh-tw$/)]
		};
	},
	pluginOptions: {
		electronBuilder: {
			chainWebpackMainProcess: config => {
				// Chain webpack config for electron main process only
				// config.target = 'node';

				const exts = {
					// appenders: "commonjs appenders",
					bufferutil: 'commonjs bufferutil',
					'utf-8-validate': 'commonjs utf-8-validate'
					// log4js: 'commonjs log4js'
				};

				Object.assign(
					exts,
					process.env.NODE_ENV == 'development'
						? {
								express: 'commonjs express',
								log4js: 'commonjs log4js',
								mongodb: 'commonjs2 mongodb'
						  }
						: undefined
				);
				config.externals([exts]);
			},
			chainWebpackRendererProcess: config => {
				// config.plugin('define').tap(args => {
				// 	args[0]['TEST123'] = true;
				// 	return args;
				// });
			},
			// mainProcessFile: './src/background.ts',
			//
			mainProcessWatch: ['src/api/*.ts', 'src/api/socket/*.ts'],
			// disableMainProcessTypescript: true, // Manually disable typescript plugin for main process. Enable if you want to use regular js for the main process (src/background.js by default).
			// mainProcessTypeChecking: false, // Manually enable type checking during webpck bundling for background file.
			builderOptions: {
				productName: ' furnace-viewer',
				copyright: 'Copyright © 2021',
				// extends: null,
				// files: [
				// 	{
				// 		from: 'build',
				// 		filter: '**/*.js'
				// 	}
				// ],
				win: {
					icon: 'build/icon.png',
					target: [
						{
							target: 'nsis',
							arch: ['x64']
						}
					]
				},
				nsis: {
					oneClick: false,
					allowElevation: true,
					allowToChangeInstallationDirectory: true,
					createDesktopShortcut: true,
					shortcutName: 'furnace-viewer'
				}
			}
		},
		i18n: {
			locale: 'tw',
			fallbackLocale: 'en',
			localeDir: 'locales',
			enableInSFC: false
		}
	}
};
