#ifndef SHADERS_H
#define SHADERS_H

#include <GLES2/gl2.h>

/*
Helper class for loading shaders.

This our only class with a .h and .cpp
because we don't use embind and get horrible link issues.
*/

class Shaders
{
public:
    Shaders();
    ~Shaders(){};

    static GLuint buildProgram(const char * vertexShader, const char * fragmentShader);
    
    static GLuint buildProgramFromFiles(const char * vertexSourcePath, const char * fragSourcePath);

private:

    static GLuint loadShader(GLenum type, const char *source);
};

#endif