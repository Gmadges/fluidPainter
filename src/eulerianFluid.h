#ifndef EULERIANFLUID_H
#define EULERIANFLUID_H

#include <memory>
#include "types.h"
#include "doubleBuffer.h"

class EulerianFluid
{
public:

    EulerianFluid();
    ~EulerianFluid(){};

    bool init(int width, int height);
    void update(float delta);
    void reset();

private:

    void resetState();
    void advectVelocity(float dt);
    void applyForces(float dt);
    void computeDivergence();
    void jacobi();
    void subtractGradient();

private:

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

};

#endif