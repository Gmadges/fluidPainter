#ifndef SHADERSOURCE_H
#define SHADERSOURCE_H

static const char simpleVertShaderSource[] =
    "attribute vec4 vPosition;		                     \n"
    "varying vec3 color;                                 \n"
    "void main()                                         \n"
    "{                                                   \n"
    "   gl_Position = vPosition;                         \n"
    "   color = gl_Position.xyz + vec3(0.5);             \n"
    "}                                                   \n";

static const char simpleFragShaderSource[] =
    "precision mediump float;                     \n"
    "varying vec3 color;                          \n"
    "void main()                                  \n"
    "{                                            \n"
    "  gl_FragColor = vec4 ( color, 1.0 );        \n"
    "}                                            \n";

// shaders for calculating

static const char vertShaderSource[] =
    "attribute vec4 Position;              \n"
    "void main()                           \n"
    "{                                     \n"
    "    gl_Position = Position;           \n"
    "}                                     \n";

static const char fillFragShaderSource[] = 
    "varying vec3 FragColor;            \n"
    "void main()                    \n"
    "{                              \n"
    "    FragColor = vec3(1, 0, 0); \n"
    "}                              \n";


static const char advectFragShaderSource[] = 
    "varying mediump vec4 FragColor;                                                \n"
    "uniform sampler2D VelocityTexture;                                     \n"
    "uniform sampler2D SourceTexture;                                       \n"
    "uniform sampler2D Obstacles;                                           \n"

    "uniform mediump vec2 InverseSize;                                              \n"
    "uniform mediump float TimeStep;                              \n"
    "uniform mediump float Dissipation;                           \n"

    "void main()                                                            \n"
    "{                                                                      \n"
    "    vec2 fragCoord = gl_FragCoord.xy;                                  \n"
    "    float solid = texture2D(Obstacles, InverseSize * fragCoord).x;       \n"
    "    if (solid > 0) {                                                   \n"
    "        FragColor = vec4(0);                                           \n"
    "        return;                                                        \n"
    "    }                                                                  \n"

    "    vec2 u = texture(VelocityTexture, InverseSize * fragCoord).xy;     \n"
    "    vec2 coord = InverseSize * (fragCoord - TimeStep * u);             \n"
    "    FragColor = Dissipation * texture(SourceTexture, coord);           \n"
    "}                                                                      \n";

static const char jacobiFragShaderSource[] = 
    "varying vec4 FragColor;                                                    \n"

    "uniform sampler2D Pressure;                                                \n"
    "uniform sampler2D Divergence;                                              \n"
    "uniform sampler2D Obstacles;                                               \n"

    "uniform float Alpha;                                                       \n"
    "uniform float InverseBeta;                                                 \n"

    "void main()                                                                \n"
    "{                                                                          \n"
    "    ivec2 T = ivec2(gl_FragCoord.xy);                                      \n"
        // Find neighboring pressure:                                          
    "    vec4 pN = texelFetchOffset(Pressure, T, 0, ivec2(0, 1));               \n"
    "    vec4 pS = texelFetchOffset(Pressure, T, 0, ivec2(0, -1));              \n"
    "    vec4 pE = texelFetchOffset(Pressure, T, 0, ivec2(1, 0));               \n"
    "    vec4 pW = texelFetchOffset(Pressure, T, 0, ivec2(-1, 0));              \n"
    "    vec4 pC = texelFetch(Pressure, T, 0);                                  \n"
        // Find neighboring obstacles:
    "    vec3 oN = texelFetchOffset(Obstacles, T, 0, ivec2(0, 1)).xyz;          \n"
    "    vec3 oS = texelFetchOffset(Obstacles, T, 0, ivec2(0, -1)).xyz;         \n"
    "    vec3 oE = texelFetchOffset(Obstacles, T, 0, ivec2(1, 0)).xyz;          \n"
    "    vec3 oW = texelFetchOffset(Obstacles, T, 0, ivec2(-1, 0)).xyz;         \n"
        // Use center pressure for solid cells:
    "    if (oN.x > 0) pN = pC;                                                 \n"
    "    if (oS.x > 0) pS = pC;                                                 \n"
    "    if (oE.x > 0) pE = pC;                                                 \n"
    "    if (oW.x > 0) pW = pC;                                                 \n"

    "    vec4 bC = texelFetch(Divergence, T, 0);                                \n"
    "    FragColor = (pW + pE + pS + pN + Alpha * bC) * InverseBeta;            \n"
    "}                                                                          \n";

