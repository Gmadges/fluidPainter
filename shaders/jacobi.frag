precision mediump float;

varying vec2 tex;                                       

uniform sampler2D Pressure;                                                
uniform sampler2D Divergence;                                                                                           

uniform vec2 resolution;
uniform float Alpha;                                                                        

// // This has some boundary stuff
// float samplePressure(sampler2D pressure, vec2 coord)
// {
//     vec2 cellOffset = vec2(0.0, 0.0);

//     // more bound checking
//     if(coord.x < 0.0)
//     {      
//         cellOffset.x = 1.0;
//     }
//     else if(coord.x > 1.0) 
//     {
//         cellOffset.x = -1.0;
//     }

//     if(coord.y < 0.0)
//     {
//         cellOffset.y = 1.0;
//     }
//     else if(coord.y > 1.0) 
//     {
//         cellOffset.y = -1.0;
//     }

//     return texture2D(pressure, coord + cellOffset * (1.0 / resolution)).x;
// }                                       

void main()                                                                
{                                                                          
    vec2 coord = gl_FragCoord.xy / resolution;

    // could do this calc before and have as uniform for speed
    // i like how it reads here
    vec2 delta = 1.0 / resolution;

    //float T = samplePressure(Pressure, coord + vec2(0, delta.y));
    //float B = samplePressure(Pressure, coord - vec2(0, delta.y));      
    //float R = samplePressure(Pressure, coord + vec2(delta.x, 0));       
    //float L = samplePressure(Pressure, coord - vec2(delta.x, 0));  

    // just a texture look up without boundary checks
    // this is more like the divergance code
    float T = texture2D(Pressure, coord + vec2(0, delta.y)).r;
    float B = texture2D(Pressure, coord - vec2(0, delta.y)).r;      
    float R = texture2D(Pressure, coord + vec2(delta.x, 0)).r;       
    float L = texture2D(Pressure, coord - vec2(delta.x, 0)).r;  

    // divergance in the middle of our area
    float bC = texture2D(Divergence, coord).r;

    // use 0.25 as rBeta
    gl_FragColor = vec4( (L + R + B + T + Alpha * bC) * 0.25, 0.0, 0.0, 0.0 );            
}  