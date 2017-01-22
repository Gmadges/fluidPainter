#ifndef SHADERSOURCE_H
#define SHADERSOURCE_H

static const char simpleVertShaderSource[] =
    "attribute vec4 vPosition;		                     \n"
    "varying vec3 color;                                 \n"
    "void main()                                         \n"
    "{                                                   \n"
    "   gl_Position = vPosition;                         \n"
    "   color = gl_Position.xyz + vec3(0.5);             \n"
    "}                                                   \n";

static const char simpleFragShaderSource[] =
    "precision mediump float;                     \n"
    "varying vec3 color;                          \n"
    "void main()                                  \n"
    "{                                            \n"
    "  gl_FragColor = vec4 ( color, 1.0 );        \n"
    "}                                            \n";


#endif