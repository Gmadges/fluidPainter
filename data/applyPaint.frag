precision highp float;

varying vec2 tex; 

uniform sampler2D canvas;
uniform sampler2D brush;

uniform vec2 resolution;
uniform vec4 color;

void main()
{
    float intense = texture2D(brush, tex).r * color.a;
    vec3 background = texture2D(canvas, gl_FragCoord.xy / resolution).rgb;
    vec3 tmp = (color.rgb * intense) + ((1.0 - intense) * background);
    gl_FragColor = vec4(tmp, 1.0);
}