/**
 * @file Fragment shader for DoF rendering
 *
 * @copyright The Board of Trustees of the Leland Stanford Junior University
 * @version 2018/03/28
 */

/* TODO (2.3) DoF Rendering */

var shaderID = "fShaderDof";

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

float computeCoC( float fragDist, float focusDist) { 
	float cc;
	cc = pupilDiameter/fragDist* abs(fragDist-focusDist);
	return cc;

}


// compute blur
vec3 computeBlur() {

	/* TODO (2.3.3) Retinal Blur */
	float dFrag = 1000.0; //distToFrag(textureCoords);
	float dFocus = 500.0; //Choose focal plane in plane of monitor
	
	float ccPixel = computeCoC(dFrag, dFocus)/(2.0 * pixelPitch);

	vec4 sumTex = vec4(0.0);
	int ct = 0;

	for (int i = -int(searchRad); i<= int(searchRad); i++){
		for (int j = -int(searchRad); j<= int(searchRad); j++){
			vec4 newTex = texture2D( textureMap, vec2(textureCoords.x - float(i)/windowSize.x, textureCoords.y - float(j)/windowSize.y));
			if (float(i*i+j*j) <= (ccPixel*ccPixel)){
				sumTex += newTex;
				ct ++;				
			}
		}
	}
	
	return sumTex.rgb/float(ct);
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
