#version 300 es                                                        
out mediump vec4 FragColor;                                            

uniform sampler2D Velocity;                                            
uniform sampler2D Pressure;                                                                                     
uniform mediump float GradientScale;                                   

void main()                                                            
{                                                                      
    ivec2 T = ivec2(gl_FragCoord.xy);                                                                                                

    // Find neighboring pressure:
    float pN = texelFetchOffset(Pressure, T, 0, ivec2(0, 1)).r;        
    float pS = texelFetchOffset(Pressure, T, 0, ivec2(0, -1)).r;       
    float pE = texelFetchOffset(Pressure, T, 0, ivec2(1, 0)).r;        
    float pW = texelFetchOffset(Pressure, T, 0, ivec2(-1, 0)).r;       
    float pC = texelFetch(Pressure, T, 0).r;                              

    // Use center pressure for solid cells:                                        
    
    vec2 vMask = vec2(1.0f);                                             

    // Enforce the free-slip boundary condition

    vec2 oldV = texelFetch(Velocity, T, 0).xy;                         
    vec2 grad = vec2(pE - pW, pN - pS) * GradientScale;                
    vec2 newV = oldV - grad;                                           
    FragColor = vec4((vMask * newV), 0, 1);                             
}                                                                       