#include "eulerianFluid.h"
#include "shaders.h"
#include "shaderSource.h"

EulerianFluid::EulerianFluid()
{
}

void EulerianFluid::reset()
{
    
}

bool EulerianFluid::init(int width, int height)
{   
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

void EulerianFluid::applyImpulse()
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

