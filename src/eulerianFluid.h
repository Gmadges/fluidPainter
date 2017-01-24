#ifndef EULERIANFLUID_H
#define EULERIANFLUID_H

#include "types.h"
#include "doubleBuffer.h"

class EulerianFluid
{
    public:

    EulerianFluid();
    ~EulerianFluid(){};

    bool init(int width, int height);
    void update();
    void reset();

    private:

    void resetState();
    void advect();
    void applyImpulse();
    void computeDivergence();
    void jacobi();
    void subtractGradient();

    private:

    GLuint advectProgram;
    GLuint jacobiProgram;
    GLuint subtractGradientProgram;
    GLuint computeDivergenceProgram;
    GLuint applyImpulseProgram;
    GLuint applyBuoyancyProgram; 
};

#endif