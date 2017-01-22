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
    "out vec3 FragColor;            \n"
    "void main()                    \n"
    "{                              \n"
    "    FragColor = vec3(1, 0, 0); \n"
    "}                              \n";


static const char advectFragShaderSource[] = 
    "out vec4 FragColor;                                                    \n"
    "uniform sampler2D VelocityTexture;                                     \n"
    "uniform sampler2D SourceTexture;                                       \n"
    "uniform sampler2D Obstacles;                                           \n"

    "uniform vec2 InverseSize;                                              \n"
    "uniform float TimeStep;                                                \n"
    "uniform float Dissipation;                                             \n"

    "void main()                                                            \n"
    "{                                                                      \n"
    "    vec2 fragCoord = gl_FragCoord.xy;                                  \n"
    "    float solid = texture(Obstacles, InverseSize * fragCoord).x;       \n"
    "    if (solid > 0) {                                                   \n"
    "        FragColor = vec4(0);                                           \n"
    "        return;                                                        \n"
    "    }                                                                  \n"

    "    vec2 u = texture(VelocityTexture, InverseSize * fragCoord).xy;     \n"
    "    vec2 coord = InverseSize * (fragCoord - TimeStep * u);             \n"
    "    FragColor = Dissipation * texture(SourceTexture, coord);           \n"
    "}                                                                      \n";

#endif