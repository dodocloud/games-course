const visit = require('unist-util-visit')

const customFields = {
	copyright: `Copyright © ${new Date().getFullYear()} Adam Vesecký`,
	description: 'Materials for classes about computer games',
	version: '4.0.0'
}

function variable() {
	const RE_VAR = /{@([\w-_]+)@}/g
	const getVariable = (full, partial) =>
		partial ? customFields[partial] : full

	function textVisitor(node) {
		node.value = node.value.replace(RE_VAR, getVariable)
	}

	function linkVisitor(node) {
		node.url = node.url.replace(RE_VAR, getVariable)

		if (node.title) {
			node.title = node.title.replace(RE_VAR, getVariable)
		}
	}

	function transformer(ast) {
		visit(ast, 'text', textVisitor)
		visit(ast, 'code', textVisitor)
		visit(ast, 'link', linkVisitor)
	}

	return transformer
}

// todo... override navbar item and allow to redirect to the static folder
const url = `https://aph.dodo.me`;

const config = {
	title: 'Architecture of Computer Games',
	url: url,
	baseUrl: '/',
	onBrokenLinks: 'warn',
	favicon: '/img/favicon.png',
	organizationName: 'FIT CTU',
	projectName: 'ni-aph',
	customFields,
	plugins: [
		require.resolve('@cmfcmf/docusaurus-search-local'),
		require.resolve('./plugins/lint'),
		[
			'@docusaurus/plugin-ideal-image',
			{
				quality: 100,
				steps: 2 // the max number of images generated between min and max (inclusive)
			}
		],
		[
			'@docusaurus/plugin-pwa',
			{
				pwaHead: [
					{
						tagName: 'link',
						rel: 'icon',
						href: '/img/favicon.png'
					},
					{
						tagName: 'meta',
						name: 'theme-color',
						content: '#d14671'
					},
					{
						tagName: 'meta',
						name: 'apple-mobile-web-app-capable',
						content: 'yes'
					},
					{
						tagName: 'meta',
						name: 'apple-mobile-web-app-status-bar-style',
						content: '#21222c'
					},
					{
						tagName: 'link',
						rel: 'apple-touch-icon',
						href: '/img/favicon.png'
					},
					{
						tagName: 'link',
						rel: 'mask-icon',
						href: '/img/favicon.png',
						content: '#fff'
					},
					{
						tagName: 'meta',
						name: 'msapplication-TileImage',
						content: '/img/favicon.png'
					},
					{
						tagName: 'meta',
						name: 'msapplication-TileColor',
						content: '#21222c'
					}
				]
			}
		]
	],
	themeConfig: {
		colorMode: {
			defaultMode: 'dark',
			disableSwitch: true,
			respectPrefersColorScheme: false
		},
		image: '/img/minilogo.png',
		prism: {
			defaultLanguage: 'javascript',
			theme: require('./src/internals/prism-aph')
		},
		navbar: {
			title: ' ',
			logo: {
				alt: 'NI-APH',
				src: '/img/navbar/logo.svg'
			},
			items: [
				{
					label: 'Lectures',
					position: 'left',
					items: [
						{
							label: 'Course Organization',
							href: url + '/slides/organization.html'
						},
						{
							label: 'Lecture 1: Games',
							href: url + '/slides/lecture01.html',
						}
					]
				},
				{
					label: 'Seminars',
					position: 'left',
					to: '/docs/seminars/',
					activeBasePath: 'docs'
				},
			/*	{
					label: 'Blog',
					to: '/blog/',
					position: 'left'
				}*/
			]
		},
	},
	presets: [
		[
			'@docusaurus/preset-classic',
			{
				docs: {
					remarkPlugins: [variable],
					sidebarPath: require.resolve('./sidebars.js')
				},
				blog: {
					remarkPlugins: [variable],
					feedOptions: {
						type: 'all',
						copyright: customFields.copyright
					},
					showReadingTime: true
				},
				sitemap: {
					cacheTime: 600 * 1000, // 600 sec - cache purge period
					changefreq: 'daily',
					priority: 0.7
				},
				theme: {
					customCss: require.resolve('./src/css/global.css')
				}
			}
		]
	]
}

module.exports = {
	...config
}
