#include "eulerianFluid.h"
#include "shaders.h"

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

EulerianFluid::EulerianFluid()
{
}

void EulerianFluid::reset()
{
    
}

bool EulerianFluid::init(int width, int height)
{   
    // init buffers
    pVelocityBuffers.reset(new DoubleBuffer(height, width));
	pPressureBuffers.reset(new DoubleBuffer(height, width));
    pDivergenceBuffer.reset(new Buffer(height, width));

    // init programs 
    advectProgram = Shaders::buildProgramFromFiles("shaders/simple.vert", "shaders/advect.frag");
    jacobiProgram = Shaders::buildProgramFromFiles("shaders/simple.vert", "shaders/jacobi.frag");
    //subtractGradientProgram;
    //computeDivergenceProgram;
    //applyForceProgram;

    return true;
}

void EulerianFluid::update(float delta)
{
    //advect velocities
    advectVelocity(delta);

    // advect velocity and temp

    // apply impulse to temp and density

    // compute divergence

    // do jacobi iterations for pressure solving

    // subtract gradient
}

void EulerianFluid::advectVelocity(float dt)
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

    // bind vbo
    glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 0, quadVerts);
	glEnableVertexAttribArray(0);
	
    // draw
    glDrawArrays(GL_TRIANGLES, 0, 6);

    // swap buffers
    pVelocityBuffers->swap();
}

void EulerianFluid::applyForces()
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

}

