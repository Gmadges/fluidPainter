#version 300 es
in mediump vec2 tex;

out highp vec4 FragColor;                           

uniform mediump vec2 Point;                           
uniform mediump float Radius;                         
uniform mediump vec3 FillColor;                       

void main()                                           
{   
    vec4 force = vec4(0,0,0,1);                                                  
    
    float d = distance(Point, tex);
    
    if (d < Radius) 
    {
        force = vec4(FillColor, 1.0);
    }  

    FragColor = force;                                                                   
}                                                     