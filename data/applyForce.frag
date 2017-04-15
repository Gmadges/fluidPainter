precision highp float;

varying vec3 col;
varying vec2 tex; 

uniform sampler2D canvas;
uniform sampler2D brush;

uniform vec2 resolution;

void main()
{
    float intense = texture2D(brush, tex).r;
    vec3 background = texture2D(canvas, gl_FragCoord.xy / resolution).rgb;
    vec3 tmp = (col * intense) + ((1.0 - intense) * background);

    gl_FragColor = vec4(tmp, 1.0);
}