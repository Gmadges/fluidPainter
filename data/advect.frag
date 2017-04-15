precision highp float;

uniform sampler2D velocity;                                    
uniform sampler2D inputSampler;                                       

uniform vec2 resolution; 
uniform float dissipate;

void main(void) 
{
    vec2 pos = gl_FragCoord.xy;

    vec2 tracedPos = pos - texture2D(velocity, pos / resolution).xy * 100.0;

    vec4 corners;
    corners.xy = floor(tracedPos - 0.5) + 0.5; 
    corners.zw = corners.xy + 1.0;               
    vec2 t = tracedPos - corners.xy;

    vec4 tex11 = texture2D(inputSampler, corners.xy / resolution);
    vec4 tex21 = texture2D(inputSampler, corners.zy / resolution);
    vec4 tex12 = texture2D(inputSampler, corners.xw / resolution);
    vec4 tex22 = texture2D(inputSampler, corners.zw / resolution);

    gl_FragColor = mix(mix(tex11, tex21, t.x), mix(tex12, tex22, t.x), t.y) * dissipate;
}