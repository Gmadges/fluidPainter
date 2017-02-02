#ifndef DRAWING_HPP
#define DRAWING_HPP

#include "emscripten/bind.h"
#include "GLES3/gl3.h"

#include "buffers.h"
#include "shaders.h"

class Drawing
{
public:
    Drawing(){};
    ~Drawing(){};

    void init()
    {
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

    void drawBuffer(Buffer& buffer)
    {
        //fill the screen with the clear color
        glClear(GL_COLOR_BUFFER_BIT);

        //enable our shader program
        glUseProgram(simpleShaderProgram);

        //set up the vertices array
        glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 0, quadVerts.data());
        glEnableVertexAttribArray(0);
        
        glActiveTexture(GL_TEXTURE0);
        glBindTexture(GL_TEXTURE_2D, buffer.texHandle);
        
        //draw the triangle
        glDrawArrays(GL_TRIANGLES, 0, 6);

        //swap buffer to make whatever we've drawn to backbuffer appear on the screen
        SDL_GL_SwapBuffers();
    }

    private:

    GLuint simpleShaderProgram;
    std::vector<float> quadVerts;
};

EMSCRIPTEN_BINDINGS(DrawingBindings) 
{   
    emscripten::class_<Drawing>("Drawing")
        .constructor<>()
        .function("init", &Drawing::init)
        .function("drawBuffer", &Drawing::drawBuffer);
}

#endif