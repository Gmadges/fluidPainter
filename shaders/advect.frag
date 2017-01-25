#version 300 es

out mediump vec4 FragColor;

uniform sampler2D velocity;                                    
uniform sampler2D target;                                       

uniform mediump vec2 InverseSize;                                      
uniform mediump float dt;                             


vec4 f4texRECTbilerp(vec2 pos) 
{
    vec4 st;
    st.xy = floor(pos - 0.5) + 0.5;
    st.zw = st.xy + 1.0;

    vec2 t = pos - st.xy; //interpolating factors

    vec4 tex11 = texture(target, st.xy);
    vec4 tex21 = texture(target, st.zy);
    vec4 tex12 = texture(target, st.xw);
    vec4 tex22 = texture(target, st.zw);

    // bilinear interpolation
    return mix(mix(tex11, tex21, t.x), mix(tex12, tex22, t.x), t.y);
}


void main()                                                          
{  
    // get tex coords
    vec2 fragCoord = gl_FragCoord.xy;                                                                                               

    // find position
    vec2 pos = InverseSize * (fragCoord - dt * texture(velocity, InverseSize * fragCoord).xy);

    FragColor = f4texRECTbilerp(pos);       
}