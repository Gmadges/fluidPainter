#ifndef BUFFERUTILS_H
#define BUFFERUTILS_H

#include "buffers.h"

class BufferUtils
{
public:

    BufferUtils();
    ~BufferUtils();

    static Buffer createBuffer(int width, int height);
    static DoubleBuffer createDoubleBuffer(int width, int height);

};

#endif