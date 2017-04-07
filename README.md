FluidPainter
===========================

implementation in browser of a paint tool that uses fluid dynamics for more realistic paint.

Build Status
------------

// TODO with travis

Additional Documentation
------------------------

// TODO WIKI

Supported Platforms
-------------------

Tested on linux and windows

Dependencies
------------

| Name | Version |
| ---- | --------- |
| [Emscripten](https://kripken.github.io/)      | todo |
| [Nodejs]()                                    | todo |
| [gnu make]()                                  | todo |
| [npm]()                                       | todo |
| [python(optional)]()                          | todo |


Getting and Building the Code
-----------------------------

### 1. Clone the repo:

```bash 
git clone https://github.com/Gmadges/fluidPainter
```

### 2. Download packages:
```bash
cd fluidPainter
npm install
```

### 3. Building

#### Using Build tools 

```bash
npm run build
```
This will build all and serve on localhost:3000.
It will also look for changes made and rebuild and refresh accordingly.

#### Manually Building

2 Steps to build the project "manually"

##### Typescript
Install typescript globally so we can call it easier
```bash
npm install -g typescript
```
To build
```bash
tsc
```

##### Emscripten
```bash
make clean
make
```
make clean is important when rebuilding shaders.
