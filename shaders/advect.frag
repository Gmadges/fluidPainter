precision highp float;

varying vec2 tex;

uniform sampler2D velocity;                                    
uniform sampler2D inputSampler;                                       

uniform float dissapation;
uniform vec2 resolution; 
uniform float dt;

vec4 getVelocity(sampler2D _velocity, vec2 _coord)
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

    return texture2D(_velocity, _coord);
}

void main(void) 
{
    vec2 pos =  gl_FragCoord.xy;

    vec2 tracedPos = pos - dt * texture2D(velocity, pos / resolution).xy * 100.0;
    
    vec2 tracedCoord = tracedPos / resolution;    
    vec2 delta = 2.0 / resolution;

    vec2 vT = getVelocity(velocity, tracedCoord + vec2(0.0, delta.y)).xy;
    vec2 vB = getVelocity(velocity, tracedCoord - vec2(0.0, delta.y)).xy;      
    vec2 vR = getVelocity(velocity, tracedCoord + vec2(delta.x, 0.0)).xy;       
    vec2 vL = getVelocity(velocity, tracedCoord - vec2(delta.x, 0.0)).xy; 

    //need to bilerp this result
    gl_FragColor = vec4(mix(mix(vL, vR, 0.5), mix(vT, vB, 0.5), 0.5), 0, 0);
}