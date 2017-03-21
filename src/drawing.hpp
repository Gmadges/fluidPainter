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

    void init(int width, int height);
    void drawBuffer(Buffer& buffer);

private:
    int m_width; 
    int m_height;

    GLuint simpleShaderProgram;
    std::vector<float> quadVerts;
    std::vector<float> quadTex;
};

EMSCRIPTEN_BINDINGS(DrawingBindings) 
{   
    emscripten::class_<Drawing>("Drawing")
        .constructor<>()
        .function("init", &Drawing::init)
        .function("drawBuffer", &Drawing::drawBuffer);
}

///////////////////////////////////// SOURCE

void Drawing::init(int width, int height)
{
    quadVerts =  {
        -1.0f,  1.0f, 0.0f, // Top-left
        1.0f,  1.0f, 0.0f, // Top-right
        1.0f, -1.0f, 0.0f, // Bottom-right

        1.0f, -1.0f, 0.0f, // Bottom-right
        -1.0f, -1.0f, 0.0f, // Bottom-left
        -1.0f,  1.0f, 0.0f, // Top-left
    };

    quadTex = {
        0.0f, 0.0f, // Top-left
        1.0f, 0.0f, // Top-right
        1.0f, 1.0f, // Bottom-right
        
        1.0f, 1.0f, // Bottom-right
        0.0f, 1.0f,  // Bottom-left
        0.0f, 0.0f, // Top-left
    };

    m_width = width; 
    m_height = height;

    simpleShaderProgram = Shaders::buildProgramFromFiles("shaders/simpleTex.vert", "shaders/texture.frag");
}

void Drawing::drawBuffer(Buffer& buffer)
{
    glViewport(0, 0, m_width, m_height);
    //fill the screen with the clear color
    glClear(GL_COLOR_BUFFER_BIT);

    //enable our shader program
    glUseProgram(simpleShaderProgram);

    glActiveTexture(GL_TEXTURE0);
    glBindTexture(GL_TEXTURE_2D, buffer.texHandle);

    //set up the vertices array
    glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 0, quadVerts.data());
    glEnableVertexAttribArray(0);

    glVertexAttribPointer(1, 2, GL_FLOAT, GL_FALSE, 0, quadTex.data());
    glEnableVertexAttribArray(1);
    
    //draw the triangle
    glDrawArrays(GL_TRIANGLES, 0, 6);

    //swap buffer to make whatever we've drawn to backbuffer appear on the screen
    SDL_GL_SwapBuffers();
}

#endif