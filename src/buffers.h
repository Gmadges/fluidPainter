#ifndef BUFFERS_H
#define BUFFERS_H

#include "emscripten/bind.h"
#include "GLES2/gl2.h"

struct Buffer 
{
    GLuint fboHandle;
    GLuint texHandle;
};

struct DoubleBuffer 
{
    Buffer writeBuffer;
    Buffer readBuffer;
};

EMSCRIPTEN_BINDINGS(BufferTypes) 
{
    emscripten::value_object<Buffer>("Buffer")
        .field("fboHandle", &Buffer::fboHandle)
        .field("texHandle", &Buffer::texHandle);


    emscripten::value_object<DoubleBuffer>("DoubleBuffer")
        .field("writeBuffer", &DoubleBuffer::writeBuffer)
        .field("readBuffer", &DoubleBuffer::readBuffer);
}

#endif