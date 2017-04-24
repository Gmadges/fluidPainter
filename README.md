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

#### Operating System

| OS | Version |
| ---- | --------- |
| Windows	| Tested (Windows 10) |
| Linux     | Working (RedHat 7.2)  |
| OSX		| Coming soon |

#### Browser

| Browser | Version |
| ---- | --------- |
| Chrome	| >= 51.0.2704.106 |
| Firefox   | >= 45.3.0 |

Dependencies
------------

| Name | Version |
| ---- | --------- |
| [Emscripten](https://kripken.github.io/)      | 1.35.0 |
| [Nodejs](https://nodejs.org/)                 | >= v4.1.1 |
| [gnu make](https://www.gnu.org/software/make/)| 3.82 |
| [npm](https://www.npmjs.com/)                 | 2.14.4 |
| [python(optional)](https://www.python.org/)   | 2.7 |


Getting and Building the Code (Basic)
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
The "make clean" command is important if any changes have occured to data that will be packaged up(shaders, textures).