static const char subGradientFragShaderSource[] =
    "varying vec2 FragColor;                                                    \n"

    "uniform sampler2D Velocity;                                            \n"
    "uniform sampler2D Pressure;                                            \n"
    "uniform sampler2D Obstacles;                                           \n"
    "uniform float GradientScale;                                           \n"

    "void main()                                                            \n"
    "{                                                                      \n"
    "    ivec2 T = ivec2(gl_FragCoord.xy);                                  \n"

    "    vec3 oC = texelFetch(Obstacles, T, 0).xyz;                         \n"
    "    if (oC.x > 0) {                                                    \n"
    "        FragColor = oC.yz;                                             \n"
    "        return;                                                        \n"
    "    }                                                                  \n"

        // Find neighboring pressure:
    "    float pN = texelFetchOffset(Pressure, T, 0, ivec2(0, 1)).r;        \n"
    "    float pS = texelFetchOffset(Pressure, T, 0, ivec2(0, -1)).r;       \n"
    "    float pE = texelFetchOffset(Pressure, T, 0, ivec2(1, 0)).r;        \n"
    "    float pW = texelFetchOffset(Pressure, T, 0, ivec2(-1, 0)).r;       \n"
    "    float pC = texelFetch(Pressure, T, 0).r;                           \n"

        // Find neighboring obstacles:
    "    vec3 oN = texelFetchOffset(Obstacles, T, 0, ivec2(0, 1)).xyz;      \n"
    "    vec3 oS = texelFetchOffset(Obstacles, T, 0, ivec2(0, -1)).xyz;     \n"
    "    vec3 oE = texelFetchOffset(Obstacles, T, 0, ivec2(1, 0)).xyz;      \n"
    "    vec3 oW = texelFetchOffset(Obstacles, T, 0, ivec2(-1, 0)).xyz;     \n"

        // Use center pressure for solid cells: 
    "    vec2 obstV = vec2(0);                                              \n"
    "    vec2 vMask = vec2(1);                                              \n"

    "    if (oN.x > 0) { pN = pC; obstV.y = oN.z; vMask.y = 0; }            \n"
    "    if (oS.x > 0) { pS = pC; obstV.y = oS.z; vMask.y = 0; }            \n"
    "    if (oE.x > 0) { pE = pC; obstV.x = oE.y; vMask.x = 0; }            \n"
    "    if (oW.x > 0) { pW = pC; obstV.x = oW.y; vMask.x = 0; }            \n"

        // Enforce the free-slip boundary condition:
    "    vec2 oldV = texelFetch(Velocity, T, 0).xy;                         \n"
    "    vec2 grad = vec2(pE - pW, pN - pS) * GradientScale;                \n"
    "    vec2 newV = oldV - grad;                                           \n"
    "    FragColor = (vMask * newV) + obstV;                                \n"
    "}                                                                      \n"; 

