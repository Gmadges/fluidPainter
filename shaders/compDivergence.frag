precision mediump float;

varying mediump vec2 tex;                                         

uniform sampler2D Velocity;                                                                                  
uniform mediump float HalfInverseCellSize;
uniform mediump vec2 inverseRes;

vec2 sampleVelocity(sampler2D velocity, vec2 coord)
{
    
    vec2 cellOffset = vec2(0.0, 0.0);
    vec2 multiplier = vec2(1.0, 1.0);

    // handle me bounds
    if(coord.x < 0.0)
    {
        cellOffset.x = 1.0;
        multiplier.x = -1.0;
    }
    else if(coord.x > 1.0)
    {
        cellOffset.x = -1.0;
        multiplier.x = -1.0;
    }

    if(coord.y < 0.0)
    {
        cellOffset.y = 1.0;
        multiplier.y = -1.0;
    }
    else if(coord.y > 1.0)
    {
        cellOffset.y = -1.0;
        multiplier.y = -1.0;
    }

    return multiplier * texture2D(velocity, coord + cellOffset * inverseRes).xy;
}                            

void main()                                                           
{                                                                                                     
    // Find neighboring velocities, north, east , south, west
    vec2 vT = sampleVelocity(Velocity, tex + vec2(0, inverseRes.y));
    vec2 vB = sampleVelocity(Velocity, tex - vec2(0, inverseRes.y));      
    vec2 vR = sampleVelocity(Velocity, tex + vec2(inverseRes.x, 0));       
    vec2 vL = sampleVelocity(Velocity, tex - vec2(inverseRes.x, 0));              

    gl_FragColor = vec4( HalfInverseCellSize * (abs(vR.x - vL.x) + abs(vT.y - vB.y)), 0, 0, 1);   
}                                                                     
