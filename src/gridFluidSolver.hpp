#ifndef GRIDFLUID_H
#define GRIDFLUID_H

#include "buffers.h"
#include "shaders.h"
#include "bufferUtils.hpp"

class GridFluidSolver
{
public:

    GridFluidSolver(){};
    ~GridFluidSolver(){};

    bool init(int width, int height);
    void advect(DoubleBuffer& target, Buffer& source, float dt);
    void applyForces(DoubleBuffer& buffers, float pointX, float pointY, float forceX, float forceY);
    void computeDivergence(Buffer& divBuffer, Buffer& velocity);
    void pressureSolve(DoubleBuffer& pressure, Buffer& divergence);    
    void subtractGradient(DoubleBuffer& velocity, DoubleBuffer& pressure);

private:
    //void resetState();

private:

    std::vector<float> quadVerts;
    std::vector<float> quadTex;

    int cellSize;

    int m_height;
    int m_width;

    // shader programs
    GLuint advectProgram;
    GLuint jacobiProgram;
    GLuint subtractGradientProgram;
    GLuint computeDivergenceProgram;
    GLuint applyForceProgram;
    GLuint simpleDrawProgram;
};

EMSCRIPTEN_BINDINGS(GridFluidSolver) 
{   
    emscripten::class_<GridFluidSolver>("GridFluidSolver")
        .constructor<>()
        .function("init", &GridFluidSolver::init)
        .function("advect", &GridFluidSolver::advect)
        .function("applyForce", &GridFluidSolver::applyForces)
        .function("computeDivergance", &GridFluidSolver::computeDivergence)
        .function("pressureSolve", &GridFluidSolver::pressureSolve)
        .function("subtractGradient", &GridFluidSolver::subtractGradient);
}

//////////////////////////////////////////// SOURCE

bool GridFluidSolver::init(int width, int height)
{
    quadVerts =  {
        -1.0f,  1.0f, 0.0f, // Top-left
        1.0f,  1.0f, 0.0f, // Top-right
        1.0f, -1.0f, 0.0f, // Bottom-right

        1.0f, -1.0f, 0.0f, // Bottom-right
        -1.0f, -1.0f, 0.0f, // Bottom-left
        -1.0f,  1.0f, 0.0f, // Top-left
    };

    quadTex = {
        0.0f, 0.0f, // Top-left
        1.0f, 0.0f, // Top-right
        1.0f, 1.0f, // Bottom-right
        
        1.0f, 1.0f, // Bottom-right
        0.0f, 1.0f,  // Bottom-left
        0.0f, 0.0f, // Top-left
    };

    cellSize = 32;

    m_height = height;
    m_width = width;

    // init programs 
    advectProgram = Shaders::buildProgramFromFiles("shaders/simple.vert", "shaders/advectRK2.frag");
    jacobiProgram = Shaders::buildProgramFromFiles("shaders/simple.vert", "shaders/jacobi.frag");
    subtractGradientProgram = Shaders::buildProgramFromFiles("shaders/simple.vert", "shaders/subGradient.frag");
    computeDivergenceProgram  = Shaders::buildProgramFromFiles("shaders/simple.vert", "shaders/compDivergence.frag");
    applyForceProgram  = Shaders::buildProgramFromFiles("shaders/simple.vert", "shaders/applyForce.frag");

    return true;
}

void GridFluidSolver::advect(DoubleBuffer& target, Buffer& source, float dt)
{
    glViewport(0, 0, m_width, m_height);

    // set shader
    glUseProgram(advectProgram);

    // set uniforms
    GLint dissapate = glGetUniformLocation(advectProgram, "dissapation");
    GLint inverseSize = glGetUniformLocation(advectProgram, "resolution");
    GLint timeStep = glGetUniformLocation(advectProgram, "dt");
    glUniform2f(inverseSize, (float)m_width, (float)m_height);
    glUniform1f(timeStep, dt);
    glUniform1f(dissapate, 0.5f);

    // set textures
    GLint sourceTexture = glGetUniformLocation(advectProgram, "target");
    glUniform1i(sourceTexture, 1);

    //bind
    glBindFramebuffer(GL_FRAMEBUFFER, target.writeBuffer.fboHandle);
    glActiveTexture(GL_TEXTURE0);
    glBindTexture(GL_TEXTURE_2D, source.texHandle);
    glActiveTexture(GL_TEXTURE1);
    glBindTexture(GL_TEXTURE_2D, target.readBuffer.texHandle);
    
    //set up the vertices array
    glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 0, quadVerts.data());
    glEnableVertexAttribArray(0);

    glVertexAttribPointer(1, 2, GL_FLOAT, GL_FALSE, 0, quadTex.data());
    glEnableVertexAttribArray(1);

    // draw
    glDrawArrays(GL_TRIANGLES, 0, 6);

    // unbind the framebuffer
    glBindFramebuffer(GL_FRAMEBUFFER, 0);
}

