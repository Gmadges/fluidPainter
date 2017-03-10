precision highp float;
                                      
uniform sampler2D image;
uniform vec2 resolution;                            

void main()                                                          
{
    vec3 color = texture2D(image, gl_FragCoord.xy / resolution).rgb;
    gl_FragColor = vec4(color, 1.0);       
}