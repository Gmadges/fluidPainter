#version 300 es                                                        
out mediump float FragColor;                                           

uniform sampler2D Velocity;                                                                                  
uniform mediump float HalfInverseCellSize;                            

void main()                                                           
{                                                                     
    ivec2 T = ivec2(gl_FragCoord.xy);                                 

    // Find neighboring velocities:
    vec2 vN = texelFetchOffset(Velocity, T, 0, ivec2(0, 1)).xy;       
    vec2 vS = texelFetchOffset(Velocity, T, 0, ivec2(0, -1)).xy;      
    vec2 vE = texelFetchOffset(Velocity, T, 0, ivec2(1, 0)).xy;       
    vec2 vW = texelFetchOffset(Velocity, T, 0, ivec2(-1, 0)).xy;        

    FragColor = HalfInverseCellSize * (vE.x - vW.x + vN.y - vS.y);    
}                                                                     
