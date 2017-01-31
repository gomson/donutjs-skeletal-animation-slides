var animationSystem = require('skeletal-animation-system')
var createOrbitCamera = require('create-orbit-camera')
var vec3Normalize = require('gl-vec3/normalize')
var vec3Scale = require('gl-vec3/scale')

module.exports = {
  renderHTML: rendersocialMediaWithController,
  renderCanvas: renderCanvas
}

function rendersocialMediaWithController (h, StateStore) {
  return h('div', {
  }, [
    h('h1', {
    }, [
      'If you\'re interested in the 3d web, join me on Twitter/GitHub:'
    ]),
    h('h1', {
    }, [
      '@chinedufn'
    ])
  ])
}

function renderCanvas (gl, models, state) {
  gl.viewport(0, 0, state.viewport.width, state.viewport.height)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  gl.useProgram(models.socialMedia.shaderProgram)

  var camera = createOrbitCamera({
    position: [0, 5, 7],
    target: [0, 0, 0],
    xRadians: state.camera.xRadians,
    yRadians: state.camera.yRadians
  })

  var lightingDirection = [1, -3, -1]
  var normalizedLD = []
  vec3Normalize(normalizedLD, lightingDirection)
  vec3Scale(normalizedLD, normalizedLD, -1)

  var interpolatedQuats = animationSystem.interpolateJoints({
    blendFunction: function (dt) {
      // Blend linearly over 1 second
      return dt
    },
    currentTime: state.currentClockTime,
    keyframes: models.socialMedia.keyframes,
    jointNums: [0],
    currentAnimation: {
      range: [0, 4],
      startTime: 0
    }
    // previousAnimation: state.upperBody.previousAnimation
  })

  var interpolatedRotQuats = []
  var interpolatedTransQuats = []

  var jointNums = [0]
  jointNums.forEach(function (jointNum) {
    interpolatedRotQuats[jointNum] = interpolatedQuats[jointNum].slice(0, 4)
    interpolatedTransQuats[jointNum] = interpolatedQuats[jointNum].slice(4, 8)
  })

  var uniforms = {
    uUseLighting: true,
    uAmbientColor: [0.2, 0.2, 0.2],
    uLightingDirection: normalizedLD,
    uDirectionalColor: [1.0, 0, 0],
    uMVMatrix: camera.viewMatrix,
    uPMatrix: state.viewport.perspective,
    boneRotQuaternions0: interpolatedRotQuats[0],
    boneTransQuaternions0: interpolatedTransQuats[0]
  }

  models.socialMedia.draw({
    attributes: {
      aVertexPosition: models.socialMedia.bufferData.aVertexPosition,
      aVertexNormal: models.socialMedia.bufferData.aVertexNormal,
      aJointIndex: models.socialMedia.bufferData.aJointIndex,
      aJointWeight: models.socialMedia.bufferData.aJointWeight
    },
    uniforms: uniforms
  })
}