precision highp float;

uniform sampler2D canvas;
uniform vec2 resolution;
uniform vec3 color;
uniform vec2 startPos;
uniform vec2 endPos;
uniform float radius;

void main()
{
    vec4 vel = texture2D(canvas, gl_FragCoord.xy / resolution);

    float A = distance(startPos, gl_FragCoord.xy);
    float B = distance(endPos, gl_FragCoord.xy);
    float C = distance(startPos, endPos);

    if ((A + B) < (C + radius) &&
        (A + B) > (C - radius)) 
    {
        vel.xyz = color;
    }

    gl_FragColor = vel;
}