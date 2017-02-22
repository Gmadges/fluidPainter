precision mediump float;

varying vec2 tex;                                           

uniform sampler2D Velocity;                                            
uniform sampler2D Pressure;

uniform vec2 resolution;                                  

void main()                                                            
{   
    vec2 coord = gl_FragCoord.xy / resolution;
    vec2 delta = 1.0 / resolution;
    vec2 halfrdx = 0.5 / resolution;

    // just a texture look up without boundary checks
    // this is more like the divergance code
    float T = texture2D(Pressure, coord + vec2(0, delta.y)).r;
    float B = texture2D(Pressure, coord - vec2(0, delta.y)).r;      
    float R = texture2D(Pressure, coord + vec2(delta.x, 0)).r;       
    float L = texture2D(Pressure, coord - vec2(delta.x, 0)).r; 
    vec2 v = texture2D(Velocity, coord).rg;

    gl_FragColor = vec4(v - halfrdx * vec2((R-L), (T-B)), 0, 1);                          
}    