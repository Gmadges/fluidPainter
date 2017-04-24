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

    bool init(int _width, int _height);
    void advect(Buffer& _output, Buffer& _velocity, Buffer& _input, float _dissipate);
    void computeDivergence(Buffer& _divBuffer, Buffer& _velocity);
    void pressureSolve(DoubleBuffer& _pressure, Buffer& _divergence);    
    void subtractGradient(DoubleBuffer& _velocity, Buffer& _pressure);
    void applyForces(DoubleBuffer& _velocity, std::vector<ForcePacket>& _forces);
    void applyPaint(DoubleBuffer& _velocity, std::vector<ForcePacket>& _forces, float _R, float _G, float _B, float _alpha);
    void addBuffers(Buffer& _input1, Buffer& _input2 , Buffer& _output);
    void setBrush(int _b); 

private:
    void drawQuad();
    void loadBrushes(); 
    GLuint loadBrushTexture(std::string _path);

    std::vector<float> createQuadFromOnePoint(ForcePacket& _pnt);
    std::vector<float> createStripFrom3Points(ForcePacket& _pnt1, ForcePacket& _pnt2, ForcePacket& _pnt3);

private:

    std::vector<float> m_quadVerts;
    std::vector<float> m_doubleQuadTex;

    int m_height;
    int m_width;

    // shader programs
    GLuint m_advectProgram;
    GLuint m_jacobiProgram;
    GLuint m_subtractGradientProgram;
    GLuint m_computeDivergenceProgram;
    GLuint m_applyForceProgram;
    GLuint m_simpleDrawProgram;
    GLuint m_applyPaintProgram;
    GLuint m_addProgram;

    std::vector<GLuint> m_brushes;
    GLuint m_currentBrush;
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
        .function("addBuffers", &GridFluidSolver::addBuffers)
        .function("setBrush", &GridFluidSolver::setBrush);
}

//////////////////////////////////////////// SOURCE

bool GridFluidSolver::init(int _width, int _height)
{
    m_quadVerts =  {
        -1.0f,  1.0f, 0.0f, // Top-left
        1.0f,  1.0f, 0.0f, // Top-right
        1.0f, -1.0f, 0.0f, // Bottom-right

        1.0f, -1.0f, 0.0f, // Bottom-right
        -1.0f, -1.0f, 0.0f, // Bottom-left
        -1.0f,  1.0f, 0.0f, // Top-left
    };

    m_doubleQuadTex = {
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

    m_height = _height;
    m_width = _width;

    // init programs 
    m_advectProgram = Shaders::buildProgramFromFiles("data/simple.vert", "data/advect.frag");
    m_jacobiProgram = Shaders::buildProgramFromFiles("data/simple.vert", "data/jacobi.frag");
    m_subtractGradientProgram = Shaders::buildProgramFromFiles("data/simple.vert", "data/subGradient.frag");
    m_computeDivergenceProgram  = Shaders::buildProgramFromFiles("data/simple.vert", "data/compDivergence.frag");
    m_applyForceProgram  = Shaders::buildProgramFromFiles("data/simpleCol.vert", "data/applyForce.frag");
    m_applyPaintProgram  = Shaders::buildProgramFromFiles("data/simpleTex.vert", "data/applyPaint.frag");
    m_addProgram = Shaders::buildProgramFromFiles("data/simple.vert", "data/add.frag");

    loadBrushes();
    
    return true;
}

void GridFluidSolver::drawQuad()
{
    //set up the vertices array
    glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 0, m_quadVerts.data());
    glEnableVertexAttribArray(0);

    // draw
    glDrawArrays(GL_TRIANGLES, 0, 6);
}

