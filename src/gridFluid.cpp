#include "gridFluid.h"
#include "shaders.h"

#include <iostream>

#define cellSize 8

// need to make this better
GLfloat quadVerts[] = {

    -1.0f,  1.0f, 0.0f, // Top-left
     1.0f,  1.0f, 0.0f, // Top-right
     1.0f, -1.0f, 0.0f, // Bottom-right

     1.0f, -1.0f, 0.0f, // Bottom-right
    -1.0f, -1.0f, 0.0f, // Bottom-left
    -1.0f,  1.0f, 0.0f, // Top-left

};

GridFluid::GridFluid()
{
}

void GridFluid::reset()
{
    
}

bool GridFluid::init(int width, int height)
{   

    m_width = width;
    m_height = height;

    // init buffers
    pVelocityBuffers.reset(new DoubleBuffer(height, width));
	pPressureBuffers.reset(new DoubleBuffer(height, width));
    pDivergenceBuffer.reset(new Buffer(height, width));

    // init programs 
    advectProgram = Shaders::buildProgramFromFiles("shaders/simple.vert", "shaders/advect.frag");
    jacobiProgram = Shaders::buildProgramFromFiles("shaders/simple.vert", "shaders/jacobi.frag");
    subtractGradientProgram = Shaders::buildProgramFromFiles("shaders/simple.vert", "shaders/subGradient.frag");
    computeDivergenceProgram  = Shaders::buildProgramFromFiles("shaders/simple.vert", "shaders/compDivergence.frag");
    applyForceProgram  = Shaders::buildProgramFromFiles("shaders/simple.vert", "shaders/applyForce.frag");

    simpleDrawProgram  = Shaders::buildProgramFromFiles("shaders/simple.vert", "shaders/texture.frag");

    return true;
}

void GridFluid::draw()
{
	glClear(GL_COLOR_BUFFER_BIT);
    glUseProgram(simpleDrawProgram);

    glActiveTexture(GL_TEXTURE0);
    glBindTexture(GL_TEXTURE_2D, pVelocityBuffers->readBuffer.textureHandle);
    //glBindTexture(GL_TEXTURE_2D, pDivergenceBuffer->textureHandle);
    //glBindTexture(GL_TEXTURE_2D, pPressureBuffers->readBuffer.textureHandle);

    // bind vbo
    glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 0, quadVerts);
	glEnableVertexAttribArray(0);

    // draw
    glDrawArrays(GL_TRIANGLES, 0, 6);
}

void GridFluid::update(float delta)
{
    glViewport(0, 0, m_width, m_height);
    
    // bind vbo
    glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 0, quadVerts);
	glEnableVertexAttribArray(0);

    // advect velocities
    advectVelocity(delta);

    // apply force 
    //applyForces();

    // compute divergence
    // computeDivergence();

    // do jacobi iterations for pressure solving

    // for(int i = 0; i < 10; ++i)
    // {
    //     jacobi();
    // }    

    // subtract gradient
    // subtractGradient();
}

void GridFluid::advectVelocity(float dt)
{
    // set shader
    glUseProgram(advectProgram);

    // set uniforms
    GLint inverseSize = glGetUniformLocation(advectProgram, "inverseSize");
    GLint timeStep = glGetUniformLocation(advectProgram, "dt");
    glUniform1f(inverseSize, 1.0f / (float)cellSize);
    glUniform1f(timeStep, dt);

    // set textures
    GLint sourceTexture = glGetUniformLocation(advectProgram, "target");
    glUniform1i(sourceTexture, 1);

    //bind
    glBindFramebuffer(GL_FRAMEBUFFER, pVelocityBuffers->writeBuffer.fboHandle);
    glActiveTexture(GL_TEXTURE0);
    glBindTexture(GL_TEXTURE_2D, pVelocityBuffers->readBuffer.textureHandle);
    glActiveTexture(GL_TEXTURE1);
    glBindTexture(GL_TEXTURE_2D, pVelocityBuffers->readBuffer.textureHandle);
	
    // draw
    glDrawArrays(GL_TRIANGLES, 0, 6);

    // swap buffers
    //pVelocityBuffers->swap();
}

