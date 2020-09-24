		uniform vec2 u_resolution;
		uniform vec2 u_mouse;
		uniform float u_time;
		uniform vec3 u_colours[ 5 ];
	  
		const float multiplier = .7;
	  
		const float zoomSpeed = 8.;
		const int layers = 6;
	  
		const float seed =    86135.7315468;
	  
		float random2d(vec2 uv) {
		  return fract(
					sin(
					  dot( uv.xy, vec2(12.9898, 78.233) )
					) * seed);
		}
		mat2 rotate2d(float _angle){
			return mat2(cos(_angle),sin(_angle),
						-sin(_angle),cos(_angle));
		}
	
    
	  vec2 random2( vec2 p ) {
		  return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);
	  }
	
	  vec3 voronoi( in vec2 x, inout vec2 nearest_point, inout vec2 s_nearest_point, inout float s_nearest_distance, inout float nearest_distance) {
		  vec2 n = floor(x);
		  vec2 f = fract(x);
	
		  // first pass: regular voronoi
		  vec2 mg, mr;
		  float md = 8.0;
		  float smd = 8.0;
		  for (int j= -1; j <= 1; j++) {
			  for (int i= -1; i <= 1; i++) {
				  vec2 g = vec2(float(i),float(j));
				  vec2 o = random2( n + g );
				  // o = 0.5 + 0.4*sin((u_time / 10.) + 6.2831*o);
				  // o *= length(mouse.y) * 2.;
	
				  vec2 r = g + o - f;
				  float d = dot(r,r);
	
				  if( d<md ) {
					  smd = md;
					  s_nearest_distance = md;
					  nearest_distance = d;
					  md = d;
					  mr = r;
					  mg = g;
					  nearest_point = r;
				  } else if( smd > d ) {
					  s_nearest_distance = d;
					  nearest_distance = d;
					  smd = d;
					  s_nearest_point = r;
				  }
			  }
		  }
	
		  // second pass: distance to borders
		  md = 8.0;
		  for (int j= -2; j <= 2; j++) {
			  for (int i= -2; i <= 2; i++) {
				  vec2 g = mg + vec2(float(i),float(j));
				  vec2 o = random2( n + g );
				  // o = 0.5 + 0.4*sin((u_time / 10.) + 6.2831*o);
				  // o *= length(mouse.y) * 2.;
	
				  vec2 r = g + o - f;
	
				  if ( dot(mr-r,mr-r)>0.00001 ) {
					  md = min(md, dot( 0.5*(mr+r), normalize(r-mr) ));
				  }
			  }
		  }
		  return vec3(md, mr);
	  }
	  
	  vec3 getColour(vec2 nearest_point, vec2 s_nearest_point, float modMultiplier) {
		
		return vec3(0.);
	  }
	  
	  vec3 render(vec2 uv) {
		vec3 colour = vec3(0.5);
		// Voronoi
		vec2 nearest_point = vec2(0., 0.);
		vec2 s_nearest_point = vec2(0., 0.);
		float s_nearest_distance = 0.;
		float nearest_distance = 0.;
		vec3 c = voronoi(uv, nearest_point, s_nearest_point, s_nearest_distance, nearest_distance);
	
		// colour
		colour = getColour(nearest_point, s_nearest_point, 10.);
		
		// colour.r = length(fract(length(dot(nearest_point, s_nearest_point) * 5.)));
		// colour = vec3(0.5);
		colour.b = abs(1.-length(nearest_point));
		colour.r = colour.r / 4.;
		colour.r = colour.r / 3.;
		// vec3 linecolour = vec3(colour.r, 1. * colour.r, colour.r);
		// colour = mix(colour, linecolour, smoothstep(.60, .70, fract(length(nearest_point) * 5.)) * smoothstep(1., .85, fract(length(nearest_point) * 5.)));
	
		// borders
		vec3 border = vec3(-4.);
		colour = mix( border, colour, smoothstep( -.1, 0.03, c.x ) );
		// colour += mix( vec3(0.07), vec3(0.), smoothstep( 0.12, 0.11, c.x - 0.08 ) );
		
		return colour;
	  }
	  
	  vec3 renderLayer(int layer, int layers, vec2 uv, inout float opacity) {
		// Scale
		// Generating a scale value between zero and 1 based on a mod of u_time
		// A frequency of 10 dixided by the layer index (10 / layers * layer)
		float scale = mod((u_time + zoomSpeed / float(layers) * float(layer)) / zoomSpeed, -1.);
		uv *= 15.; // The initial scale. Increasing this makes the cells smaller and the "speed" apepar faster
		uv *= scale; // then modifying the overall scale by the generated amount
		uv = rotate2d(u_time / 10.) * uv; // rotarting
		uv += vec2(1000.) * float(layer); // ofsetting the UV by an arbitrary amount to make the layer appear different
	
		// render
		vec3 pass = render(uv * multiplier); // render the pass
		
		 // this is the opacity of the layer fading in from the "bottom"
		opacity = 1. + scale;
		float _opacity = opacity;
		
		// This is the opacity of the layer fading out at the top (we want this minimal, hence the smoothstep)
		float endOpacity = smoothstep(0., 0.2, scale * -1.);
		opacity += endOpacity;
		
		return pass * _opacity * endOpacity;
	  }
	
	  void main() {
		  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy);
		  
		  if(u_resolution.y < u_resolution.x) {
			uv /= u_resolution.y;
		  } else {
			uv /= u_resolution.x;
		  }
		
		  uv.x += sin(u_time / 10.) * .5;
		
		  vec3 colour = vec3(0.);
			
		  float opacity = 1.;
		  float opacity_sum = 1.;
		
		  for(int i = 1; i <= layers; i++) {
			colour += renderLayer(i, layers, uv, opacity);
			opacity_sum += opacity;
		  }
		
		  colour /= opacity_sum;
		
		  gl_FragColor = vec4(colour * 5.,1.0);
	  }