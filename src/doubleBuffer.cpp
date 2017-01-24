#include "doubleBuffer.h"

DoubleBuffer::DoubleBuffer(int height, int width)
:
    readBuffer(height, width),
    writeBuffer(height, width)
{

}