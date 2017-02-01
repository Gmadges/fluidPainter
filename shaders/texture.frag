#version 300 es

out mediump vec4 FragColor;

uniform sampler2D image;                               

void main()                                                          
{ 
    vec3 color = texture(image, gl_FragCoord.xy).xyz;
    //vec3 color = vec3(1.0, 0.0, 1.0);
    FragColor = vec4(color, 1.0f);       
}