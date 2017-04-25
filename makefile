EMCC=emcc
CPPSOURCES:=$(wildcard src/*.cpp)
LDFLAGS=-O2 --llvm-opts 2
RELEASEFLAGS= -O3 --llvm-opts 3
OUTPUT=app/glcore.js

TSC=tsc
TSSOURCES:=$(wildcard src/*.ts)
TSFLAGS= --outDir app/

all: $(CPPSOURCES) $(OUTPUT)

$(OUTPUT): $(CPPSOURCES) 
	$(EMCC) $(CPPSOURCES) --bind -s FULL_ES2=1 -s USE_SDL_IMAGE=2 -s SDL2_IMAGE_FORMATS='["png"]' --preload-file data/ --profiling -std=c++11 $(LDFLAGS) -o $(OUTPUT)

RELEASE: $(CPPSOURCES) 
	$(EMCC) $(CPPSOURCES) --bind -s FULL_ES2=1 -s USE_SDL_IMAGE=2 -s SDL2_IMAGE_FORMATS='["png"]' --preload-file data/  -std=c++11 $(RELEASEFLAGS) -o $(OUTPUT)

TSBUILD: $(TSSOURCES)
	$(TSC) $(TSSOURCES) $(TSFLAGS) 

clean:
ifeq ($(OS),Windows_NT)
	del app\glcore.*
else
	rm -f app/glcore.*
endif
