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
				items: ['examples/pixi-intro/config', 'examples/pixi-intro/animation', 'examples/pixi-intro/button', 
				'examples/pixi-intro/loop', 'examples/pixi-intro/particles', 'examples/pixi-intro/primitives', 
				'examples/pixi-intro/sound', 'examples/pixi-intro/text']
			},
			{
				label: 'ThreeJS Introduction',
				type: 'category',
				items: ['examples/three-intro/shaders', 'examples/three-intro/scene', 'examples/three-intro/sprites']
			},
			{
				label: 'Components',
				type: 'category',
				items: ['examples/components/squares', 'examples/components/animation']
			},
			{
				label: 'Space',
				type: 'category',
				items: ['examples/space/random-dist', 'examples/space/pathfinding', 'examples/space/perlin', 
				'examples/space/quadtree']
			},
			{
				label: 'Dynamics',
				type: 'category',
				items: ['examples/dynamics/missile', 'examples/dynamics/rotation', 'examples/dynamics/steering-seek', 
				'examples/dynamics/steering-evade', 'examples/dynamics/steering-pursuit', 'examples/dynamics/steering-wander',
				'examples/dynamics/steering-combined']
			},
			{
				label: 'Physics',
				type: 'category',
				items: ['examples/physics/matter-friction', 'examples/physics/matter-airfriction',
				'examples/physics/matter-bridge', 'examples/physics/matter-car', 'examples/physics/matter-chains',
				'examples/physics/matter-cradle', 'examples/physics/matter-mixed-shapes', 'examples/physics/cloth',
				'examples/physics/matter-binding']
			},
			{
				label: 'Graphics',
				type: 'category',
				items: ['examples/graphics/raycaster', 'examples/graphics/shader-basic', 'examples/graphics/shader-noise', 'examples/graphics/shader-wave',
				'examples/graphics/tween-rotation', 'examples/graphics/tween-translation', 'examples/graphics/vision-cone']
			},
			{
				label: 'Other',
				type: 'category',
				items: ['examples/other/perfect-hit-test', 'examples/other/dialog']
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
			items: ['tutorials/pixi_intro', 'tutorials/pixi_positions', 'tutorials/three_intro', 'tutorials/matterjs']
		},
	].filter(Boolean)
}
