precision highp float;

uniform sampler2D input1;
uniform vec2 resolution;

void main()
{
    gl_FragColor = texture2D(input1, gl_FragCoord.xy / resolution);
}