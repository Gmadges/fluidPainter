#ifndef SHADERS_H
#define SHADERS_H

#include <GLES2/gl2.h>

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