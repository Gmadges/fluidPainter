#include <iostream>
#include <GLES3/gl3.h>
#include <SDL/SDL.h>

#ifdef EMSCRIPTEN
#include <emscripten.h>
#endif

#include "shaders.h"
#include "eulerianFluid.h"

GLuint programObject;
SDL_Surface* screen;

EulerianFluid fluid;

GLfloat vVertices[] = {

    -1.0f,  1.0f, 0.0f, // Top-left
     1.0f,  1.0f, 0.0f, // Top-right
     1.0f, -1.0f, 0.0f, // Bottom-right

     1.0f, -1.0f, 0.0f, // Bottom-right
    -1.0f, -1.0f, 0.0f, // Bottom-left
    -1.0f,  1.0f, 0.0f, // Top-left

};

extern "C" int initGL(int width, int height)
{
	//initialise SDL
	if (SDL_Init(SDL_INIT_VIDEO | SDL_INIT_AUDIO | SDL_INIT_TIMER) == 0) 
	{
		screen = SDL_SetVideoMode(width, height, 0, SDL_OPENGL);
		if (screen == NULL)
		{
			std::cerr << "Could not set video mode: " << SDL_GetError() << std::endl;
			return 0;
		}
	}
	else 
	{
		std::cerr << "Could not initialize SDL: " << SDL_GetError() << std::endl;
		return 0;
	}

	glClearColor(0.0f, 0.0f, 0.0f, 1.0f);
	//glColorMask(GL_TRUE, GL_TRUE, GL_TRUE, GL_FALSE);
	glViewport(0, 0, width, height);

	// init our fluid
	fluid.init(width, height);

	return 1;
}

extern "C" void update()
{
	fluid.update(0.1f);
}

extern "C" void draw()
{
	fluid.draw();

	//swap buffer to make whatever we've drawn to backbuffer appear on the screen
	//SDL_GL_SwapBuffers();
}