attribute vec4 Position;   
attribute vec3 Colour;              

varying vec3 col;

void main()                           
{  
    col = Colour;
    gl_Position = Position;
}        