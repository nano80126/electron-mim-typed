module.exports = {
	root: true,

	env: {
		node: true
	},

	// extends: ['plugin:vue/essential', 'eslint:recommended', '@vue/prettier'],
	// extends: ['plugin:vue/essential', 'eslint:recommended', '@vue/prettier', '@vue/typescript'],
	extends: [
		'plugin:vue/essential',
		'eslint:recommended',
		'@vue/typescript/recommended',

		'@vue/prettier',
		'@vue/prettier/@typescript-eslint'
	],

	parserOptions: {
		parser: '@typescript-eslint/parser'
	},

	rules: {
		'no-console': process.env.NODE_ENV === 'production' ? ['off', { allow: ['warn', 'error', 'info'] }] : 'off',
		'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
		// 'no-var': 'error'
		// 'prefer-const': 'error',
		'max-len': ['error', { code: 120, tabWidth: 4, ignoreComments:true }]
		// 'max-len': ['error', { tabWidth: 4 }]
		// camelcase: 'error'
	}
};
