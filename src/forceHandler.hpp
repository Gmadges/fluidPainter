#ifndef FORCEHANDLER_H
#define FORCEHANDLER_H

#include "emscripten/bind.h"

/*

This class was created because it was quite fiddle passing around arrays with these structures back and forth between javascript and emscripten.
This means its much easier to work with the data I get from the javascript in c++.

*/

struct ForcePacket
{
    int xPix;
    int yPix;
    float xForce;
    float yForce;
    float size;
};

class ForceHandler
{
public:
    ForceHandler(){};
    ~ForceHandler(){};

    void addForcetoList(int _xPixel, int _yPixel, float _xForce, float _yForce, float _size);
    std::vector<ForcePacket>& getForceList();
    void reset();
    bool isForceAvailable();
    int getNumberForces();

private:  
    std::vector<ForcePacket> m_forceList;
};

EMSCRIPTEN_BINDINGS(ForceBindings) 
{
    emscripten::value_object<ForcePacket>("ForcePacket")
        .field("xPix", &ForcePacket::xPix)
        .field("yPix", &ForcePacket::yPix)
        .field("xForce", &ForcePacket::xForce)
        .field("yForce", &ForcePacket::yForce)
        .field("size", &ForcePacket::size);

    emscripten::register_vector<ForcePacket>("ForceList");

    emscripten::class_<ForceHandler>("ForceHandler")
        .constructor<>()
        .function("addForce", &ForceHandler::addForcetoList)
        .function("reset", &ForceHandler::reset)
        .function("getForces", &ForceHandler::getForceList)
        .function("isForceAvailable", &ForceHandler::isForceAvailable)
        .function("getNumberForces", &ForceHandler::getNumberForces);
}

void ForceHandler::addForcetoList(int _xPixel, int _yPixel, float _xForce, float _yForce, float _size)
{
    ForcePacket pkt;

    pkt.xPix = _xPixel;
    pkt.yPix = _yPixel;
    pkt.xForce = _xForce;
    pkt.yForce = _yForce;
    pkt.size = _size;

    m_forceList.push_back(pkt);
}

std::vector<ForcePacket>& ForceHandler::getForceList()
{
    return m_forceList;
}

void ForceHandler::reset()
{
    m_forceList.clear();
}

bool ForceHandler::isForceAvailable()
{
    return !m_forceList.empty();
}

int ForceHandler::getNumberForces()
{
    return m_forceList.size();
}

#endif