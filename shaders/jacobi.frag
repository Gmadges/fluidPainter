precision highp float;

varying vec2 tex;                                       

uniform sampler2D Pressure;                                                
uniform sampler2D Divergence;                                                                                           

uniform vec2 resolution;
uniform float Alpha;                                                                                                              

void main()                                                                
{                                                                          
    vec2 coord = gl_FragCoord.xy / resolution;

    // could do this calc before and have as uniform for speed
    // i like how it reads here
    vec2 delta = 1.0 / resolution;

    // just a texture look up without boundary checks
    // this is more like the divergance code
    float T = texture2D(Pressure, coord + vec2(0, delta.y)).x;
    float B = texture2D(Pressure, coord - vec2(0, delta.y)).x;      
    float R = texture2D(Pressure, coord + vec2(delta.x, 0)).x;       
    float L = texture2D(Pressure, coord - vec2(delta.x, 0)).x;

    // divergance in the middle of our area
    float bC = texture2D(Divergence, coord).r;

    // use 0.25 as rBeta
    gl_FragColor = vec4( (L + R + B + T + Alpha * bC) * 0.25);
}  