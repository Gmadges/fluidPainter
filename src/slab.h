#ifndef SLAB_H
#define SLAB_H

#include "surface.h"

class Slab
{
public:

    Slab();
    ~Slab(){};

    void init(int height, int width, int numComp);

public:
    
    Surface src;
    Surface dest;

};

#endif