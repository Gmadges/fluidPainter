#ifndef EULERIANFLUID_H
#define EULERIANFLUID_H

#include "types.h"
#include "slab.h"

class EulerianFluid
{
    public:

    EulerianFluid();
    ~EulerianFluid(){};

    bool init(int width, int height);
    void update();
    void reset();

    private:

    void swapBuffers(Slab& slab);
    void clearSurface(Surface s, float value);
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
    float AmbientTemperature;
    float ImpulseTemperature;
    float ImpulseDensity;
    int NumJacobiIterations;
    float TimeStep;
    float SmokeBuoyancy;
    float SmokeWeight;
    float GradientScale;
    float TemperatureDissipation;
    float VelocityDissipation;
    float DensityDissipation;
    Vec2 ImpulsePosition;
};

#endif