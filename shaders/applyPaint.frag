precision highp float;

uniform sampler2D canvas;
uniform vec2 resolution;
uniform vec3 color;

void main()
{
    vec4 vel = texture2D(canvas, gl_FragCoord.xy / resolution);

    vel.xyz = color;

    gl_FragColor = vel;
}