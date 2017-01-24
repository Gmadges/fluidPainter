#ifndef BUFFER_H
#define BUFFER_H

#include "GLES3/gl3.h"

class Buffer
{
public:

    Buffer(int height, int width);
    ~Buffer(){};

private:
    void init(int height, int width);

public:
    GLuint fboHandle;
    GLuint textureHandle;

};

#endif