#include "eulerianFluid.h"

#define CellSize (1.25f)

EulerianFluid::EulerianFluid()
{
}

void EulerianFluid::reset()
{
    
}

bool EulerianFluid::init(int width, int height)
{   
    // set values
    AmbientTemperature = 0.0f;
    ImpulseTemperature = 10.0f;
    ImpulseDensity = 1.0f;
    NumJacobiIterations = 40;
    TimeStep = 0.125f;
    SmokeBuoyancy = 1.0f;
    SmokeWeight = 0.05f;
    GradientScale = 1.125f / CellSize;
    TemperatureDissipation = 0.99f;
    VelocityDissipation = 0.99f;
    DensityDissipation = 0.9999f;
    ImpulsePosition = { width / 4, - (int) width / 16};

    // create slabs
    int w = width / 2;
    int h = height / 2;
    Velocity.init(w, h, 2);
    Density.init(w, h, 1);
    Pressure.init(w, h, 1);
    Temperature.init(w, h, 1);
    Divergence.init(w, h, 3);

    glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
    //ClearSurface(Temperature.Ping, AmbientTemperature);
    
    return true;
}

void EulerianFluid::update()
{
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

