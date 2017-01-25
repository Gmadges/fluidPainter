#version 300 es                                       
out mediump vec4 FragColor;                           

uniform mediump vec2 Point;                           
uniform mediump float Radius;                         
uniform mediump vec3 FillColor;                       

void main()                                           
{                                                     
    float d = distance(Point, gl_FragCoord.xy);       
    
    if (d < Radius) 
    {                                 
        float a = (Radius - d) * 0.5;                 
        a = min(a, 1.0);                              
        FragColor = vec4(FillColor, a);               
    } 
    else 
    {                                          
        FragColor = vec4(0);                          
    }                                                 
}                                                     