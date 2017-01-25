#version 300 es                                                     
out mediump vec4 FragColor;                                         

uniform sampler2D Pressure;                                                
uniform sampler2D Divergence;                                                                                           

uniform mediump float Alpha;                                               
uniform mediump float InverseBeta;                                         

void main()                                                                
{                                                                          
    ivec2 T = ivec2(gl_FragCoord.xy);       

    // Find neighboring pressure:                                          
    vec4 pN = texelFetchOffset(Pressure, T, 0, ivec2(0, 1));
    vec4 pS = texelFetchOffset(Pressure, T, 0, ivec2(0, -1));
    vec4 pE = texelFetchOffset(Pressure, T, 0, ivec2(1, 0));
    vec4 pW = texelFetchOffset(Pressure, T, 0, ivec2(-1, 0));
    vec4 pC = texelFetch(Pressure, T, 0);

    vec4 bC = texelFetch(Divergence, T, 0);
    
    FragColor = (pW + pE + pS + pN + Alpha * bC) * InverseBeta;            
}  