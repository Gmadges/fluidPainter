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

    void init(int height, int width);
    void drawBuffer(Buffer& buffer);

private:
    GLuint simpleShaderProgram;
    std::vector<float> quadVerts;
    std::vector<float> quadTex;

    int m_height;
    int m_width;
};

EMSCRIPTEN_BINDINGS(DrawingBindings) 
{   
    emscripten::class_<Drawing>("Drawing")
        .constructor<>()
        .function("init", &Drawing::init)
        .function("drawBuffer", &Drawing::drawBuffer);
}

///////////////////////////////////// SOURCE

void Drawing::init(int height, int width)
{
    m_height = height;
    m_width = width;

    quadVerts =  {
        -1.0f,  1.0f, 0.0f, // Top-left
        1.0f,  1.0f, 0.0f, // Top-right
        1.0f, -1.0f, 0.0f, // Bottom-right

        1.0f, -1.0f, 0.0f, // Bottom-right
        -1.0f, -1.0f, 0.0f, // Bottom-left
        -1.0f,  1.0f, 0.0f, // Top-left
    };

    simpleShaderProgram = Shaders::buildProgramFromFiles("shaders/simple.vert", "shaders/texture.frag");
}

void Drawing::drawBuffer(Buffer& buffer)
{
    //fill the screen with the clear color
    glClear(GL_COLOR_BUFFER_BIT);

    //enable our shader program
    glUseProgram(simpleShaderProgram);

    GLint res = glGetUniformLocation(simpleShaderProgram, "resolution");
    glUniform2f(res, (float)m_width, (float)m_height);

    glActiveTexture(GL_TEXTURE0);
    glBindTexture(GL_TEXTURE_2D, buffer.texHandle);

    //set up the vertices array
    glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 0, quadVerts.data());
    glEnableVertexAttribArray(0);
    
    //draw the triangle
    glDrawArrays(GL_TRIANGLES, 0, 6);

    //swap buffer to make whatever we've drawn to backbuffer appear on the screen
    SDL_GL_SwapBuffers();
}

#endif