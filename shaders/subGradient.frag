precision highp float;

varying vec2 tex;                                           

uniform sampler2D Velocity;                                            
uniform sampler2D Pressure;

uniform vec2 resolution;                            

void main()                                                            
{   
    vec2 coord = gl_FragCoord.xy / resolution;
    vec2 delta = 2.0 / resolution;

    float T = texture2D(Pressure, coord + vec2(0, delta.y)).x;
    float B = texture2D(Pressure, coord - vec2(0, delta.y)).x;      
    float R = texture2D(Pressure, coord + vec2(delta.x, 0)).x;       
    float L = texture2D(Pressure, coord - vec2(delta.x, 0)).x; 
    vec2 v = texture2D(Velocity, coord).xy;

    vec2 val = v - vec2((R-L), (T-B)) * (0.5 / resolution);

    gl_FragColor = vec4( val, 0.0, 0.0);                         
}    