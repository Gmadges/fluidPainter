#ifndef GRIDFLUID_H
#define GRIDFLUID_H

#include <memory>
#include "types.h"

class GridFluid
{
public:

    GridFluid();
    ~GridFluid(){};

    bool init(int width, int height);
    void advectVelocity(float dt);
    void applyForces();
    void computeDivergence();
    void jacobi();
    void subtractGradient();

private:
    void resetState();

private:

    int m_height;
    int m_width;

    // shader programs
    GLuint advectProgram;
    GLuint jacobiProgram;
    GLuint subtractGradientProgram;
    GLuint computeDivergenceProgram;
    GLuint applyForceProgram;
    GLuint simpleDrawProgram;

};



#endif