precision highp float;

uniform sampler2D input1;
uniform sampler2D input2;

uniform vec2 resolution;

void main()
{
    vec2 coord = gl_FragCoord.xy / resolution;
    gl_FragColor = texture2D(input1, coord) + texture2D(input2, coord);
}