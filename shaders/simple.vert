#version 300 es                       
in vec4 Position;   
in vec2 Texcoord;              

out mediump vec2 tex;

void main()                           
{  
    tex = Texcoord;                                         
    gl_Position = Position;     
}                                     