void GridFluidSolver::applyForces(DoubleBuffer& buffers, float pointX, float pointY, float forceX, float forceY)
{
    glViewport(0, 0, m_width, m_height);

    glUseProgram(applyForceProgram);

    GLint pointLoc = glGetUniformLocation(applyForceProgram, "Point");
    GLint radiusLoc = glGetUniformLocation(applyForceProgram, "Radius");
    GLint fillColorLoc = glGetUniformLocation(applyForceProgram, "FillColor");

    glUniform2f(pointLoc, pointX, pointY);
    glUniform1f(radiusLoc, 0.10);
    glUniform3f(fillColorLoc, forceX, forceY, 0.0f);

    glBindFramebuffer(GL_FRAMEBUFFER, buffers.writeBuffer.fboHandle);
    glActiveTexture(GL_TEXTURE0);
    glBindTexture(GL_TEXTURE_2D, buffers.readBuffer.texHandle);
    
    //set up the vertices array
    glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 0, quadVerts.data());
    glEnableVertexAttribArray(0);

    glVertexAttribPointer(1, 2, GL_FLOAT, GL_FALSE, 0, quadTex.data());
    glEnableVertexAttribArray(1);

    // draw
    glDrawArrays(GL_TRIANGLES, 0, 6);

    // unbind the framebuffer
    glBindFramebuffer(GL_FRAMEBUFFER, 0);
}

void GridFluidSolver::computeDivergence(Buffer& divBuffer, Buffer& velocity)
{
    glUseProgram(computeDivergenceProgram);

    GLint halfCell = glGetUniformLocation(computeDivergenceProgram, "HalfInverseCellSize");
    glUniform1f(halfCell, 0.5f / (float)cellSize);
    GLint invRes = glGetUniformLocation(computeDivergenceProgram, "inverseRes");
    glUniform2f(invRes, 1.0f / (float)m_width, 1.0f / (float)m_height) ;

    glBindFramebuffer(GL_FRAMEBUFFER, divBuffer.fboHandle);
    glActiveTexture(GL_TEXTURE0);
    glBindTexture(GL_TEXTURE_2D, velocity.texHandle);
    
    //set up the vertices array
    glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 0, quadVerts.data());
    glEnableVertexAttribArray(0);

    glVertexAttribPointer(1, 2, GL_FLOAT, GL_FALSE, 0, quadTex.data());
    glEnableVertexAttribArray(1);

    // draw
    glDrawArrays(GL_TRIANGLES, 0, 6);

    // unbind the framebuffer
    glBindFramebuffer(GL_FRAMEBUFFER, 0);
}

void GridFluidSolver::pressureSolve(DoubleBuffer& pressure, Buffer& divergence)
{
    glUseProgram(jacobiProgram);

    GLint alpha = glGetUniformLocation(jacobiProgram, "Alpha");
    GLint dSampler = glGetUniformLocation(jacobiProgram, "Divergence");
    GLint invRes = glGetUniformLocation(jacobiProgram, "inverseRes");

    glUniform2f(invRes, 1.0f / (float)m_width, 1.0f / (float)m_height) ;
    glUniform1f(alpha, -cellSize * cellSize);
    glUniform1i(dSampler, 1);

    glBindFramebuffer(GL_FRAMEBUFFER, pressure.writeBuffer.fboHandle);
    glActiveTexture(GL_TEXTURE0);
    glBindTexture(GL_TEXTURE_2D, pressure.readBuffer.texHandle);
    glActiveTexture(GL_TEXTURE1);
    glBindTexture(GL_TEXTURE_2D, divergence.texHandle);

    //set up the vertices array
    glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 0, quadVerts.data());
    glEnableVertexAttribArray(0);

    glVertexAttribPointer(1, 2, GL_FLOAT, GL_FALSE, 0, quadTex.data());
    glEnableVertexAttribArray(1);
    
    // draw
    glDrawArrays(GL_TRIANGLES, 0, 6);

    // unbind the framebuffer
    glBindFramebuffer(GL_FRAMEBUFFER, 0);
}

void GridFluidSolver::subtractGradient(DoubleBuffer& velocity, DoubleBuffer& pressure)
{
    glUseProgram(subtractGradientProgram);

    GLint invRes = glGetUniformLocation(subtractGradientProgram, "inverseRes");
    glUniform2f(invRes, 1.0f / (float)m_width, 1.0f / (float)m_height) ;

    GLint halfCell = glGetUniformLocation(subtractGradientProgram, "HalfInverseCellSize");
    glUniform1f(halfCell, 0.5f / cellSize);

    GLint sampler = glGetUniformLocation(subtractGradientProgram, "Pressure");
    glUniform1i(sampler, 1);

    glBindFramebuffer(GL_FRAMEBUFFER, velocity.writeBuffer.fboHandle);
    glActiveTexture(GL_TEXTURE0);
    glBindTexture(GL_TEXTURE_2D, velocity.readBuffer.texHandle);
    glActiveTexture(GL_TEXTURE1);
    glBindTexture(GL_TEXTURE_2D, pressure.readBuffer.texHandle);
    
    //set up the vertices array
    glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 0, quadVerts.data());
    glEnableVertexAttribArray(0);

    glVertexAttribPointer(1, 2, GL_FLOAT, GL_FALSE, 0, quadTex.data());
    glEnableVertexAttribArray(1);

    // draw
    glDrawArrays(GL_TRIANGLES, 0, 6);

    // unbind the framebuffer
    glBindFramebuffer(GL_FRAMEBUFFER, 0);
}

#endif