static const char computeDivergenceFragShaderSource[] =
    "varying float FragColor;                                                   \n"

    "uniform sampler2D Velocity;                                            \n"
    "uniform sampler2D Obstacles;                                           \n"
    "uniform float HalfInverseCellSize;                                     \n"

    "void main()                                                            \n"
    "{                                                                      \n"
    "    ivec2 T = ivec2(gl_FragCoord.xy);                                  \n"

        // Find neighboring velocities:
    "    vec2 vN = texelFetchOffset(Velocity, T, 0, ivec2(0, 1)).xy;        \n"
    "    vec2 vS = texelFetchOffset(Velocity, T, 0, ivec2(0, -1)).xy;       \n"
    "    vec2 vE = texelFetchOffset(Velocity, T, 0, ivec2(1, 0)).xy;        \n"
    "    vec2 vW = texelFetchOffset(Velocity, T, 0, ivec2(-1, 0)).xy;       \n"

        // Find neighboring obstacles:
    "    vec3 oN = texelFetchOffset(Obstacles, T, 0, ivec2(0, 1)).xyz;      \n"
    "    vec3 oS = texelFetchOffset(Obstacles, T, 0, ivec2(0, -1)).xyz;     \n"
    "    vec3 oE = texelFetchOffset(Obstacles, T, 0, ivec2(1, 0)).xyz;      \n"
    "    vec3 oW = texelFetchOffset(Obstacles, T, 0, ivec2(-1, 0)).xyz;     \n"

        // Use obstacle velocities for solid cells:
    "    if (oN.x > 0) vN = oN.yz;                                          \n"
    "    if (oS.x > 0) vS = oS.yz;                                          \n"
    "    if (oE.x > 0) vE = oE.yz;                                          \n"
    "    if (oW.x > 0) vW = oW.yz;                                          \n"

    "    FragColor = HalfInverseCellSize * (vE.x - vW.x + vN.y - vS.y);     \n"
    "}                                                                      \n";

static const char impulseFragShaderSource[] =
    "varying vec4 FragColor;                                    \n"

    "uniform vec2 Point;                                    \n"
    "uniform float Radius;                                  \n"
    "uniform vec3 FillColor;                                \n"

    "void main()                                            \n"
    "{                                                      \n"
    "    float d = distance(Point, gl_FragCoord.xy);        \n"
    "    if (d < Radius) {                                  \n"
    "        float a = (Radius - d) * 0.5;                  \n"
    "        a = min(a, 1.0);                               \n"
    "        FragColor = vec4(FillColor, a);                \n"
    "    } else {                                           \n"
    "        FragColor = vec4(0);                           \n"
    "    }                                                  \n"
    "}                                                      \n";

static const char buoyancyFragShaderSource[] =
    "varying vec2 FragColor;                                                                            \n"
    "uniform sampler2D Velocity;                                                                    \n"
    "uniform sampler2D Temperature;                                                                 \n"
    "uniform sampler2D Density;                                                                     \n"
    "uniform float AmbientTemperature;                                                              \n"
    "uniform float TimeStep;                                                                        \n"
    "uniform float Sigma;                                                                           \n"
    "uniform float Kappa;                                                                           \n"

    "void main()                                                                                    \n"
    "{                                                                                              \n"
    "    ivec2 TC = ivec2(gl_FragCoord.xy);                                                         \n"
    "    float T = texelFetch(Temperature, TC, 0).r;                                                \n"
    "    vec2 V = texelFetch(Velocity, TC, 0).xy;                                                   \n"

    "    FragColor = V;                                                                             \n"

    "    if (T > AmbientTemperature) {                                                              \n"
    "        float D = texelFetch(Density, TC, 0).x;                                                \n"
    "        FragColor += (TimeStep * (T - AmbientTemperature) * Sigma - D * Kappa ) * vec2(0, 1);  \n"
    "    }                                                                                          \n"
    "}                                                                                              \n";

static const char visualiseFragShaderSource[] =
    "varying vec4 FragColor;                                            \n"
    "uniform sampler2D Sampler;                                     \n"
    "uniform vec3 FillColor;                                        \n"
    "uniform vec2 Scale;                                            \n"

    "void main()                                                    \n"
    "{                                                              \n"
    "    float L = texture(Sampler, gl_FragCoord.xy * Scale).r;     \n"
    "    FragColor = vec4(FillColor, L);                            \n"
    "}                                                              \n";

#endif