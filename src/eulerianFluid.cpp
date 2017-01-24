#include "eulerianFluid.h"
#include "shaders.h"
#include "fluidShaderSource.h"

EulerianFluid::EulerianFluid()
{
}

void EulerianFluid::reset()
{
    
}

bool EulerianFluid::init(int width, int height)
{   
    // init buffers
    pVelocityBuffers.reset(new DoubleBuffer(height, width));
	pPressureBuffers.reset(new DoubleBuffer(height, width));
    pDivergenceBuffer.reset(new Buffer(height, width));

    // init programs 

    return true;
}

void EulerianFluid::update()
{
    //advect velocities

    // advect velocity and temp

    // apply impulse to temp and density

    // compute divergence

    // do jacobi iterations for pressure solving

    // subtract gradient
}

void EulerianFluid::advect()
{

}

void EulerianFluid::applyForces()
{

}

void EulerianFluid::computeDivergence()
{

}

void EulerianFluid::jacobi()
{

}

void EulerianFluid::subtractGradient()
{

}

void EulerianFluid::resetState()
{

}

