# ArrayBufferView stride parameter

**Author**: Shu-yu Guo, Surma

**Champion**: Shu-yu Guo

**Stage**: Stage 1 of [the TC39 process](https://tc39.github.io/process-document/).

## Motivation

[ArrayBuffer views][typedarray] (like `Uint8Array`, `Float32Array`, etc) provide views onto [`ArrayBuffer`][arraybuffer]s. These views allow the same chunk of memory to be interpreted as different kinds of data and allow developers to manipulate binary data in-place.

All constructors to a view conform to the this API shape:

```js
new Float32Array(length);
new Float32Array(typedArray);
new Float32Array(object);
new Float32Array(buffer [, byteOffset [, length]]);
```

\*) All concrete references to `Float32Array` are a placeholder for any of the [ArrayBuffer views][typedarray].

The use-cases for ArrayBuffers on the platform include, but are not limited to, [`WebGLBuffer`][webglbuffer]s and [`ImageData`][imagedata]s.

### `ImageData` Example

[`ImageData`][imagedata] is a `Uint8ClampedArray` representing an image as a one-dimensional array containing the data in the RGBA order, with integer values between 0 and 255.

```js
// ctx is a CanvasRenderingContext2D
const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
// imageData.data is a Uint8ClampedArray containing data in the scheme
// [ r0, g0, b0, a0, r1, g1, b1, a1, ... ]
```

Accessing one color channel at a time is tedious due to the interleaved representation.

### WebGL Example

In the WebGL, vertices can be assigned mutiple sets of data. The obvious ones are 3-dimensional vectors like position, normals or color, but can also be extended to texture IDs and other auxilliary data. Each of these components is called a vertex attribute and is assigned a unique ID. Using this ID you can access the data on a per-vertex basis in shaders.

You could create a buffer for each of these components and upload them with to the GPU with multiple calls. Alternatively (and arguably more commonly), you create one big buffer so you can update all the data at once. To tell WebGL how to interpret a buffer you can use `vertexAttribPointer`, which has a `stride` parameter:

```js
// prettier-ignore
const arrayBuffer = new Float32Array([
   0,  0,  0, // Position for vertex 0
   0,  1,  0, // Normal for vertex 0
   1,  0,  0, // Color for vertex 0

  -1,  0, -1, // Position for vertex 1
   0,  1,  0, // Normal for vertex 1
   0,  1,  0, // Color for vertex 1
  // ...
])
const vbo = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
gl.bufferData(gl.ARRAY_BUFFER, arrayBuffer, gl.STATIC_DRAW);
gl.vertexAttribPointer(
  0, // Vertex Attribute 0 for position
  3, // 3 dimensional
  gl.FLOAT, // Type (could also be gl.BYTE, gl.SHORT, etc)
  false, // Should the GPU normalize the data?
  9 * Float32Array.BYTES_PER_ELEMENT, // Stride
  0 // Offset
);
gl.vertexAttribPointer(
  1, // Vertex Attribute 1 for normals
  3,
  gl.FLOAT,
  false,
  9 * Float32Array.BYTES_PER_ELEMENT,
  3 * Float32Array.BYTES_PER_ELEMENT
);
// ...
```

Manipulating all the vertex attributes for a given vertex is again tedious due to the interleaved data representation.

## Proposed solution

The ArrayBuffer view constructors for creating a view onto an existing buffer already accept `offset` and `length`.

```js
new Float32Array(buffer, byteOffset, length);
```

This allows developers to work on subset of `ArrayBuffer`s with a specific view type.

**The proposal is to add an additional parameter for `stride` to the constructor.**

```js
new Float32Array(buffer[, byteOffset[, length[, stride]]]);
```

The default value and lower bound for `stride` is `1`, and it is expressed as a multiple of elements.

## High-level API

```js
// prettier-ignore
const { buffer } = new Float32Array([
    0, 10, 20,
    1, 11, 21,
    2, 12, 22
]);
const view1 = new Float32Array(
  buffer, // buffer
  0 * Float32Array.BYTES_PER_ELEMENT, // offset
  3, // length
  3 // stride (new!)
);
const view2 = new Float32Array(
  buffer,
  1 * Float32Array.BYTES_PER_ELEMENT,
  3,
  3
);
const view3 = new Float32Array(
  buffer,
  2 * Float32Array.BYTES_PER_ELEMENT,
  3,
  3
);

// view1 == [0, 1, 2];
// view2 == [10, 11, 12];
// view2 == [20, 21, 22];
```

### Feature detection

To detect support for stride, developers can check if an instance of any ArrayBuffer view exposes a `stride` property:

```js
if ("stride" in new Float32Array()) {
  // `stride` is supported
} else {
  // `stride` is not supported
}
```

### Example

As an example, this would allow developers to separately access the individual color channels of a `ImageData` image as continuous arrays:

```js
// ctx is a CanvasRenderingContext2D
const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
const redChannel = new Uint8ClampedArray(
  imageData.data.buffer,
  0 * Uint8ClampedArray.BYTES_PER_ELEMNT,
  imageData.width * imageData.height,
  4
);
// ...
const alphaChannel = new Uint8ClampedArray(
  imageData.data.buffer,
  3 * Uint8ClampedArray.BYTES_PER_ELEMNT,
  imageData.width * imageData.height,
  4
);
```

### FAQ & open questions

#### Is an options object is better than yet another parameter?

I think an options object _is_ preferable, but requires a more invasive change to the spec. The benefit is that it would allow developers to define a `stride` without having to explicitly define an `offset` or a `length`, both of which already have well-defined default values.

For example:

```js
const view1 = new Float32Array(buffer, {
  offset: 0 * Float32Array.BYTES_PER_ELEMENT,
  length: 6,
  stride: 3
});
```

#### Supporting unaligned offsets

Currently TypedArrays are always aligned, as passing a byte offset that results in unaligned access throws. At the cost of expressivity, guaranteeing alignment by construction is advantageous for several reasons:

- Faster performance
- Easier machine code generation
- Easier to use on top of SharedArrayBuffers, especially with Atomics

In light of this, we are not proposing to relax the alignment requirements for integer TypedArrays.

This is perhaps more of an open question for for Float32Array and Float64Array.

## TC39 meeting notes

TBD

## Specification

TBD

## Implementations

### Polyfill

There is _work-in-progress_ polyfill in `polyfill.js` using ES6 Proxies. It is not written with performance in mind but for ease of iteration.

### Browsers

None

[imagedata]: https://developer.mozilla.org/en-US/docs/Web/API/ImageData
[vertexattribpointer]: https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/vertexAttribPointer
[webglbuffer]: https://developer.mozilla.org/en-US/docs/Web/API/WebGLBuffer
[arraybuffer]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer
[typedarray]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray
