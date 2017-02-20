attribute vec4 Position;   
attribute vec2 Texcoord;              

varying mediump vec2 tex;

void main()                           
{  
    tex = Texcoord;
    gl_Position = Position;
}                                     