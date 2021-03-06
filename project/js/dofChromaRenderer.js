/**
 * @file Class for a DoF renderer
 *
 * @author Hayato Ikoma <hikoma@stanford.edu>
 * @copyright The Board of Trustees of the Leland
 Stanford Junior University
 * @version 2018/03/28
 */


/**
 * DofChromaRenderer
 *
 * @class DofChromaRenderer
 * @classdesc Class for DoF rendering with chromablur.
 * This class should be used for adding some post effets on a pre-rendered scene.
 *
 *
 * @param  {THREE.WebGLRenderer} webglRenderer renderer
 * @param  {DisplayParameters} dispParams    display parameters
 */
var DofChromaRenderer = function ( webglRenderer, dispParams ) {

	// Alias for acceccing this from a closure
	var _this = this;


	// Set up a render target (a.k.a. frame buffer object in WebGL/OpenGL
	this.renderTarget = new THREE.WebGLRenderTarget(
		dispParams.canvasWidth, dispParams.canvasHeight );

	// Set up a depth buffer on the render target
	this.renderTarget.depthTexture = new THREE.DepthTexture();


	var camera = new THREE.Camera();

	var scene = new THREE.Scene();

	var material = new THREE.RawShaderMaterial( {

		uniforms: {

			textureMap: { value: this.renderTarget.texture },

			depthMap: { value: this.renderTarget.depthTexture },

			projectionMat: { value: new THREE.Matrix4() },

			invProjectionMat: { value: new THREE.Matrix4() },

			windowSize: { value: new THREE.Vector2(
				dispParams.canvasWidth, dispParams.canvasHeight ) },

			// Gaze position in [px]
			gazePosition: { value: new THREE.Vector2() },

			pupilDiameter: { value: dispParams.pupilDiameter },

			pixelPitch: { value: dispParams.pixelPitch },

		},

		vertexShader: $( "#vShaderDof" ).text(),

		fragmentShader: $( "#fShaderChromaDof" ).text(),

	} );


	// THREE.PlaneBufferGeometry( 2, 2 ) creates four vertices (-1,1,0),
	// (1,1,0),(-1,-1,0), (1,-1,0), which are position attributes. In addition,
	// it has texture coordinates (0,1), (1,1), (0,0), (1,0), which are uv
	// attributes. Check it in console to see what's stored in "mesh".
	var mesh = new THREE.Mesh(
		new THREE.PlaneBufferGeometry( 2, 2 ), material );

	scene.add( mesh );



	/* Public functions */

	// Perform rendering
	//
	// INPUT
	// state: the state object of StateController
	// projectionMat: projection matrix
	this.render = function ( state, projectionMat ) {

		var gazePosition = state.gazePosition;

		material.uniforms.gazePosition.value.set( gazePosition.x, gazePosition.y );

		material.uniforms.projectionMat.value.copy( projectionMat );

		material.uniforms.invProjectionMat.value.copy(
			new THREE.Matrix4().getInverse( projectionMat ) );

		webglRenderer.render( scene, camera );

	};



	/* Event listners */

	// Automatic update of the renderer size when the window is resized.
	$( window ).resize( function () {

		_this.renderTarget.setSize(
			dispParams.canvasWidth, dispParams.canvasHeight );

		material.uniforms.windowSize.value.set(
			dispParams.canvasWidth, dispParams.canvasHeight );

	} );

};
