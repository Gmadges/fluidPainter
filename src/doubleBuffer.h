#ifndef DOUBLEBUFFER_H
#define DOUBLEBUFFER_H

#include "buffer.h"

class DoubleBuffer
{
public:

    DoubleBuffer(int height, int width);
    ~DoubleBuffer(){};
    
public:

    Buffer writeBuffer;
    Buffer readBuffer;

};

#endif