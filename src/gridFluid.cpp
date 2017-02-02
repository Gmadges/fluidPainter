// #include "gridFluid.h"
// #include "shaders.h"

// #include <iostream>

// #define cellSize 8





// void GridFluid::computeDivergence()
// {
//     glUseProgram(computeDivergenceProgram);

//     GLint halfCell = glGetUniformLocation(computeDivergenceProgram, "HalfInverseCellSize");
//     glUniform1f(halfCell, 0.5f / cellSize);

//     //glBindFramebuffer(GL_FRAMEBUFFER, pDivergenceBuffer->fboHandle);
//     //glActiveTexture(GL_TEXTURE0);
//     //glBindTexture(GL_TEXTURE_2D, pVelocityBuffers->readBuffer.textureHandle);
	
//     // draw
//     glDrawArrays(GL_TRIANGLES, 0, 6);
// }

// void GridFluid::jacobi()
// {
//     glUseProgram(jacobiProgram);

//     GLint alpha = glGetUniformLocation(jacobiProgram, "Alpha");
//     GLint inverseBeta = glGetUniformLocation(jacobiProgram, "InverseBeta");
//     GLint dSampler = glGetUniformLocation(jacobiProgram, "Divergence");

//     glUniform1f(alpha, -cellSize * cellSize);
//     glUniform1f(inverseBeta, 0.25f);
//     glUniform1i(dSampler, 1);

//     //glBindFramebuffer(GL_FRAMEBUFFER, pPressureBuffers->writeBuffer.fboHandle);
//     //glActiveTexture(GL_TEXTURE0);
//     //glBindTexture(GL_TEXTURE_2D, pPressureBuffers->readBuffer.textureHandle);
//     //glActiveTexture(GL_TEXTURE1);
//     //glBindTexture(GL_TEXTURE_2D, pDivergenceBuffer->textureHandle);
	
//     // draw
//     glDrawArrays(GL_TRIANGLES, 0, 6);

//     //pPressureBuffers->swap();
// }

// void GridFluid::subtractGradient()
// {
//     glUseProgram(subtractGradientProgram);

//     GLint gradientScale = glGetUniformLocation(subtractGradientProgram, "GradientScale");
//     glUniform1f(gradientScale, 1.125f / cellSize);
//     GLint halfCell = glGetUniformLocation(subtractGradientProgram, "HalfInverseCellSize");
//     glUniform1f(halfCell, 0.5f / cellSize);
//     GLint sampler = glGetUniformLocation(subtractGradientProgram, "Pressure");
//     glUniform1i(sampler, 1);

//     //glBindFramebuffer(GL_FRAMEBUFFER, pVelocityBuffers->writeBuffer.fboHandle);
//     //glActiveTexture(GL_TEXTURE0);
//     //glBindTexture(GL_TEXTURE_2D, pVelocityBuffers->readBuffer.textureHandle);
//     //glActiveTexture(GL_TEXTURE1);
//     //glBindTexture(GL_TEXTURE_2D, pPressureBuffers->readBuffer.textureHandle);
	
//     // draw
//     glDrawArrays(GL_TRIANGLES, 0, 6);

//     //pVelocityBuffers->swap();
// }

// void GridFluid::resetState()
// {

// }

