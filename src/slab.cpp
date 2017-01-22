#include "slab.h"

Slab::Slab()
{

}

void Slab::init(int height, int width, int numComp)
{
    src.init(height, width, numComp);
    dest.init(height, width, numComp);
}