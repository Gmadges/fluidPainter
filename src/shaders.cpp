#include "shaders.h"
#include <iostream>

GLuint loadShader(GLenum type, const char *source)
{
	//create a shader
	GLuint shader = glCreateShader(type);
	if (shader == 0)
	{
		std::cerr << "Error creating shader" << std::endl;
		return 0;
	}

	//load the shader source to the shader object and compile it
	glShaderSource(shader, 1, &source, NULL);
	glCompileShader(shader);

	//check if the shader compiled successfully
	GLint compiled;
	glGetShaderiv(shader, GL_COMPILE_STATUS, &compiled);
	if (!compiled)
	{
		std::cerr << "Shader compilation error" << std::endl;
		glDeleteShader(shader);
		return 0;
	}

	return shader;
}

GLuint buildProgram(GLuint vertexShader, GLuint fragmentShader, const char * vertexPositionName)
{
	//create a GL program and link it
	GLuint programObject = glCreateProgram();
	glAttachShader(programObject, vertexShader);
	glAttachShader(programObject, fragmentShader);
	glBindAttribLocation(programObject, 0, vertexPositionName);
	glLinkProgram(programObject);

	//check if the program linked successfully
	GLint linked;
	glGetProgramiv(programObject, GL_LINK_STATUS, &linked);
	if (!linked)
	{
		std::cerr << "Program link error" << std::endl;
		glDeleteProgram(programObject);
		return 0;
	}
	return programObject;
}