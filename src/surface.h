#ifndef SURFACE_H
#define SURFACE_H

#include "GLES3/gl3.h"

class Surface
{
public:

    Surface();
    ~Surface(){};

    void init(int height, int width, int numComps);

public:
    
    GLuint fboHandle;
    GLuint textureHandle;
    int numComponents;

};

#endif