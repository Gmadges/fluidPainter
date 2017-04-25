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