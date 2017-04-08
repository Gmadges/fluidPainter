#ifndef GRIDFLUID_H
#define GRIDFLUID_H

#include "buffers.h"
#include "shaders.h"
#include "bufferUtils.hpp"
#include "forceHandler.hpp"

#include <math.h>
#include <SDL/SDL.h>
#include <SDL/SDL_image.h>


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
    void loadBrushTexture();

    std::vector<float> createQuadFromOnePoint(ForcePacket& pnt);
    std::vector<float> createQuadFromTwoPoints(ForcePacket& pnt1, ForcePacket& pnt2);
    std::vector<float> createStripFrom3Points(ForcePacket& pnt1, ForcePacket& pnt2, ForcePacket& pnt3);

private:

    std::vector<float> quadVerts;
    std::vector<float> doubleQuadTex;

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

    GLuint brushTex;
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

    doubleQuadTex = {
        0.0f, 0.0f, // Top-left
        1.0f, 0.0f, // Top-right
        1.0f, 1.0f, // Bottom-right
        
        1.0f, 1.0f, // Bottom-right
        0.0f, 1.0f,  // Bottom-left
        0.0f, 0.0f, // Top-left

        0.0f, 0.0f, // Top-left
        1.0f, 0.0f, // Top-right
        1.0f, 1.0f, // Bottom-right
        
        1.0f, 1.0f, // Bottom-right
        0.0f, 1.0f,  // Bottom-left
        0.0f, 0.0f, // Top-left
    };

    m_height = height;
    m_width = width;

    // init programs 
    advectProgram = Shaders::buildProgramFromFiles("data/simple.vert", "data/advect.frag");
    jacobiProgram = Shaders::buildProgramFromFiles("data/simple.vert", "data/jacobi.frag");
    subtractGradientProgram = Shaders::buildProgramFromFiles("data/simple.vert", "data/subGradient.frag");
    computeDivergenceProgram  = Shaders::buildProgramFromFiles("data/simple.vert", "data/compDivergence.frag");
    applyForceProgram  = Shaders::buildProgramFromFiles("data/simple.vert", "data/applyForce.frag");
    applyPaintProgram  = Shaders::buildProgramFromFiles("data/simpleTex.vert", "data/applyPaint.frag");

    visBufferProgram = Shaders::buildProgramFromFiles("data/simple.vert", "data/visBuffer.frag");

    loadBrushTexture();

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

std::vector<float> GridFluidSolver::createQuadFromOnePoint(ForcePacket& pnt)
{
    std::vector<float> verts;
    
    float x1 = -1.0f + (2.0f * pnt.xPix / (float)m_width);
    float y1 = -1.0f + (2.0f * pnt.yPix / (float)m_height);

    // test for ease
    float rad = 0.5 * (pnt.size / (float)((m_height+m_width)/2));

    // Top-left
    verts.push_back(x1+rad);
    verts.push_back(y1-rad);
    verts.push_back(0.0f);
    
    // Top-right
    verts.push_back(x1+rad);
    verts.push_back(y1+rad);
    verts.push_back(0.0f);

    // Bottom-right
    verts.push_back(x1-rad);
    verts.push_back(y1+rad);
    verts.push_back(0.0f);

    // Bottom-right
    verts.push_back(x1-rad);
    verts.push_back(y1+rad);
    verts.push_back(0.0f);

    // Bottom-left
    verts.push_back(x1-rad);
    verts.push_back(y1-rad);
    verts.push_back(0.0f);

    // Top-left
    verts.push_back(x1+rad);
    verts.push_back(y1-rad);
    verts.push_back(0.0f);

    return verts;
}



