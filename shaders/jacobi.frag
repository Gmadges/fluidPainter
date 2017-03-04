precision highp float;

varying vec2 tex;                                       

uniform sampler2D Pressure;                                                
uniform sampler2D Divergence;                                                                                           

uniform vec2 resolution;
uniform float Alpha;              

float getPressure(sampler2D _pressure, vec2 _coord)
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

    return texture2D(_pressure, _coord).r;
}                                                                                                

void main()                                                                
{                                                                          
    vec2 coord = gl_FragCoord.xy / resolution;

    // could do this calc before and have as uniform for speed
    // i like how it reads here
    vec2 delta = 1.0 / resolution;

    // just a texture look up without boundary checks
    // this is more like the divergance code
    float T = getPressure(Pressure, coord + vec2(0, delta.y));
    float B = getPressure(Pressure, coord - vec2(0, delta.y));      
    float R = getPressure(Pressure, coord + vec2(delta.x, 0));       
    float L = getPressure(Pressure, coord - vec2(delta.x, 0));

    // divergance in the middle of our area
    float bC = texture2D(Divergence, coord).r;

    // use 0.25 as rBeta
    gl_FragColor = vec4( (L + R + B + T + Alpha * bC) * 0.25);
}  