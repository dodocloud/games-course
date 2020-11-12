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
			label: 'Examples',
			type: 'category',
			items: [{
				label: 'Pixi Introduction',
				type: 'category',
				items: ['examples/pixi-intro/config', 'examples/pixi-intro/animation']
			},
			{
				label: 'Components',
				type: 'category',
				items: ['examples/components/squares', 'examples/components/animation']
			},
			{
				label: 'Space',
				type: 'category',
				items: ['examples/space/random-dist', 'examples/space/pathfinding', 'examples/space/perlin', 'examples/space/quadtree']
			},
			{
				label: 'Other',
				type: 'category',
				items: ['examples/other/perfect-hit-test']
			}]
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