void GridFluid::applyForces()
{
    glUseProgram(applyForceProgram);

    GLint pointLoc = glGetUniformLocation(applyForceProgram, "Point");
    GLint radiusLoc = glGetUniformLocation(applyForceProgram, "Radius");
    GLint fillColorLoc = glGetUniformLocation(applyForceProgram, "FillColor");

    glUniform2f(pointLoc, (float)50, (float)50);
    glUniform1f(radiusLoc, 50);
    glUniform3f(fillColorLoc, 0.0f, 1.0f, 0.0f);

    glBindFramebuffer(GL_FRAMEBUFFER, pVelocityBuffers->writeBuffer.fboHandle);
	
    // draw
    glDrawArrays(GL_TRIANGLES, 0, 6);

    // swap buffers
    pVelocityBuffers->swap();
}

void GridFluid::computeDivergence()
{
    glUseProgram(computeDivergenceProgram);

    GLint halfCell = glGetUniformLocation(computeDivergenceProgram, "HalfInverseCellSize");
    glUniform1f(halfCell, 0.5f / cellSize);

    glBindFramebuffer(GL_FRAMEBUFFER, pDivergenceBuffer->fboHandle);
    glActiveTexture(GL_TEXTURE0);
    glBindTexture(GL_TEXTURE_2D, pVelocityBuffers->readBuffer.textureHandle);
	
    // draw
    glDrawArrays(GL_TRIANGLES, 0, 6);
}

void GridFluid::jacobi()
{
    glUseProgram(jacobiProgram);

    GLint alpha = glGetUniformLocation(jacobiProgram, "Alpha");
    GLint inverseBeta = glGetUniformLocation(jacobiProgram, "InverseBeta");
    GLint dSampler = glGetUniformLocation(jacobiProgram, "Divergence");

    glUniform1f(alpha, -cellSize * cellSize);
    glUniform1f(inverseBeta, 0.25f);
    glUniform1i(dSampler, 1);

    glBindFramebuffer(GL_FRAMEBUFFER, pPressureBuffers->writeBuffer.fboHandle);
    glActiveTexture(GL_TEXTURE0);
    glBindTexture(GL_TEXTURE_2D, pPressureBuffers->readBuffer.textureHandle);
    glActiveTexture(GL_TEXTURE1);
    glBindTexture(GL_TEXTURE_2D, pDivergenceBuffer->textureHandle);
	
    // draw
    glDrawArrays(GL_TRIANGLES, 0, 6);

    pPressureBuffers->swap();
}

void GridFluid::subtractGradient()
{
    glUseProgram(subtractGradientProgram);

    GLint gradientScale = glGetUniformLocation(subtractGradientProgram, "GradientScale");
    glUniform1f(gradientScale, 1.125f / cellSize);
    GLint halfCell = glGetUniformLocation(subtractGradientProgram, "HalfInverseCellSize");
    glUniform1f(halfCell, 0.5f / cellSize);
    GLint sampler = glGetUniformLocation(subtractGradientProgram, "Pressure");
    glUniform1i(sampler, 1);

    glBindFramebuffer(GL_FRAMEBUFFER, pVelocityBuffers->writeBuffer.fboHandle);
    glActiveTexture(GL_TEXTURE0);
    glBindTexture(GL_TEXTURE_2D, pVelocityBuffers->readBuffer.textureHandle);
    glActiveTexture(GL_TEXTURE1);
    glBindTexture(GL_TEXTURE_2D, pPressureBuffers->readBuffer.textureHandle);
	
    // draw
    glDrawArrays(GL_TRIANGLES, 0, 6);

    pVelocityBuffers->swap();
}

void GridFluid::resetState()
{

}

