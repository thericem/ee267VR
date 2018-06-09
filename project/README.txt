README

included:
All source files (.css, .js, .png, .html)
this README
Python notebook with all the math for prototyping (.ipynb)

How to run:
	Open render.html in a Chrome. Cycle through the rendering modes with the button in the top left, or using keys 1 (in focus) , 2 (conventional DoF), 3 (ChromaBlur), or 4 (Blank).
	
Design
--------
Credit for the framework of the project goes to the EE267 TAs, as it was built off of the HW3 provided files. The main difference is the addition of a new rendering mode - ChromaDoF. 

This rendering mode duplicated then extended the previous DoF rendering class, and its associated fragment shader. In order to change the amount of defocus for both the DoF and the ChromaDoF modes, you can either change the location of the image plane in standardRenderer.js, or change the fragment/focus depth in the fragment shaders (fShaderDof.js and fShaderChromaDoF.js). The image can be changed inside the standardRenderer.js file (it's just a texture applied to a plane). 

For the experiment run, the fragment/focus depth was changed and the depth of the image plane was held fixed, to keep size cues from muddy-ing the results. 

The math used inside the fragment shader was first implemented in the python file for testing and visualization purposes. The python file includes an implementation of the extension talked about at the end of the write-up of Gaussian smoothing.



