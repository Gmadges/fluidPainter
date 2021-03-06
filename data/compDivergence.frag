precision highp float;

uniform sampler2D Velocity;                                                                                  
uniform vec2 resolution;

void main()                                                           
{                             
    vec2 coord = gl_FragCoord.xy / resolution;

    // could do this calc before and have as uniform for speed
    // i like how it reads here
    vec2 delta = 2.0 / resolution;

    // Find neighboring velocities, top, bottom , right, left
    vec2 vT = texture2D(Velocity, coord + vec2(0.0, delta.y)).xy;
    vec2 vB = texture2D(Velocity, coord - vec2(0.0, delta.y)).xy;      
    vec2 vR = texture2D(Velocity, coord + vec2(delta.x, 0.0)).xy;       
    vec2 vL = texture2D(Velocity, coord - vec2(delta.x, 0.0)).xy;              

    // calc divergence 
    // we have our sections in nice chunks so we can get away with dividing over two.
    float divergence = ((vR.x - vL.x) * (0.5 / resolution.x)) + ((vT.y - vB.y) * (0.5 / resolution.y));

    gl_FragColor = vec4(divergence);
}                                                                     