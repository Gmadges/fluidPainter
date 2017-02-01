#ifndef BUFFERS_H
#define BUFFERS_H

#include "GLES3/gl3.h"
#include "emscripten/bind.h"


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


EMSCRIPTEN_BINDINGS(Buffers) {

    emscripten::value_object<Buffer>("Buffer")
        .field("fboHandle", &Buffer::fboHandle)
        .field("texHandle", &Buffer::texHandle);


    emscripten::value_object<DoubleBuffer>("DoubleBuffer")
        .field("writeBuffer", &DoubleBuffer::writeBuffer)
        .field("readBuffer", &DoubleBuffer::readBuffer);
}

#endif