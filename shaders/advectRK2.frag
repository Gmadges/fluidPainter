precision highp float;

uniform sampler2D velocity;                                    
uniform sampler2D inputSampler;                                       

uniform float dissapation;
uniform vec2 resolution; 
uniform float dt;                             

void main()                                                          
{  
    // we dont use tex
    vec2 coord = gl_FragCoord.xy;                                                                                               

    //grab source, usually velocity
    vec2 vel = texture2D(velocity, coord / resolution).rg * 100.0;

    // get half coords of source
    // this clamp can help with boundaries
    vec2 halfCoord = clamp( coord - ((vel * 0.5) * dt), vec2(0.0, 0.0), resolution) ;
    vec2 halfVel = texture2D(velocity, (halfCoord / resolution)).rg * 100.0;

    // this clamp can help with boundaries
    vec2 endCoord = clamp(coord - (halfVel * dt), vec2(0.0, 0.0), resolution) ;

    // now grab the value from the input tex based on the positions and values we've found
    gl_FragColor = texture2D(inputSampler, (endCoord / resolution)) * dissapation;
}