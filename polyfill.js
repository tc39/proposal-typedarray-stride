// Polyfill globalThis
(function() {
  if (typeof globalThis === "object") return;
  Object.prototype.__defineGetter__("__magic__", function() {
    return this;
  });
  __magic__.globalThis = __magic__; // lolwat
  delete Object.prototype.__magic__;
})();

// Like `isNaN` but returns `true` for symbols.
function betterIsNaN(s) {
  if (typeof s === "symbol") {
    return true;
  }
  return isNaN(s);
}

function polyfilledArrayView(name, maybeBuffer, ...params) {
  if (!(maybeBuffer instanceof ArrayBuffer)) {
    return new globalThis[name](maybeBuffer, ...params);
  }
  const BYTES_PER_ELEMENT = globalThis[name].BYTES_PER_ELEMENT;
  let [offset = 0, length, stride] = params;
  // Without a stride parameter, we don’t need to polyfill anything
  if (!stride) {
    return new globalThis[name](maybeBuffer, ...params);
  }
  const view = new globalThis[name](maybeBuffer, offset);
  return new Proxy(view, {
    get(_target, propKey, receiver) {
      // If it’s a number, a cell is accessed and we need to implement the stride
      // magic.
      if (!betterIsNaN(propKey)) {
        const index = parseInt(propKey);
        return new globalThis[name](maybeBuffer, offset + index * stride, 1)[0];
      }
      switch (propKey) {
        case "stride":
          return stride;
        case "byteLength":
          return Math.floor(view.byteLength / stride) * BYTES_PER_ELEMENT;
        case "length":
          return Math.floor(view.byteLength / stride);
        case Symbol.iterator:
          return function*() {
            for (let i = 0; i < receiver.length; i++) {
              yield receiver[i];
            }
          };
        // Pass through all the other stuff
        default:
          const prop = view[propKey];
          if (typeof prop === "function") {
            return prop.bind(view);
          }
          return prop;
      }
    }
  });
}

export function Int8Array(...params) {
  return polyfilledArrayView("Int8Array", ...params);
}
export function Uint8Array(...params) {
  return polyfilledArrayView("Uint8Array", ...params);
}
export function Uint8ClampedArray(...params) {
  return polyfilledArrayView("Uint8ClampedArray", ...params);
}
export function Int16Array(...params) {
  return polyfilledArrayView("Int16Array", ...params);
}
export function Uint16Array(...params) {
  return polyfilledArrayView("Uint16Array", ...params);
}
export function Int32Array(...params) {
  return polyfilledArrayView("Int32Array", ...params);
}
export function Uint32Array(...params) {
  return polyfilledArrayView("Uint32Array", ...params);
}
export function Float32Array(...params) {
  return polyfilledArrayView("Float32Array", ...params);
}
export function Float64Array(...params) {
  return polyfilledArrayView("Float64Array", ...params);
}
export function BigInt64Array(...params) {
  return polyfilledArrayView("BigInt64Array", ...params);
}
export function BigUint64Array(...params) {
  return polyfilledArrayView("BigUint64Array", ...params);
}
