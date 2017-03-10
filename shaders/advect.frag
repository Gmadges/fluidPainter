precision highp float;

uniform sampler2D velocity;                                    
uniform sampler2D inputSampler;                                       

uniform vec2 resolution; 
uniform float dt;

void main(void) 
{
    vec2 pos =  gl_FragCoord.xy;

    vec2 tracedPos = pos - dt * texture2D(velocity, pos / resolution).xy * 100.0;
    
    vec2 tracedCoord = tracedPos / resolution;    
    vec2 delta = 2.0 / resolution;

    vec2 vT = texture2D(inputSampler, tracedCoord + vec2(0.0, delta.y)).xy;
    vec2 vB = texture2D(inputSampler, tracedCoord - vec2(0.0, delta.y)).xy;      
    vec2 vR = texture2D(inputSampler, tracedCoord + vec2(delta.x, 0.0)).xy;       
    vec2 vL = texture2D(inputSampler, tracedCoord - vec2(delta.x, 0.0)).xy; 

    //need to bilerp this result
    gl_FragColor = vec4(mix(mix(vL, vR, 0.5), mix(vT, vB, 0.5), 0.5), 0, 0);
}