void GridFluidSolver::advect(Buffer& _output, Buffer& _velocity, Buffer& _input, float _dissipate)
{
    // set shader
    glUseProgram(m_advectProgram);

    // set uniforms
    GLint resLoc = glGetUniformLocation(m_advectProgram, "resolution");
    GLint dissLoc = glGetUniformLocation(m_advectProgram, "dissipate");
    glUniform2f(resLoc, (float)m_width, (float)m_height);
    glUniform1f(dissLoc, _dissipate);

    // set textures
    GLint sourceTexture = glGetUniformLocation(m_advectProgram, "inputSampler");
    glUniform1i(sourceTexture, 1);

    //bind
    glBindFramebuffer(GL_FRAMEBUFFER, _output.fboHandle);
    glActiveTexture(GL_TEXTURE0);
    glBindTexture(GL_TEXTURE_2D, _velocity.texHandle);
    glActiveTexture(GL_TEXTURE1);
    glBindTexture(GL_TEXTURE_2D, _input.texHandle);
    
    drawQuad();

    // unbind the framebuffer
    glBindFramebuffer(GL_FRAMEBUFFER, 0);
}

void GridFluidSolver::applyForces(DoubleBuffer& _velocity, std::vector<ForcePacket>& _forces)
{
    std::vector<float> verts;
    std::vector<float> cols;

    if(_forces.size() == 3)
    {
        verts = createStripFrom3Points(_forces[0], _forces[1], _forces[2]);

        // TODO properly currently not sending diff force for diff points
        for(int i = 0; i < 12; i++)
        {
            cols.push_back(_forces[0].xForce);
            cols.push_back(_forces[0].yForce);
            cols.push_back(0.0);
        }
    }
    else if(_forces.size() == 1) 
    {
        verts = createQuadFromOnePoint(_forces[0]);

        for(int i = 0; i < 6; i++)
        {
            cols.push_back(_forces[0].xForce);
            cols.push_back(_forces[0].yForce);
            cols.push_back(0.0);
        }
    }

    if(verts.empty()) return;

    glUseProgram(m_applyForceProgram);

    glBindFramebuffer(GL_FRAMEBUFFER, _velocity.writeBuffer.fboHandle);

    GLint brushSample = glGetUniformLocation(m_applyForceProgram, "brush");
    glUniform1i(brushSample, 1);
    
    GLint res = glGetUniformLocation(m_applyForceProgram, "resolution");
    glUniform2f(res, (float)m_width, (float)m_height);

    glActiveTexture(GL_TEXTURE0);
    glBindTexture(GL_TEXTURE_2D, _velocity.readBuffer.texHandle);

    glActiveTexture(GL_TEXTURE1);
    glBindTexture(GL_TEXTURE_2D, m_currentBrush);

    //set up the vertices array
    glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 0, verts.data());
    glEnableVertexAttribArray(0);
    
    glVertexAttribPointer(1, 3, GL_FLOAT, GL_FALSE, 0, cols.data());
    glEnableVertexAttribArray(1);

    glVertexAttribPointer(2, 2, GL_FLOAT, GL_FALSE, 0, m_doubleQuadTex.data());
    glEnableVertexAttribArray(2);

    // draw
    glDrawArrays(GL_TRIANGLES, 0, verts.size() / 3);

    // unbind the framebuffer
    glBindFramebuffer(GL_FRAMEBUFFER, 0);
}

