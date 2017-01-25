#include "doubleBuffer.h"

DoubleBuffer::DoubleBuffer(int height, int width)
:
    readBuffer(height, width),
    writeBuffer(height, width)
{

}

void DoubleBuffer::swap()
{
    // swap textures
    GLuint tmptex = writeBuffer.textureHandle;
    writeBuffer.textureHandle = readBuffer.textureHandle;
    readBuffer.textureHandle = tmptex;

    // swap fbos
    GLuint tmpfbo = writeBuffer.fboHandle;
    writeBuffer.fboHandle = readBuffer.fboHandle;
    readBuffer.fboHandle = tmpfbo;
}