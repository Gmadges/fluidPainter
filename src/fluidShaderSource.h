#ifndef FLUIDSHADERSOURCE_H
#define FLUIDSHADERSOURCE_H

// shaders for calculating

static const char vertShaderSource[] =
    "#version 300 es                       \n"
    "in vec4 Position;              \n"
    "void main()                           \n"
    "{                                     \n"
    "    gl_Position = Position;           \n"
    "}                                     \n";

static const char advectFragShaderSource[] = "";

static const char jacobiFragShaderSource[] = "";

static const char subGradientFragShaderSource[] = "";  

static const char computeDivergenceFragShaderSource[] = "";

static const char impulseFragShaderSource[] = "";

#endif