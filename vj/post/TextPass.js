import THREE from 'three';
import Shaders from '../shaders/shaders';

THREE.TextPass = function ( texture, textTexture ) {

	if ( THREE.CopyShader === undefined )
		console.error( "THREE.TexturePass relies on THREE.CopyShader" );

		console.log(texture, textTexture)
	var shader = Shaders.textStencil;
	shader.uniforms[ "tDiffuse" ].value = texture;
	shader.uniforms[ "tText" ].value = textTexture;

	this.material = new THREE.ShaderMaterial( {

		uniforms: shader.uniforms,
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader

	} );

	this.enabled = true;
	this.needsSwap = false;

	this.camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
	this.scene  = new THREE.Scene();

	this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
	this.scene.add( this.quad );

};

THREE.TextPass.prototype = {

	render: function ( renderer, writeBuffer, readBuffer, delta ) {

		this.quad.material = this.material;

		renderer.render( this.scene, this.camera, readBuffer );

	}

};
export default THREE.TextPass;
