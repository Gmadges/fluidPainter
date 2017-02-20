precision mediump float;

varying mediump vec2 tex;

uniform sampler2D source;                                    
uniform sampler2D target;                                       

uniform mediump float InverseSize;                                      
uniform mediump float dt;                             

void main()                                                          
{  
    // get tex coords
    vec2 fragCoord = tex;                                                                                               

    // find position
    vec2 pos = InverseSize * (fragCoord - dt * texture2D(source, InverseSize * fragCoord).rg);

    vec4 st;
    st.xy = floor(pos - 0.5) + 0.5;
    st.zw = st.xy + 1.0;

    vec2 t = pos - st.xy; //interpolating factors

    vec4 tex11 = texture2D(target, st.xy);
    vec4 tex21 = texture2D(target, st.zy);
    vec4 tex12 = texture2D(target, st.xw);
    vec4 tex22 = texture2D(target, st.zw);

    // bilinear interpolation
    gl_FragColor = mix(mix(tex11, tex21, t.x), mix(tex12, tex22, t.x), t.y);
}