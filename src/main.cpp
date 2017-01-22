#include <iostream>
#include <GLES3/gl3.h>
#include <SDL/SDL.h>

#ifdef EMSCRIPTEN
#include <emscripten.h>
#endif

#include "shaders.h"

GLuint programObject;
SDL_Surface* screen;

GLfloat vVertices[] = {

    -1.0f,  1.0f, 0.0f, // Top-left
     1.0f,  1.0f, 0.0f, // Top-right
     1.0f, -1.0f, 0.0f, // Bottom-right

     1.0f, -1.0f, 0.0f, // Bottom-right
    -1.0f, -1.0f, 0.0f, // Bottom-left
    -1.0f,  1.0f, 0.0f, // Top-left

};

GLint uniformOriginX, uniformOriginY, uniformZoom;

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

	//SDL initialised successfully, now load shaders and geometry
	const char vertexShaderSource[] =
		"attribute vec4 vPosition;		                     \n"
		"varying vec3 color;                                 \n"
		"void main()                                         \n"
		"{                                                   \n"
		"   gl_Position = vPosition;                         \n"
		"   color = gl_Position.xyz + vec3(0.5);             \n"
		"}                                                   \n";

	const char fragmentShaderSource[] =
		"precision mediump float;                     \n"
		"varying vec3 color;                          \n"
		"void main()                                  \n"
		"{                                            \n"
		"  gl_FragColor = vec4 ( color, 1.0 );        \n"
		"}                                            \n";

	//load vertex and fragment shaders
	GLuint vertexShader = loadShader(GL_VERTEX_SHADER, vertexShaderSource);
	GLuint fragmentShader = loadShader(GL_FRAGMENT_SHADER, fragmentShaderSource);
	programObject = buildProgram(vertexShader, fragmentShader, "vPosition");

	glClearColor(0.0f, 0.0f, 0.0f, 1.0f);
	//glColorMask(GL_TRUE, GL_TRUE, GL_TRUE, GL_FALSE);
	glViewport(0, 0, width, height);
	return 1;
}

extern "C" void update()
{

}

extern "C" void draw()
{
	//fill the screen with the clear color
	glClear(GL_COLOR_BUFFER_BIT);

	//enable our shader program
	glUseProgram(programObject);

	//set up the vertices array
	glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 0, vVertices);
	glEnableVertexAttribArray(0);
	//draw the triangle
	glDrawArrays(GL_TRIANGLES, 0, 6);

	//swap buffer to make whatever we've drawn to backbuffer appear on the screen
	SDL_GL_SwapBuffers();
}