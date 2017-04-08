precision highp float;

varying vec2 tex; 

uniform sampler2D canvas;
uniform sampler2D brush;

uniform vec2 resolution;
uniform vec3 color;

void main()
{
    float intense = texture2D(brush, tex).r;
    vec3 background = texture2D(canvas, gl_FragCoord.xy / resolution).rgb;

    vec3 tmp = (color * intense) + ((1.0 - intense) * background);

    gl_FragColor = vec4(tmp, 1.0);
}