std::vector<float> GridFluidSolver::createQuadFromOnePoint(ForcePacket& _pnt)
{
    std::vector<float> verts;
    
    float x1 = -1.0f + (2.0f * _pnt.xPix / (float)m_width);
    float y1 = -1.0f + (2.0f * _pnt.yPix / (float)m_height);

    // test for ease
    float rad = 0.5 * (_pnt.size / (float)((m_height + m_width)/2));

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



std::vector<float> GridFluidSolver::createStripFrom3Points(ForcePacket& _pnt1, ForcePacket& _pnt2, ForcePacket& _pnt3)
{
    std::vector<float> verts;
    
    float x1 = -1.0f + (2.0f * _pnt1.xPix / (float)m_width);
    float y1 = -1.0f + (2.0f * _pnt1.yPix / (float)m_height);

    float x2 = -1.0f + (2.0f * _pnt2.xPix / (float)m_width);
    float y2 = -1.0f + (2.0f * _pnt2.yPix / (float)m_height);

    float x3 = -1.0f + (2.0f * _pnt3.xPix / (float)m_width);
    float y3 = -1.0f + (2.0f * _pnt3.yPix / (float)m_height);

    // test for ease
    float rad = 0.5 * (_pnt1.size / (float)((m_height + m_width)/2));

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

    // coords
    float topP1X = x1-(perpX1 * rad);
    float topP1Y = y1-(perpY1 * rad);

    float topP2X = x1+(perpX1 * rad);
    float topP2Y = y1+(perpY1 * rad);

    float midP1X = x2-(perpX3 * rad);
    float midP1Y = y2-(perpY3 * rad);

    float midP2X = x2+(perpX3 * rad);
    float midP2Y = y2+(perpY3 * rad);

    float botP1X = x3-(perpX2 * rad);
    float botP1Y = y3-(perpY2 * rad);

    float botP2X = x3+(perpX2 * rad);
    float botP2Y = y3+(perpY2 * rad);

    // quad 1

    // Top-left
    verts.push_back(topP1X);
    verts.push_back(topP1Y);
    verts.push_back(0.0f);
    
    // Top-right
    verts.push_back(topP2X);
    verts.push_back(topP2Y);
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
    verts.push_back(topP1X);
    verts.push_back(topP1Y);
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
    verts.push_back(botP2X);
    verts.push_back(botP2Y);
    verts.push_back(0.0f);

    // Bottom-right
    verts.push_back(botP2X);
    verts.push_back(botP2Y);
    verts.push_back(0.0f);

    // Bottom-left
    verts.push_back(botP1X);
    verts.push_back(botP1Y);
    verts.push_back(0.0f);

    // Top-left
    verts.push_back(midP1X);
    verts.push_back(midP1Y);
    verts.push_back(0.0f);

    return verts;
}

void GridFluidSolver::setBrush(int _b) 
{
    if(_b >= m_brushes.size() || _b < 0) return;

    m_currentBrush = m_brushes[_b];
}

void GridFluidSolver::loadBrushes() 
{
    m_brushes.push_back(loadBrushTexture("data/blur.png"));
    m_brushes.push_back(loadBrushTexture("data/spotty.png"));
    m_brushes.push_back(loadBrushTexture("data/line.png"));
    m_brushes.push_back(loadBrushTexture("data/cross.png"));
    m_brushes.push_back(loadBrushTexture("data/star.png"));

    setBrush(0);
}

GLuint GridFluidSolver::loadBrushTexture(std::string _path)
{   
    GLuint tex;
    SDL_Surface *image;

    if(!(image = IMG_Load(_path.c_str()))) 
    {
        fprintf(stderr, "Could not load texture image: %s\n", IMG_GetError());
        return tex;
    }

    glGenTextures(1, &tex);
    glBindTexture(GL_TEXTURE_2D, tex);
    glTexParameteri( GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR );
    glTexParameteri( GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR );
    
    glTexImage2D(GL_TEXTURE_2D, 0, GL_RGB, image->w, image->h, 0, GL_RGB, GL_UNSIGNED_BYTE, image->pixels);

    SDL_FreeSurface(image);

    return tex;
}

void GridFluidSolver::applyPaint(DoubleBuffer& _velocity, std::vector<ForcePacket>& _forces, float _R, float _G, float _B, float _alpha)
{
    std::vector<float> testVerts;

    // how many points?
    if(_forces.size() == 3)
    {
        testVerts = createStripFrom3Points(_forces[0], _forces[1], _forces[2]);
    }
    else if(_forces.size() == 1) 
    {
        testVerts = createQuadFromOnePoint(_forces[0]);
    }

    if(testVerts.empty()) return;

    glUseProgram(m_applyPaintProgram);

    GLint brushSample = glGetUniformLocation(m_applyPaintProgram, "brush");
    glUniform1i(brushSample, 1);
    
    GLint res = glGetUniformLocation(m_applyPaintProgram, "resolution");
    glUniform2f(res, (float)m_width, (float)m_height);

    GLint force = glGetUniformLocation(m_applyPaintProgram, "color");
    glUniform4f(force, _R, _G, _B, _alpha);

    glBindFramebuffer(GL_FRAMEBUFFER, _velocity.writeBuffer.fboHandle);

    glActiveTexture(GL_TEXTURE0);
    glBindTexture(GL_TEXTURE_2D, _velocity.readBuffer.texHandle);

    glActiveTexture(GL_TEXTURE1);
    glBindTexture(GL_TEXTURE_2D, m_currentBrush);

    //set up the vertices array
    glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 0, testVerts.data());
    glEnableVertexAttribArray(0);

    glVertexAttribPointer(1, 2, GL_FLOAT, GL_FALSE, 0, m_doubleQuadTex.data());
    glEnableVertexAttribArray(1);

    // draw
    glDrawArrays(GL_TRIANGLES, 0, testVerts.size() / 3);

    // unbind the framebuffer
    glBindFramebuffer(GL_FRAMEBUFFER, 0);

}

