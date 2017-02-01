#include <iostream>
#include <GLES3/gl3.h>
#include <SDL/SDL.h>

#ifdef EMSCRIPTEN
#include <emscripten.h>
#endif

// #include "shaders.h"
// #include "eulerianFluid.h"

// GLuint programObject;
// SDL_Surface* screen;

// EulerianFluid fluid;

// GLfloat vVertices[] = {

//     -1.0f,  1.0f, 0.0f, // Top-left
//      1.0f,  1.0f, 0.0f, // Top-right
//      1.0f, -1.0f, 0.0f, // Bottom-right

//      1.0f, -1.0f, 0.0f, // Bottom-right
//     -1.0f, -1.0f, 0.0f, // Bottom-left
//     -1.0f,  1.0f, 0.0f, // Top-left

// };

// extern "C" int initGL(int width, int height)
// {
// 	//initialise SDL
// 	if (SDL_Init(SDL_INIT_VIDEO | SDL_INIT_AUDIO | SDL_INIT_TIMER) == 0) 
// 	{
// 		screen = SDL_SetVideoMode(width, height, 0, SDL_OPENGL);
// 		if (screen == NULL)
// 		{
// 			std::cerr << "Could not set video mode: " << SDL_GetError() << std::endl;
// 			return 0;
// 		}
// 	}
// 	else 
// 	{
// 		std::cerr << "Could not initialize SDL: " << SDL_GetError() << std::endl;
// 		return 0;
// 	}

// 	glClearColor(0.0f, 0.0f, 0.0f, 1.0f);
// 	//glColorMask(GL_TRUE, GL_TRUE, GL_TRUE, GL_FALSE);
// 	glViewport(0, 0, width, height);

// 	// init our fluid
// 	fluid.init(width, height);

// 	return 1;
// }

#include <emscripten/bind.h>

class MyClass {
public:
  MyClass(int x, std::string y)
    : x(x)
    , y(y)
  {}

  void incrementX() {
    ++x;
  }

  int getX() const { return x; }
  void setX(int x_) { x = x_; }

  static std::string getStringFromInstance(const MyClass& instance) {
    return instance.y;
  }

private:
  int x;
  std::string y;
};

// Binding code
EMSCRIPTEN_BINDINGS(my_class_example) {
  emscripten::class_<MyClass>("MyClass")
    .constructor<int, std::string>()
    .function("incrementX", &MyClass::incrementX)
    .property("x", &MyClass::getX, &MyClass::setX)
    .class_function("getStringFromInstance", &MyClass::getStringFromInstance)
    ;
}