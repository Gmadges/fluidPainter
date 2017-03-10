precision highp float;

varying vec2 tex;                                           
uniform sampler2D image;                               

void main()                                                          
{
    vec3 color = texture2D(image, tex).rgb;
    gl_FragColor = vec4(color, 1.0);       
}