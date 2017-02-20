precision mediump float;

varying mediump vec2 tex;

uniform sampler2D Velocity;                          

uniform mediump vec2 Point;                           
uniform mediump float Radius;                         
uniform mediump vec3 FillColor;                       

void main()                                           
{   
    float d = distance(Point, tex);
    
    if (d < Radius) 
    {
        gl_FragColor = vec4(FillColor, 1.0);
        return;
    } 

    gl_FragColor = texture2D(Velocity, tex);                                                                    
}                                                     