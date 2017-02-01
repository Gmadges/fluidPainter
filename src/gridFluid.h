#ifndef GRIDFLUID_H
#define GRIDFLUID_H

#include <memory>
#include "types.h"
#include "doubleBuffer.h"

class GridFluid
{
public:

    GridFluid();
    ~GridFluid(){};

    bool init(int width, int height);
    void update(float delta);
    void reset();
    void draw();

private:

    void resetState();
    void advectVelocity(float dt);
    void applyForces();
    void computeDivergence();
    void jacobi();
    void subtractGradient();

private:

    int m_width;
    int m_height;

    // buffers
    std::shared_ptr<DoubleBuffer> pVelocityBuffers;
	std::shared_ptr<DoubleBuffer> pPressureBuffers;
	std::shared_ptr<Buffer> pDivergenceBuffer; 

    // shader programs
    GLuint advectProgram;
    GLuint jacobiProgram;
    GLuint subtractGradientProgram;
    GLuint computeDivergenceProgram;
    GLuint applyForceProgram;
    GLuint simpleDrawProgram;

};

#endif