#ifndef GRIDFLUID_H
#define GRIDFLUID_H

#include "buffers.h"
#include "shaders.h"
#include "bufferUtils.hpp"
#include "forceHandler.hpp"


class GridFluidSolver
{
public:

    GridFluidSolver(){};
    ~GridFluidSolver(){};

    bool init(int width, int height);
    void advect(Buffer& output, Buffer& velocity, Buffer& input, float dt);
    void computeDivergence(Buffer& divBuffer, Buffer& velocity);
    void pressureSolve(DoubleBuffer& pressure, Buffer& divergence);    
    void subtractGradient(DoubleBuffer& velocity, Buffer& pressure);
    void applyForces(DoubleBuffer& velocity, std::vector<ForcePacket>& forces);
    void applyPaint(DoubleBuffer& velocity, std::vector<ForcePacket>& forces, float R, float G, float B);
    void createVisBuffer(Buffer& buffer);

private:
    void drawQuad();
    void applyCircleForces(DoubleBuffer& velocity, std::vector<ForcePacket>& forces);

private:

    std::vector<float> quadVerts;
    std::vector<float> quadTex;

    int m_height;
    int m_width;

    // shader programs
    GLuint advectProgram;
    GLuint jacobiProgram;
    GLuint subtractGradientProgram;
    GLuint computeDivergenceProgram;
    GLuint applyForceProgram;
    GLuint simpleDrawProgram;
    GLuint visBufferProgram;
    GLuint applyPaintProgram;
};

EMSCRIPTEN_BINDINGS(GridFluidSolver) 
{   
    emscripten::class_<GridFluidSolver>("GridFluidSolver")
        .constructor<>()
        .function("init", &GridFluidSolver::init)
        .function("advect", &GridFluidSolver::advect)
        .function("applyForces", &GridFluidSolver::applyForces)
        .function("applyPaint", &GridFluidSolver::applyPaint)
        .function("computeDivergance", &GridFluidSolver::computeDivergence)
        .function("pressureSolve", &GridFluidSolver::pressureSolve)
        .function("subtractGradient", &GridFluidSolver::subtractGradient)
        .function("createVisBuffer", &GridFluidSolver::createVisBuffer);
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

    m_height = height;
    m_width = width;

    // init programs 
    advectProgram = Shaders::buildProgramFromFiles("shaders/simple.vert", "shaders/advect.frag");
    jacobiProgram = Shaders::buildProgramFromFiles("shaders/simple.vert", "shaders/jacobi.frag");
    subtractGradientProgram = Shaders::buildProgramFromFiles("shaders/simple.vert", "shaders/subGradient.frag");
    computeDivergenceProgram  = Shaders::buildProgramFromFiles("shaders/simple.vert", "shaders/compDivergence.frag");
    applyForceProgram  = Shaders::buildProgramFromFiles("shaders/simple.vert", "shaders/applyForce.frag");
    applyPaintProgram  = Shaders::buildProgramFromFiles("shaders/simple.vert", "shaders/applyPaint.frag");

    visBufferProgram = Shaders::buildProgramFromFiles("shaders/simple.vert", "shaders/visBuffer.frag");

    return true;
}

void GridFluidSolver::drawQuad()
{
    //set up the vertices array
    glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 0, quadVerts.data());
    glEnableVertexAttribArray(0);

    // draw
    glDrawArrays(GL_TRIANGLES, 0, 6);
}

void GridFluidSolver::createVisBuffer(Buffer& buffer)
{
    glUseProgram(visBufferProgram);

    GLint res = glGetUniformLocation(visBufferProgram, "resolution");
    glUniform2f(res, (float)m_width, (float)m_height);

    glBindFramebuffer(GL_FRAMEBUFFER, buffer.fboHandle);
    
    drawQuad();

    // unbind the framebuffer
    glBindFramebuffer(GL_FRAMEBUFFER, 0);
}

void GridFluidSolver::advect(Buffer& output, Buffer& velocity, Buffer& input, float dt)
{
    // set shader
    glUseProgram(advectProgram);

    // set uniforms
    GLint resLoc = glGetUniformLocation(advectProgram, "resolution");
    GLint timeStepLoc = glGetUniformLocation(advectProgram, "dt");
    glUniform2f(resLoc, (float)m_width, (float)m_height);
    glUniform1f(timeStepLoc, dt);

    // set textures
    GLint sourceTexture = glGetUniformLocation(advectProgram, "inputSampler");
    glUniform1i(sourceTexture, 1);

    //bind
    glBindFramebuffer(GL_FRAMEBUFFER, output.fboHandle);
    glActiveTexture(GL_TEXTURE0);
    glBindTexture(GL_TEXTURE_2D, velocity.texHandle);
    glActiveTexture(GL_TEXTURE1);
    glBindTexture(GL_TEXTURE_2D, input.texHandle);
    
    drawQuad();

    // unbind the framebuffer
    glBindFramebuffer(GL_FRAMEBUFFER, 0);
}

void GridFluidSolver::applyForces(DoubleBuffer& velocity, std::vector<ForcePacket>& forces)
{
    applyCircleForces(velocity, forces);
}

