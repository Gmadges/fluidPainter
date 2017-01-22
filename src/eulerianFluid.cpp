#include "eulerianFluid.h"
#include "shaders.h"
#include "shaderSource.h"

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
    clearSurface(Temperature.src, AmbientTemperature);

    // init programs
    advectProgram = Shaders::buildProgram(vertShaderSource, advectFragShaderSource);
    //jacobiProgram = Shaders::buildProgram(vertShaderSource, jacobiFragShaderSource);
    //subtractGradientProgram = Shaders::buildProgram(vertShaderSource, subGradientFragShaderSource);
    //computeDivergenceProgram = Shaders::buildProgram(vertShaderSource, computeDivergenceFragShaderSource);
    //applyImpulseProgram = Shaders::buildProgram(vertShaderSource, impulseFragShaderSource);
    //applyBuoyancyProgram = Shaders::buildProgram(vertShaderSource, buoyancyFragShaderSource);
    
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

void EulerianFluid::swapBuffers(Slab& slab)
{
    Surface temp = slab.src;
    slab.src = slab.dest;
    slab.dest = temp;
}

void EulerianFluid::clearSurface(Surface s, float value)
{
    glBindFramebuffer(GL_FRAMEBUFFER, s.fboHandle);
    glClearColor(value, value, value, value);
    glClear(GL_COLOR_BUFFER_BIT);
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

void EulerianFluid::resetState()
{
    glActiveTexture(GL_TEXTURE2); glBindTexture(GL_TEXTURE_2D, 0);
    glActiveTexture(GL_TEXTURE1); glBindTexture(GL_TEXTURE_2D, 0);
    glActiveTexture(GL_TEXTURE0); glBindTexture(GL_TEXTURE_2D, 0);
    glBindFramebuffer(GL_FRAMEBUFFER, 0);
    glDisable(GL_BLEND);
}

