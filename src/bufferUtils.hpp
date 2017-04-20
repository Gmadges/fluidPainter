#ifndef BUFFERUTILS_HPP
#define BUFFERUTILS_HPP

#include "emscripten/bind.h"
#include "GLES2/gl2.h"
#include "buffers.h"

class BufferUtils
{
public:
    BufferUtils(){};
    ~BufferUtils(){};

    static Buffer createBuffer(int _width, int _height);
    static DoubleBuffer createDoubleBuffer(int _width, int _height);
    static DoubleBuffer swapBuffers(DoubleBuffer& _buffers);
    static void clearBuffer(Buffer& _buff);
};

EMSCRIPTEN_BINDINGS(BufferBindings) 
{   
    emscripten::class_<BufferUtils>("BufferUtils")
        .constructor<>()
        .class_function("createBuffer", &BufferUtils::createBuffer)
        .class_function("createDoubleBuffer", &BufferUtils::createDoubleBuffer)
        .class_function("swapBuffers", &BufferUtils::swapBuffers)
        .class_function("clearBuffer", &BufferUtils::clearBuffer);
}


//////////////////////////////////////////////// SOURCE

Buffer BufferUtils::createBuffer(int _width, int _height)
{
    Buffer buff;

    // create frame buffer
    glGenFramebuffers(1, &buff.fboHandle);
    glBindFramebuffer(GL_FRAMEBUFFER, buff.fboHandle);

    // create the create the texture and allocate the memory
    glGenTextures(1, &buff.texHandle);
    glBindTexture(GL_TEXTURE_2D, buff.texHandle);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);

    // we use this large texture because webgl doesnt like using smaller ones
    glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, _width, _height, 0, GL_RGBA, GL_FLOAT, 0);

    // turn into frame buffer
    GLuint colorbuffer;
    glGenRenderbuffers(1, &colorbuffer);
    glBindRenderbuffer(GL_RENDERBUFFER, colorbuffer);
    glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D, buff.texHandle, 0);

    // clear the buffer
    glClearColor(0, 0, 0, 0);
    glClear(GL_COLOR_BUFFER_BIT);
    glBindFramebuffer(GL_FRAMEBUFFER, 0);

    return buff;    
}

DoubleBuffer BufferUtils::createDoubleBuffer(int _width, int _height)
{
    DoubleBuffer buff;

    buff.readBuffer = createBuffer(_width, _height);
    buff.writeBuffer = createBuffer(_width, _height);

    return buff;
}

DoubleBuffer BufferUtils::swapBuffers(DoubleBuffer& _buffers)
{
    DoubleBuffer buff;

    // swap textures
    buff.writeBuffer.texHandle = _buffers.readBuffer.texHandle;
    buff.readBuffer.texHandle = _buffers.writeBuffer.texHandle;

    // swap fbos
    buff.writeBuffer.fboHandle = _buffers.readBuffer.fboHandle;
    buff.readBuffer.fboHandle = _buffers.writeBuffer.fboHandle;

    return buff;
}

void BufferUtils::clearBuffer(Buffer& _buff)
{
    glBindFramebuffer(GL_FRAMEBUFFER, _buff.fboHandle);

    // clear the buffer
    glClearColor(0, 0, 0, 0);
    glClear(GL_COLOR_BUFFER_BIT);

    // unbind
    glBindFramebuffer(GL_FRAMEBUFFER, 0);
}

#endif