precision highp float;

uniform sampler2D velocity;                                    
uniform sampler2D inputSampler;                                       

uniform vec2 resolution; 
uniform float dt;

void main(void) 
{
    vec2 pos = gl_FragCoord.xy;

    vec2 tracedPos = pos - dt * texture2D(velocity, pos / resolution).xy * 100.0;
    
    // things get blurrier over time because of the sampling
    // if theres no velocity lets just leave it.
    // if(tracedPos == pos) 
    // {
    //     gl_FragColor = texture2D(inputSampler, pos / resolution);
    //     return;
    // }

    vec4 corners;
    corners.xy = floor(tracedPos - 0.5) + 0.5; 
    corners.zw = corners.xy + 1.0;               
    vec2 t = tracedPos - corners.xy;

    vec4 tex11 = texture2D(inputSampler, corners.xy / resolution);
    vec4 tex21 = texture2D(inputSampler, corners.zy / resolution);
    vec4 tex12 = texture2D(inputSampler, corners.xw / resolution);
    vec4 tex22 = texture2D(inputSampler, corners.zw / resolution);

    gl_FragColor = mix(mix(tex11, tex21, t.x), mix(tex12, tex22, t.x), t.y);
}