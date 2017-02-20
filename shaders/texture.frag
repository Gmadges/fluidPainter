in mediump vec2 tex;

out mediump vec4 FragColor;

uniform sampler2D image;                               

void main()                                                          
{ 
    vec3 color = texture(image, tex).xyz;
    FragColor = vec4(color, 1.0f);       
}