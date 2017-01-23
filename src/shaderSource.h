#ifndef SHADERSOURCE_H
#define SHADERSOURCE_H

static const char simpleVertShaderSource[] =
    "#version 300 es                                     \n"
    "in mediump vec4 vPosition;		                             \n"
    "out mediump vec3 color;                                     \n"
    "void main()                                         \n"
    "{                                                   \n"
    "   gl_Position = vPosition;                         \n"
    "   color = gl_Position.xyz + vec3(0.5);             \n"
    "}                                                   \n";

static const char simpleFragShaderSource[] =
    "#version 300 es                                \n"
    "in mediump vec3 color;                         \n"
    "out mediump vec4 FragColor;                    \n"
    "void main()                                    \n"
    "{                                              \n"
    "  FragColor = vec4 ( color, 1.0 );             \n"
    "}                                              \n";

// shaders for calculating

static const char vertShaderSource[] =
    "#version 300 es                       \n"
    "in vec4 Position;              \n"
    "void main()                           \n"
    "{                                     \n"
    "    gl_Position = Position;           \n"
    "}                                     \n";

static const char advectFragShaderSource[] = 
    "#version 300 es                                                        \n"
    "out mediump vec4 FragColor;                                            \n"
    "uniform sampler2D VelocityTexture;                                     \n"
    "uniform sampler2D SourceTexture;                                       \n"
    "uniform sampler2D Obstacles;                                           \n"

    "uniform mediump vec2 InverseSize;                                              \n"
    "uniform mediump float TimeStep;                              \n"
    "uniform mediump float Dissipation;                           \n"

    "void main()                                                            \n"
    "{                                                                      \n"
    "    vec2 fragCoord = gl_FragCoord.xy;                                  \n"
    "    float solid = texture(Obstacles, InverseSize * fragCoord).x;       \n"
    "    if (solid > 0.0f) {                                                   \n"
    "        FragColor = vec4(0);                                           \n"
    "        return;                                                        \n"
    "    }                                                                  \n"

    "    vec2 u = texture(VelocityTexture, InverseSize * fragCoord).xy;     \n"
    "    vec2 coord = InverseSize * (fragCoord - TimeStep * u);             \n"
    "    FragColor = Dissipation * texture(SourceTexture, coord);           \n"
    "}                                                                      \n";

static const char jacobiFragShaderSource[] = 
    "#version 300 es                                                        \n"
    "out mediump vec4 FragColor;                                                    \n"

    "uniform sampler2D Pressure;                                                \n"
    "uniform sampler2D Divergence;                                              \n"
    "uniform sampler2D Obstacles;                                               \n"

    "uniform mediump float Alpha;                                                       \n"
    "uniform mediump float InverseBeta;                                                 \n"

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
    "    if (oN.x > 0.0f) pN = pC;                                                 \n"
    "    if (oS.x > 0.0f) pS = pC;                                                 \n"
    "    if (oE.x > 0.0f) pE = pC;                                                 \n"
    "    if (oW.x > 0.0f) pW = pC;                                                 \n"

    "    vec4 bC = texelFetch(Divergence, T, 0);                                \n"
    "    FragColor = (pW + pE + pS + pN + Alpha * bC) * InverseBeta;            \n"
    "}                                                                          \n";

static const char subGradientFragShaderSource[] =
    "#version 300 es                                                        \n"
    "out mediump vec2 FragColor;                                                    \n"

    "uniform sampler2D Velocity;                                            \n"
    "uniform sampler2D Pressure;                                            \n"
    "uniform sampler2D Obstacles;                                           \n"
    "uniform mediump float GradientScale;                                           \n"

    "void main()                                                            \n"
    "{                                                                      \n"
    "    ivec2 T = ivec2(gl_FragCoord.xy);                                  \n"

    "    vec3 oC = texelFetch(Obstacles, T, 0).xyz;                         \n"
    "    if (oC.x > 0.0f) {                                                    \n"
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
    "    vec2 obstV = vec2(0.0f);                                              \n"
    "    vec2 vMask = vec2(1.0f);                                              \n"

    "    if (oN.x > 0.0f) { pN = pC; obstV.y = oN.z; vMask.y = 0.0f; }            \n"
    "    if (oS.x > 0.0f) { pS = pC; obstV.y = oS.z; vMask.y = 0.0f; }            \n"
    "    if (oE.x > 0.0f) { pE = pC; obstV.x = oE.y; vMask.x = 0.0f; }            \n"
    "    if (oW.x > 0.0f) { pW = pC; obstV.x = oW.y; vMask.x = 0.0f; }            \n"

        // Enforce the free-slip boundary condition:
    "    vec2 oldV = texelFetch(Velocity, T, 0).xy;                         \n"
    "    vec2 grad = vec2(pE - pW, pN - pS) * GradientScale;                \n"
    "    vec2 newV = oldV - grad;                                           \n"
    "    FragColor = (vMask * newV) + obstV;                                \n"
    "}                                                                      \n"; 

static const char computeDivergenceFragShaderSource[] =
    "#version 300 es                                                        \n"
    "out mediump float FragColor;                                               \n"

    "uniform sampler2D Velocity;                                            \n"
    "uniform sampler2D Obstacles;                                           \n"
    "uniform mediump float HalfInverseCellSize;                                     \n"

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
    "    if (oN.x > 0.0f) vN = oN.yz;                                          \n"
    "    if (oS.x > 0.0f) vS = oS.yz;                                          \n"
    "    if (oE.x > 0.0f) vE = oE.yz;                                          \n"
    "    if (oW.x > 0.0f) vW = oW.yz;                                          \n"

    "    FragColor = HalfInverseCellSize * (vE.x - vW.x + vN.y - vS.y);     \n"
    "}                                                                      \n";

static const char impulseFragShaderSource[] =
    "#version 300 es                                                        \n"
    "out mediump vec4 FragColor;                                    \n"

    "uniform mediump vec2 Point;                                    \n"
    "uniform mediump float Radius;                                  \n"
    "uniform mediump vec3 FillColor;                                \n"

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
    "#version 300 es                                                        \n"
    "out mediump vec2 FragColor;                                                                            \n"
    "uniform sampler2D Velocity;                                                                    \n"
    "uniform sampler2D Temperature;                                                                 \n"
    "uniform sampler2D Density;                                                                     \n"
    "uniform mediump float AmbientTemperature;                                                              \n"
    "uniform mediump float TimeStep;                                                                        \n"
    "uniform mediump float Sigma;                                                                           \n"
    "uniform mediump float Kappa;                                                                           \n"

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