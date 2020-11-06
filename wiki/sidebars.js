let guidelines;

/*
if (process.env.NODE_ENV === 'development') {
	 guidelines = {
		label: 'Guidelines (DEV ONLY)',
		type: 'category',
		items: [
			'guidelines/lexicon',
			'guidelines/markdown',
		]
	}
}*/


module.exports = {
	docs: [
		guidelines,
		{
			id: 'seminars',
			type: 'doc'
		},
		{
			id: 'environment',
			type: 'doc'
		},
		{
			id: 'requirements',
			type: 'doc'
		},
		{
			id: 'ecsdocs',
			type: 'doc'
		},
		{
			label: 'Cheatsheets',
			type: 'category',
			items: ['cheatsheets/datastruct', 'cheatsheets/javascript', 'cheatsheets/typescript']
		},
		{
			label: 'Tutorials',
			type: 'category',
			items: ['tutorials/pixi_intro', 'tutorials/pixi_positions', 'tutorials/three_intro']
		},
	].filter(Boolean)
}
