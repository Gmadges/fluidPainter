precision highp float;

varying vec2 tex;

uniform sampler2D Velocity;
uniform vec2 resolution;
uniform vec2 forceVal;
uniform vec2 forcePos;
uniform float radius;

void main()
{
    vec4 vel = texture2D(Velocity, gl_FragCoord.xy / resolution);

    float d = distance(forcePos, gl_FragCoord.xy);

    if (d < radius) 
    {
        vel.xy += forceVal;
    }

    gl_FragColor = vel;
}