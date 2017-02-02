#version 300 es
in mediump vec2 tex;

out highp vec4 FragColor;

uniform sampler2D source;                                    
uniform sampler2D target;                                       

uniform mediump float InverseSize;                                      
uniform mediump float dt;                             

//void main()                                                          
//{  
//    vec2 fragCoord = gl_FragCoord.xy;
//    vec2 u = texture(source, InverseSize * fragCoord).xy;
//    vec2 coord = InverseSize * (fragCoord - dt * u);

//    // just using a dissapation at the moment should probably blend
//    FragColor = 0.8 * texture(target, coord);
//}

void main()                                                          
{  
    // get tex coords
    vec2 fragCoord = tex;                                                                                               

    // find position
    vec2 pos = InverseSize * (fragCoord - dt * texture(source, InverseSize * fragCoord).xy);

    vec4 st;
    st.xy = floor(pos - 0.5) + 0.5;
    st.zw = st.xy + 1.0;

    vec2 t = pos - st.xy; //interpolating factors

    vec4 tex11 = texture(target, st.xy);
    vec4 tex21 = texture(target, st.zy);
    vec4 tex12 = texture(target, st.xw);
    vec4 tex22 = texture(target, st.zw);

    // bilinear interpolation
    FragColor = mix(mix(tex11, tex21, t.x), mix(tex12, tex22, t.x), t.y);
}