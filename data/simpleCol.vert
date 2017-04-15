attribute vec4 Position;   
attribute vec3 Colour;   
attribute vec2 Texcoord;

varying vec3 col;
varying vec2 tex;

void main()                           
{  
    tex = Texcoord;
    col = Colour;
    gl_Position = Position;
}        