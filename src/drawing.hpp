#ifndef DRAWING_HPP
#define DRAWING_HPP

#include "emscripten/bind.h"
#include "GLES2/gl2.h"

#include "buffers.h"
#include "shaders.h"

class Drawing
{
public:
    Drawing(){};
    ~Drawing(){};

    void init(int _width, int _height);
    void resetBuffer(Buffer& _buffer);
    void drawBuffer(Buffer& _buffer);
    void setSize(int _width, int _height);

private:
    int m_width; 
    int m_height;

    GLuint m_simpleShaderProgram;
    GLuint m_resetBufferProgram;
    std::vector<float> m_quadVerts;
    std::vector<float> m_quadTex;
};

EMSCRIPTEN_BINDINGS(DrawingBindings) 
{   
    emscripten::class_<Drawing>("Drawing")
        .constructor<>()
        .function("init", &Drawing::init)
        .function("drawBuffer", &Drawing::drawBuffer)
        .function("setSize", &Drawing::setSize)
        .function("resetBuffer", &Drawing::resetBuffer);
}

///////////////////////////////////// SOURCE

void Drawing::init(int _width, int _height)
{
    m_quadVerts =  {
        -1.0f,  1.0f, 0.0f, // Top-left
        1.0f,  1.0f, 0.0f, // Top-right
        1.0f, -1.0f, 0.0f, // Bottom-right

        1.0f, -1.0f, 0.0f, // Bottom-right
        -1.0f, -1.0f, 0.0f, // Bottom-left
        -1.0f,  1.0f, 0.0f, // Top-left
    };

    m_quadTex = {
        0.0f, 0.0f, // Top-left
        1.0f, 0.0f, // Top-right
        1.0f, 1.0f, // Bottom-right
        
        1.0f, 1.0f, // Bottom-right
        0.0f, 1.0f,  // Bottom-left
        0.0f, 0.0f, // Top-left
    };

    m_width = _width; 
    m_height = _height;

    m_simpleShaderProgram = Shaders::buildProgramFromFiles("data/simpleTex.vert", "data/texture.frag");
    m_resetBufferProgram = Shaders::buildProgramFromFiles("data/simple.vert", "data/visBuffer.frag");
}

void Drawing::setSize(int _width, int _height)
{
    m_width = _width;
    m_height = _height;
}

void Drawing::resetBuffer(Buffer& _buffer)
{
    glViewport(0, 0, m_width, m_height);

    //enable our shader program
    glUseProgram(m_resetBufferProgram);

    glBindFramebuffer(GL_FRAMEBUFFER, _buffer.fboHandle);

    //set up the vertices array
    glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 0, m_quadVerts.data());
    glEnableVertexAttribArray(0);
    
    //draw the triangle
    glDrawArrays(GL_TRIANGLES, 0, 6);

    glBindFramebuffer(GL_FRAMEBUFFER, 0);
}

void Drawing::drawBuffer(Buffer& _buffer)
{
    glViewport(0, 0, m_width, m_height);
    //fill the screen with the clear color
    glClear(GL_COLOR_BUFFER_BIT);

    //enable our shader program
    glUseProgram(m_simpleShaderProgram);

    glActiveTexture(GL_TEXTURE0);
    glBindTexture(GL_TEXTURE_2D, _buffer.texHandle);

    //set up the vertices array
    glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 0, m_quadVerts.data());
    glEnableVertexAttribArray(0);

    glVertexAttribPointer(1, 2, GL_FLOAT, GL_FALSE, 0, m_quadTex.data());
    glEnableVertexAttribArray(1);
    
    //draw the triangle
    glDrawArrays(GL_TRIANGLES, 0, 6);
}

#endif