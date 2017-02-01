// #include "bufferUtils.h"
// #include "GLES3/gl3.h"

// Buffer BufferUtils::createBuffer(int width, int height)
// {
//     Buffer buff;

//     // create frame buffer
//     glGenFramebuffers(1, &buff.fboHandle);
//     glBindFramebuffer(GL_FRAMEBUFFER, buff.fboHandle);

//     // create the create the texture and allocate the memory
//     glGenTextures(1, &buff.texHandle);
//     glBindTexture(GL_TEXTURE_2D, buff.texHandle);
//     glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
//     glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
//     glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
//     glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);

//     // we use this large texture because webgl doesnt like using smaller ones
//     glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA32F, width, height, 0, GL_RGBA, GL_FLOAT, 0);

//     // turn into frame buffer
//     GLuint colorbuffer;
//     glGenRenderbuffers(1, &colorbuffer);
//     glBindRenderbuffer(GL_RENDERBUFFER, colorbuffer);
//     glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D, buff.texHandle, 0);

//     // clear the buffer
//     glClearColor(0, 0, 0, 0);
//     glClear(GL_COLOR_BUFFER_BIT);
//     glBindFramebuffer(GL_FRAMEBUFFER, 0);

//     return buff;
// }

// DoubleBuffer BufferUtils::createDoubleBuffer(int width, int height)
// {
//     DoubleBuffer buff;

//     buff.readBuffer = createBuffer(width, height);
//     buff.writeBuffer = createBuffer(width, height);

//     return buff;
// }

// void BufferUtils::swapBuffers(DoubleBuffer& buffers)
// {
//     // swap textures
//     unsigned int tmptex = buffers.writeBuffer.texHandle;
//     buffers.writeBuffer.texHandle = buffers.readBuffer.texHandle;
//     buffers.readBuffer.texHandle = tmptex;

//     // swap fbos
//     unsigned int tmpfbo = buffers.writeBuffer.fboHandle;
//     buffers.writeBuffer.fboHandle = buffers.readBuffer.fboHandle;
//     buffers.readBuffer.fboHandle = tmpfbo;
// }

