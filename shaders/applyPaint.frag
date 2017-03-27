precision highp float;

uniform sampler2D canvas;
uniform vec2 resolution;
uniform vec3 color;
uniform vec2 pos;
uniform float radius;

void main()
{
    // vec4 vel = texture2D(canvas, gl_FragCoord.xy / resolution);

    // float d = distance(pos, gl_FragCoord.xy);

    // if (d < radius) 
    // {
    //     vel.xyz = color;
    // }

    gl_FragColor = vec4(color, 1.0);
}