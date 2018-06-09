/**
 * @file Fragment shader for DoF rendering
 *
 * @copyright The Board of Trustees of the Leland Stanford Junior University
 * @version 2018/03/28
 */

/* TODO (2.3) DoF Rendering */

var shaderID = "fShaderChromaDof";

var shader = document.createTextNode( `
/**
 * WebGL doesn't set any default precision for fragment shaders.
 * Precision for vertex shader is set to "highp" as default.
 * Do not use "lowp". Some mobile browsers don't support it.
 */
precision mediump float;

// uv coordinates after interpolation
varying vec2 textureCoords;

// texture map from the first rendering
uniform sampler2D textureMap;

// depth map from the first rendering
uniform sampler2D depthMap;

// Projection matrix used for the first pass
uniform mat4 projectionMat;

// Inverse of projectionMat
uniform mat4 invProjectionMat;

// resolution of the window in [pixels]
uniform vec2 windowSize;

// Gaze position in [pixels]
uniform vec2 gazePosition;

// Diameter of pupil in [mm]
uniform float pupilDiameter;

// pixel pitch in [mm]
uniform float pixelPitch;

const float searchRad = 11.0;


// Compute the distance to fragment
float distToFrag( vec2 p ) {

	/* TODO (2.3.1) Distance to Fragment */
	float zNDC = 2.0*texture2D(depthMap, p).x - 1.0;
	float wClip = projectionMat[3][2]/(zNDC-projectionMat[2][2]/projectionMat[2][3]);
	float zClip = zNDC*wClip;
	float zView = (zClip - projectionMat[3][2])/projectionMat[2][2];
	float zDist = -zView;
	
	return zDist;

}

// compute defocus for red and blue in mm
float computeDefocus(float fragDist, float wavelength ) {
	float defocusD = 1.731 - 633.46/(wavelength - 214.10); // in diopters
	float defocusDist = 1000.0 / (1.0/fragDist + defocusD);
	return defocusDist; // in mm
}

// compute the circle of confusion, 0 = red, 1 = green, 2 = blue
float computeCoC( float fragDist, float focusDist , int color) { 
	float cc;
	if ( color == 0 ){
		if (fragDist != focusDist){
			float fragR = computeDefocus(fragDist, 750.0);
			cc = pupilDiameter/fragR* abs(fragR - focusDist);
		}
		else {
			cc = 0.0;
		}
	}
	
	else if ( color == 1 ){
		cc = pupilDiameter/fragDist* abs(fragDist - focusDist);
	}
	
	else {
		if (fragDist != focusDist){
			float fragB = computeDefocus(fragDist, 450.0);
			cc = pupilDiameter/fragB* abs(fragB - focusDist);
		}
		else {
			cc = 0.0;
		}
	}
	return cc;

}


// compute blur
vec3 computeBlur() {

	/* TODO (2.3.3) Retinal Blur */
	float dFrag = 1000.0; //distToFrag(textureCoords);
	float dFocus = 500.0;// set to distance of screen from viewer
	
	float ccPixelR = computeCoC(dFrag, dFocus, 0)/(2.0 * pixelPitch);
	float ccPixelG = computeCoC(dFrag, dFocus, 1)/(2.0 * pixelPitch);
	float ccPixelB = computeCoC(dFrag, dFocus, 2)/(2.0 * pixelPitch);
	
	vec4 sumTex = vec4(0.0);
	float sumTexR = 0.0;
	float sumTexG = 0.0;
	float sumTexB = 0.0;
	int ctR = 0;
	int ctG = 0;
	int ctB = 0;
	
	/* Would like to implement smoothing function in here...would need a large(2D) gaussian Kernel where each row is a 1D gaussian Kernel of different width from 3 to 23 pixels wide padded by zeros?*/

	for (int i = -int(searchRad); i<= int(searchRad); i++){
		for (int j = -int(searchRad); j<= int(searchRad); j++){
			vec4 newTex = texture2D( textureMap, vec2(textureCoords.x - float(i)/windowSize.x, textureCoords.y - float(j)/windowSize.y));
			if (float(i*i+j*j) <= (ccPixelR*ccPixelR)){
				sumTexR += newTex.r;
				ctR ++;
			}
			if (float(i*i+j*j) <= (ccPixelG*ccPixelG)){
				sumTexG += newTex.g;
				ctG ++;
			}
			if (float(i*i+j*j) <= (ccPixelB*ccPixelB)){
				sumTexB += newTex.b;
				ctB ++;
			}
		}
	}
	sumTex.r = sumTexR / float(ctR);
	sumTex.g = sumTexG / float(ctG);
	sumTex.b = sumTexB / float(ctB);
	return sumTex.rgb;
}


void main() {

	gl_FragColor = vec4(computeBlur(), 1.0);

}
` );


var shaderNode = document.createElement( "script" );

shaderNode.id = shaderID;

shaderNode.setAttribute( "type", "x-shader/x-fragment" );

shaderNode.appendChild( shader );

document.body.appendChild( shaderNode );
