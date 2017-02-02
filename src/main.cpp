#include <iostream>
#include <GLES3/gl3.h>
#include <SDL/SDL.h>

#ifdef EMSCRIPTEN
#include <emscripten.h>
#endif

#include <emscripten/bind.h>

#include "bufferUtils.hpp"
#include "drawing.hpp"
#include "gridFluidSolver.hpp"

// should store this somewhere?
SDL_Surface* screen;


int initGL(int width, int height)
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
	glViewport(0, 0, width, height);

	return 1;
}

EMSCRIPTEN_BINDINGS(initialise) 
{
    emscripten::function("initGL", &initGL);
}