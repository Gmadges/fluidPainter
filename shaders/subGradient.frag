precision highp float;

varying vec2 tex;                                           

uniform sampler2D Velocity;                                            
uniform sampler2D Pressure;

uniform vec2 resolution;

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
    vec2 delta = 2.0 / resolution;

    // just a texture look up without boundary checks
    // this is more like the divergance code
    float T = getPressure(Pressure, coord + vec2(0, delta.y));
    float B = getPressure(Pressure, coord - vec2(0, delta.y));      
    float R = getPressure(Pressure, coord + vec2(delta.x, 0));       
    float L = getPressure(Pressure, coord - vec2(delta.x, 0)); 
    vec2 v = texture2D(Velocity, coord).rg;

    vec2 val = v - (vec2((R-L), (T-B)) * (0.5 / resolution));

    gl_FragColor = vec4( val , 0.0, 0.0);                         
}    