void GridFluidSolver::addBuffers(Buffer& _input1, Buffer& _input2 , Buffer& _output)
{
    glUseProgram(m_addProgram);

    GLint input2Sampler = glGetUniformLocation(m_addProgram, "input2");
    GLint res = glGetUniformLocation(m_addProgram, "resolution");

    glUniform2f(res, (float)m_width, (float)m_height);
    glUniform1i(input2Sampler, 1);

    glBindFramebuffer(GL_FRAMEBUFFER, _output.fboHandle);
    glActiveTexture(GL_TEXTURE0);
    glBindTexture(GL_TEXTURE_2D, _input1.texHandle);
    glActiveTexture(GL_TEXTURE1);
    glBindTexture(GL_TEXTURE_2D, _input2.texHandle);

    drawQuad();

    // unbind the framebuffer
    glBindFramebuffer(GL_FRAMEBUFFER, 0);
}

void GridFluidSolver::computeDivergence(Buffer& _divBuffer, Buffer& _velocity)
{
    glUseProgram(m_computeDivergenceProgram);

    GLint res = glGetUniformLocation(m_computeDivergenceProgram, "resolution");
    glUniform2f(res, (float)m_width, (float)m_height);

    glBindFramebuffer(GL_FRAMEBUFFER, _divBuffer.fboHandle);
    glActiveTexture(GL_TEXTURE0);
    glBindTexture(GL_TEXTURE_2D, _velocity.texHandle);
    
    drawQuad();

    // unbind the framebuffer
    glBindFramebuffer(GL_FRAMEBUFFER, 0);
}

void GridFluidSolver::pressureSolve(DoubleBuffer& _pressure, Buffer& _divergence)
{
    glUseProgram(m_jacobiProgram);

    GLint alpha = glGetUniformLocation(m_jacobiProgram, "Alpha");
    GLint dSampler = glGetUniformLocation(m_jacobiProgram, "Divergence");
    GLint res = glGetUniformLocation(m_jacobiProgram, "resolution");

    glUniform2f(res, (float)m_width, (float)m_height) ;
    glUniform1f(alpha, -((float)m_width * (float)m_height));
    glUniform1i(dSampler, 1);

    glBindFramebuffer(GL_FRAMEBUFFER, _pressure.writeBuffer.fboHandle);
    glActiveTexture(GL_TEXTURE0);
    glBindTexture(GL_TEXTURE_2D, _pressure.readBuffer.texHandle);
    glActiveTexture(GL_TEXTURE1);
    glBindTexture(GL_TEXTURE_2D, _divergence.texHandle);

    drawQuad();

    // unbind the framebuffer
    glBindFramebuffer(GL_FRAMEBUFFER, 0);
}

void GridFluidSolver::subtractGradient(DoubleBuffer& _velocity, Buffer& _pressure)
{
    glUseProgram(m_subtractGradientProgram);

    GLint res = glGetUniformLocation(m_subtractGradientProgram, "resolution");
    glUniform2f(res, (float)m_width, (float)m_height) ;

    GLint sampler = glGetUniformLocation(m_subtractGradientProgram, "Pressure");
    glUniform1i(sampler, 1);

    glBindFramebuffer(GL_FRAMEBUFFER, _velocity.writeBuffer.fboHandle);
    glActiveTexture(GL_TEXTURE0);
    glBindTexture(GL_TEXTURE_2D, _velocity.readBuffer.texHandle);
    glActiveTexture(GL_TEXTURE1);
    glBindTexture(GL_TEXTURE_2D, _pressure.texHandle);
    
    drawQuad();

    // unbind the framebuffer
    glBindFramebuffer(GL_FRAMEBUFFER, 0);
}

#endif