precision highp float;

varying vec2 tex;                                         

uniform sampler2D Velocity;                                                                                  
uniform vec2 resolution;

vec2 getVelocity(sampler2D _velocity, vec2 _coord)
{
    if(_coord.x < 0.0)
    {      
        _coord.x = 0.0;
    }
    else if(_coord.x > 1.0) 
    {
        _coord.x = 1.0;
    }

    if(_coord.y < 0.0)
    {
        _coord.y = 0.0;
    }
    else if(_coord.y > 1.0) 
    {
        _coord.y = 1.0;
    }

    return texture2D(_velocity, _coord).rg;
}

void main()                                                           
{                             
    vec2 coord = gl_FragCoord.xy / resolution;

    // could do this calc before and have as uniform for speed
    // i like how it reads here
    vec2 delta = 1.0 / resolution;

    // Find neighboring velocities, top, bottom , right, left
    vec2 vT = getVelocity(Velocity, coord + vec2(0.0, delta.y));
    vec2 vB = getVelocity(Velocity, coord - vec2(0.0, delta.y));      
    vec2 vR = getVelocity(Velocity, coord + vec2(delta.x, 0.0));       
    vec2 vL = getVelocity(Velocity, coord - vec2(delta.x, 0.0));              

    // calc divergence 
    // we have our sections in nice chunks so we can get away with dividing over two.
    float divergence = ((vR.x - vL.x) + (vT.y - vB.y)) * 0.5;

    gl_FragColor = vec4(divergence);
}                                                                     