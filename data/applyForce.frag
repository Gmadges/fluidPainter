precision highp float;

varying vec3 col; 

void main()
{
    gl_FragColor = vec4(col, 1.0);
}