#ifndef FORCEHANDLER_H
#define FORCEHANDLER_H

#include "emscripten/bind.h"

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

    void addForcetoList(int xPixel,int yPixel,float xForce, float yForce, float size);
    std::vector<ForcePacket>& getForceList();
    void reset();
    bool isForceAvailable();
    int getNumberForces();

private:  
    std::vector<ForcePacket> forceList;
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

void ForceHandler::addForcetoList(int xPixel,int yPixel,float xForce, float yForce, float size)
{
    ForcePacket pkt;

    pkt.xPix = xPixel;
    pkt.yPix = yPixel;
    pkt.xForce = xForce;
    pkt.yForce = yForce;
    pkt.size = size;

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

int ForceHandler::getNumberForces()
{
    return forceList.size();
}

#endif