#include "eulerianFluid.h"

EulerianFluid::EulerianFluid()
{
}

~EulerianFluid::EulerianFluid()
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
    glViewport(0, 0, GridWidth, GridHeight);

    //advect velocities

    // advect velocity and temp

    // advect density

    // apply buoyency

    // apply impulse to temp and density

    // compute divergence

    // do jacobi iterations

    // subtract gradient
}

void EulerianFluid::swapBuffers()
{

}

void EulerianFluid::clearSurface()
{

}

void EulerianFluid::advect()
{

}

void EulerianFluid::applyBuoyency()
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

