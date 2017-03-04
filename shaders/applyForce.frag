precision highp float;

varying vec2 tex;

uniform sampler2D Velocity;

uniform vec2 Point;
uniform float Radius;
uniform vec3 FillColor;

uniform vec2 resolution;


void main()
{
    vec2 coord = gl_FragCoord.xy / resolution;

    float d = distance(Point, coord);

    if (d < Radius) 
    {
        gl_FragColor = vec4(FillColor, 1.0);
        return;
    }

    gl_FragColor = texture2D(Velocity, coord);
}