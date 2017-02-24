#ifndef FORCEHANDLER_H
#define FORCEHANDLER_H

#include "emscripten/bind.h"

struct ForcePacket
{
    int xPix;
    int yPix;
    float xForce;
    float yForce;
};

class ForceHandler
{
public:
    ForceHandler(){};
    ~ForceHandler(){};

    void addForcetoList(int xPixel,int yPixel,float xForce, float yForce);
    std::vector<ForcePacket>& getForceList();
    void reset();
    bool isForceAvailable();

private:  
    std::vector<ForcePacket> forceList;
};

EMSCRIPTEN_BINDINGS(ForceBindings) 
{
    emscripten::value_object<ForcePacket>("ForcePacket")
        .field("xPix", &ForcePacket::xPix)
        .field("yPix", &ForcePacket::yPix)
        .field("xForce", &ForcePacket::xForce)
        .field("yForce", &ForcePacket::yForce);

    emscripten::register_vector<ForcePacket>("ForceList");

    emscripten::class_<ForceHandler>("ForceHandler")
        .constructor<>()
        .function("addForce", &ForceHandler::addForcetoList)
        .function("reset", &ForceHandler::reset)
        .function("getForces", &ForceHandler::getForceList)
        .function("isForceAvailable", &ForceHandler::isForceAvailable);
}

void ForceHandler::addForcetoList(int xPixel,int yPixel,float xForce, float yForce)
{
    ForcePacket pkt;

    pkt.xPix = xPixel;
    pkt.yPix = yPixel;
    pkt.xForce = xForce;
    pkt.yForce = yForce;

    forceList.push_back(pkt);
}

std::vector<ForcePacket>& ForceHandler::getForceList()
{
    return forceList;
}

void ForceHandler::reset()
{
    forceList.clear();
}

bool ForceHandler::isForceAvailable()
{
    return !forceList.empty();
}

#endif