void GridFluidSolver::applyPaint(DoubleBuffer& velocity, std::vector<ForcePacket>& forces, float R, float G, float B)
{
    // lets loop this for now

    std::vector<float> testVerts;
    
    for(auto& pkt : forces)
    {
        float x1 = -1.0f + (2.0f * pkt.xPix / (float)m_width);
        float y1 = -1.0f + (2.0f * pkt.yPix / (float)m_height);

        float radX = 0.5 * (pkt.size / (float)m_width);
        float radY = 0.5 * (pkt.size / (float)m_height);

        // Top-left
        testVerts.push_back(x1-radX);
        testVerts.push_back(y1+radY);
        testVerts.push_back(0.0f);
        
        // Top-right
        testVerts.push_back(x1+radX);
        testVerts.push_back(y1+radY);
        testVerts.push_back(0.0f);

        // Bottom-right
        testVerts.push_back(x1+radX);
        testVerts.push_back(y1-radY);
        testVerts.push_back(0.0f);

        // Bottom-right
        testVerts.push_back(x1+radX);
        testVerts.push_back(y1-radY);
        testVerts.push_back(0.0f);

        // Bottom-left
        testVerts.push_back(x1-radX);
        testVerts.push_back(y1-radY);
        testVerts.push_back(0.0f);

        // Top-left
        testVerts.push_back(x1-radX);
        testVerts.push_back(y1+radY);
        testVerts.push_back(0.0f);
    }

    glUseProgram(applyPaintProgram);

    GLint res = glGetUniformLocation(applyPaintProgram, "resolution");
    glUniform2f(res, (float)m_width, (float)m_height);

    GLint force = glGetUniformLocation(applyPaintProgram, "color");
    glUniform3f(force, R, G, B);

    glBindFramebuffer(GL_FRAMEBUFFER, velocity.writeBuffer.fboHandle);

    glActiveTexture(GL_TEXTURE0);
    glBindTexture(GL_TEXTURE_2D, velocity.readBuffer.texHandle);

    //drawQuad();

    //set up the vertices array
    glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 0, testVerts.data());
    glEnableVertexAttribArray(0);

    // draw
    glDrawArrays(GL_TRIANGLES, 0, testVerts.size() / 3);

    // unbind the framebuffer
    glBindFramebuffer(GL_FRAMEBUFFER, 0);

}

void GridFluidSolver::applyCircleForces(DoubleBuffer& velocity, std::vector<ForcePacket>& forces)
{
    // lets loop this for now
    for(ForcePacket pkt : forces)
    {
        glUseProgram(applyForceProgram);

        GLint res = glGetUniformLocation(applyForceProgram, "resolution");
        glUniform2f(res, (float)m_width, (float)m_height);

        GLint force = glGetUniformLocation(applyForceProgram, "forceVal");
        glUniform2f(force, pkt.xForce, pkt.yForce);

        GLint pos = glGetUniformLocation(applyForceProgram, "forcePos");
        glUniform2f(pos, pkt.xPix, pkt.yPix);

        GLint radius = glGetUniformLocation(applyForceProgram, "radius");
        glUniform1f(radius, pkt.size);

        glBindFramebuffer(GL_FRAMEBUFFER, velocity.writeBuffer.fboHandle);

        glActiveTexture(GL_TEXTURE0);
        glBindTexture(GL_TEXTURE_2D, velocity.readBuffer.texHandle);

        drawQuad();

        // unbind the framebuffer
        glBindFramebuffer(GL_FRAMEBUFFER, 0);
    }
}

void GridFluidSolver::computeDivergence(Buffer& divBuffer, Buffer& velocity)
{
    glUseProgram(computeDivergenceProgram);

    GLint res = glGetUniformLocation(computeDivergenceProgram, "resolution");
    glUniform2f(res, (float)m_width, (float)m_height);

    glBindFramebuffer(GL_FRAMEBUFFER, divBuffer.fboHandle);
    glActiveTexture(GL_TEXTURE0);
    glBindTexture(GL_TEXTURE_2D, velocity.texHandle);
    
    drawQuad();

    // unbind the framebuffer
    glBindFramebuffer(GL_FRAMEBUFFER, 0);
}

void GridFluidSolver::pressureSolve(DoubleBuffer& pressure, Buffer& divergence)
{
    glUseProgram(jacobiProgram);

    GLint alpha = glGetUniformLocation(jacobiProgram, "Alpha");
    GLint dSampler = glGetUniformLocation(jacobiProgram, "Divergence");
    GLint res = glGetUniformLocation(jacobiProgram, "resolution");

    glUniform2f(res, (float)m_width, (float)m_height) ;
    glUniform1f(alpha, -((float)m_width * (float)m_height));
    glUniform1i(dSampler, 1);

    glBindFramebuffer(GL_FRAMEBUFFER, pressure.writeBuffer.fboHandle);
    glActiveTexture(GL_TEXTURE0);
    glBindTexture(GL_TEXTURE_2D, pressure.readBuffer.texHandle);
    glActiveTexture(GL_TEXTURE1);
    glBindTexture(GL_TEXTURE_2D, divergence.texHandle);

    drawQuad();

    // unbind the framebuffer
    glBindFramebuffer(GL_FRAMEBUFFER, 0);
}

void GridFluidSolver::subtractGradient(DoubleBuffer& velocity, Buffer& pressure)
{
    glUseProgram(subtractGradientProgram);

    GLint res = glGetUniformLocation(subtractGradientProgram, "resolution");
    glUniform2f(res, (float)m_width, (float)m_height) ;

    GLint sampler = glGetUniformLocation(subtractGradientProgram, "Pressure");
    glUniform1i(sampler, 1);

    glBindFramebuffer(GL_FRAMEBUFFER, velocity.writeBuffer.fboHandle);
    glActiveTexture(GL_TEXTURE0);
    glBindTexture(GL_TEXTURE_2D, velocity.readBuffer.texHandle);
    glActiveTexture(GL_TEXTURE1);
    glBindTexture(GL_TEXTURE_2D, pressure.texHandle);
    
    drawQuad();

    // unbind the framebuffer
    glBindFramebuffer(GL_FRAMEBUFFER, 0);
}

#endif