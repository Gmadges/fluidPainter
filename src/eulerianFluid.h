#ifndef EULERIANFLUID_H
#define EULERIANFLUID_H

#include "types.h"

class EulerianFluid
{
    public:

    EulerianFluid();
    ~EulerianFluid();

    bool init(int width, int height);
    void update();
    void reset();

    private:

    void swapBuffers();
    void clearSurface();
    void advect();
    void applyBuoyency();
    void applyImpulse();
    void computeDivergence();
    void jacobi();
    void subtractGradient();

    private:

    // buffer full of data
    Slab Velocity;
    Slab Density;
    Slab Pressure;
    Slab Temperature;
    Slab Divergence;

    // setting values
    float AmbientTemperature = 0.0f;
    float ImpulseTemperature = 10.0f;
    float ImpulseDensity = 1.0f;
    int NumJacobiIterations = 40;
    float TimeStep = 0.125f;
    float SmokeBuoyancy = 1.0f;
    float SmokeWeight = 0.05f;
    float GradientScale = 1.125f / CellSize;
    float TemperatureDissipation = 0.99f;
    float VelocityDissipation = 0.99f;
    float DensityDissipation = 0.9999f;
    Vec2 ImpulsePosition = { GridWidth / 2, - (int) SplatRadius / 2};
}

#endif