precision highp float;

varying vec2 tex;                                               
uniform vec2 resolution;

void main()                                                           
{                             
    vec2 coord = gl_FragCoord.xy / resolution;

    gl_FragColor = vec4(coord, 0.0, 0.0);
}                                                                     