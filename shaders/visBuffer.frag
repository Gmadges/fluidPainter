precision highp float;
                                            
uniform vec2 resolution;

void main()                                                           
{                             
    vec2 coord = gl_FragCoord.xy;

    float R = mod(coord.x , 200.0) / 200.0;
    float G = mod(coord.y , 200.0) / 200.0;
    float B = 1.0 - (G + R) * 0.5;

    gl_FragColor = vec4(R, G, B, 0.0);
}                                                                     