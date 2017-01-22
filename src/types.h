#ifndef TYPES_H
#define TYPES_H

#include "GLES3/gl3.h"

typedef struct Surface_ {
    GLuint FboHandle;
    GLuint TextureHandle;
    int NumComponents;
} Surface;

typedef struct Slab_ {
    Surface Ping;
    Surface Pong;
} Slab;

typedef struct Vec2_ {
    int X;
    int Y;
} Vec2;

#endif