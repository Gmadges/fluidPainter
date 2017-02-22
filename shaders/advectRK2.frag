precision mediump float;

varying vec2 tex;

uniform sampler2D source;                                    
uniform sampler2D target;                                       

uniform float dissapation;
uniform vec2 resolution; 
uniform float dt;                             

void main()                                                          
{  
    // we dont use tex
    vec2 coord = gl_FragCoord.xy;                                                                                               

    //grab source, usually velocity
    vec2 vel = texture2D(source, coord / resolution).rg * 100.0;

    // get half coords of source
    vec2 halfCoord = (coord - vel) * 0.5 * dt;
    vec2 halfVel = texture2D(source, halfCoord).rg * 100.0;

    vec2 endCoord = (coord - halfVel) * dt;

    // now grab the value from the input tex based on the positions and values we've found
    gl_FragColor = texture2D(target, (endCoord / resolution)) * dissapation;
}