std::vector<float> GridFluidSolver::createStripFrom3Points(ForcePacket& pnt1, ForcePacket& pnt2, ForcePacket& pnt3)
{
    std::vector<float> verts;
    
    float x1 = -1.0f + (2.0f * pnt1.xPix / (float)m_width);
    float y1 = -1.0f + (2.0f * pnt1.yPix / (float)m_height);

    float x2 = -1.0f + (2.0f * pnt2.xPix / (float)m_width);
    float y2 = -1.0f + (2.0f * pnt2.yPix / (float)m_height);

    float x3 = -1.0f + (2.0f * pnt3.xPix / (float)m_width);
    float y3 = -1.0f + (2.0f * pnt3.yPix / (float)m_height);

    // test for ease
    float rad = 0.5 * (pnt1.size / (float)((m_height+m_width)/2));

    // get perp vectors
    float tmpX1 = y2 - y1;
    float tmpY1 = -(x2 - x1);

    // get perp vectors
    float tmpX2 = y3 - y2;
    float tmpY2 = -(x3 - x2);

    // get perp vectors
    float tmpX3 = y3 - y1;
    float tmpY3 = -(x3 - x1);

    // normalize
    float perpX1 = tmpX1 / sqrt((tmpX1 * tmpX1) + (tmpY1 * tmpY1));
    float perpY1 = tmpY1 / sqrt((tmpX1 * tmpX1) + (tmpY1 * tmpY1));

    // normalize
    float perpX2 = tmpX2 / sqrt((tmpX2 * tmpX2) + (tmpY2 * tmpY2));
    float perpY2 = tmpY2 / sqrt((tmpX2 * tmpX2) + (tmpY2 * tmpY2));

    // calc our mid point
    // normalize
    float perpX3 = tmpX3 / sqrt((tmpX3 * tmpX3) + (tmpY3 * tmpY3));
    float perpY3 = tmpY3 / sqrt((tmpX3 * tmpX3) + (tmpY3 * tmpY3));

    float midP1X = x2-(perpX3 * rad);
    float midP1Y = y2-(perpY3 * rad);

    float midP2X = x2+(perpX3 * rad);
    float midP2Y = y2+(perpY3 * rad);

    // quad 1

    // Top-left
    verts.push_back(x1-(perpX1 * rad));
    verts.push_back(y1-(perpY1 * rad));
    verts.push_back(0.0f);
    
    // Top-right
    verts.push_back(x1+(perpX1 * rad));
    verts.push_back(y1+(perpY1 * rad));
    verts.push_back(0.0f);

    // Bottom-right
    verts.push_back(midP2X);
    verts.push_back(midP2Y);
    verts.push_back(0.0f);

    // Bottom-right
    verts.push_back(midP2X);
    verts.push_back(midP2Y);
    verts.push_back(0.0f);

    // Bottom-left
    verts.push_back(midP1X);
    verts.push_back(midP1Y);
    verts.push_back(0.0f);

    // Top-left
    verts.push_back(x1-(perpX1 * rad));
    verts.push_back(y1-(perpY1 * rad));
    verts.push_back(0.0f);

    // quad 2

    // Top-left
    verts.push_back(midP1X);
    verts.push_back(midP1Y);
    verts.push_back(0.0f);

    // Top-right
    verts.push_back(midP2X);
    verts.push_back(midP2Y);
    verts.push_back(0.0f);

    // Bottom-right
    verts.push_back(x3+(perpX2 * rad));
    verts.push_back(y3+(perpY2 * rad));
    verts.push_back(0.0f);

    // Bottom-right
    verts.push_back(x3+(perpX2 * rad));
    verts.push_back(y3+(perpY2 * rad));
    verts.push_back(0.0f);

    // Bottom-left
    verts.push_back(x3-(perpX2 * rad));
    verts.push_back(y3-(perpY2 * rad));
    verts.push_back(0.0f);

    // Top-left
    verts.push_back(midP1X);
    verts.push_back(midP1Y);
    verts.push_back(0.0f);

    return verts;
}

void GridFluidSolver::loadBrushTexture()
{   
    SDL_Surface *image;

    if(!(image = IMG_Load("data/blur.png"))) 
    {
        fprintf(stderr, "Could not load texture image: %s\n", IMG_GetError());
        return;
    }

    glGenTextures(1, &brushTex);
    glBindTexture(GL_TEXTURE_2D, brushTex);
    glTexParameteri( GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR );
    glTexParameteri( GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR );
    
    glTexImage2D(GL_TEXTURE_2D, 0, GL_RGB, image->w, image->h, 0, GL_RGB, GL_UNSIGNED_BYTE, image->pixels);

    SDL_FreeSurface(image);
}

void GridFluidSolver::applyPaint(DoubleBuffer& velocity, std::vector<ForcePacket>& forces, float R, float G, float B)
{
    std::vector<float> testVerts;

    // how many points?

    if(forces.size() == 3)
    {
        testVerts = createStripFrom3Points(forces[0], forces[1], forces[2]);
    }
    else if(forces.size() == 1) 
    {
        testVerts = createQuadFromOnePoint(forces[0]);
    }

    if(testVerts.empty()) return;

    glUseProgram(applyPaintProgram);

    GLint brushSample = glGetUniformLocation(applyPaintProgram, "brush");
    glUniform1i(brushSample, 1);
    
    GLint res = glGetUniformLocation(applyPaintProgram, "resolution");
    glUniform2f(res, (float)m_width, (float)m_height);

    GLint force = glGetUniformLocation(applyPaintProgram, "color");
    glUniform3f(force, R, G, B);

    glBindFramebuffer(GL_FRAMEBUFFER, velocity.writeBuffer.fboHandle);

    glActiveTexture(GL_TEXTURE0);
    glBindTexture(GL_TEXTURE_2D, velocity.readBuffer.texHandle);

    glActiveTexture(GL_TEXTURE1);
    glBindTexture(GL_TEXTURE_2D, brushTex);

    //set up the vertices array
    glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 0, testVerts.data());
    glEnableVertexAttribArray(0);

    glVertexAttribPointer(1, 2, GL_FLOAT, GL_FALSE, 0, doubleQuadTex.data());
    glEnableVertexAttribArray(1);

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