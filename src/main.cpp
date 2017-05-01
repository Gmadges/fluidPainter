#include <iostream>
#include <GLES2/gl2.h>
#include <SDL/SDL.h>

#ifdef EMSCRIPTEN
#include <emscripten.h>
#endif

#include <emscripten/bind.h>

#include "bufferUtils.hpp"
#include "drawing.hpp"
#include "gridFluidSolver.hpp"

/*
This file is pretty pointless now but i still use it as the entry point for compilation.
*/