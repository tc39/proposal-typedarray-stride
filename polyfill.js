// Polyfill globalThis
(function () {
  if (typeof globalThis === "object") return;
  Object.prototype.__defineGetter__("__magic__", function () {
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
    return new globalThis[name + "Array"](maybeBuffer, ...params);
  }
  const BYTES_PER_ELEMENT = globalThis[name + "Array"].BYTES_PER_ELEMENT;
  let [offset = 0, length, stride] = params;
  // Without a stride parameter, we don’t need to polyfill anything
  if (!stride) {
    return new globalThis[name + "Array"](maybeBuffer, ...params);
  }
  const view = new DataView(maybeBuffer, offset);
  // const view = new globalThis[name+"Array"](maybeBuffer, offset);
  return new Proxy(view, {
    get(_target, propKey, receiver) {
      // If it’s a number, a cell is accessed and we need to implement the stride
      // magic.
      if (!betterIsNaN(propKey)) {
        const index = parseInt(propKey);
        return view["get" + name](index * stride * BYTES_PER_ELEMENT, true);
      }
      switch (propKey) {
        case "stride":
          return stride;
        case "byteLength":
          return (
            Math.floor(view.byteLength / (stride * BYTES_PER_ELEMENT)) *
            BYTES_PER_ELEMENT
          );
        case "length":
          return Math.floor(view.byteLength / (stride * BYTES_PER_ELEMENT));
        case "slice":
          {
            const newArr = new globalThis[name + "Array"]([...receiver]);
            return newArr.slice.bind(newArr);
          }
        case "set":
          return (arr, offset = 0) => {
            for (let i = 0; i + offset < receiver.length && i < arr.length; i++) {
              receiver[i + offset] = arr[i];
            }
          }
        case "map":
          {
            const newArr = receiver.slice();
            return newArr.map.bind(newArr);
          }
        case "filter":
          {
            const newArr = receiver.slice();
            return newArr.filter.bind(newArr);
          }
        case Symbol.iterator:
          return function* () {
            for (let i = 0; i < receiver.length; i++) {
              yield receiver[i];
            }
          };
        case Symbol.asyncIterator:
          return async function* () {
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
    },
    set(_target, propKey, value, receiver) {
      // If it’s a number, a cell is accessed and we need to implement the stride
      // magic.
      if (!betterIsNaN(propKey)) {
        const index = parseInt(propKey);
        view["set" + name](index * stride * BYTES_PER_ELEMENT, value, true);
      }
      // Ignore the rest for now
      return true;
    }
  });
}

export function Int8Array(...params) {
  return polyfilledArrayView("Int8", ...params);
}
export function Uint8Array(...params) {
  return polyfilledArrayView("Uint8", ...params);
}
export function Uint8ClampedArray(...params) {
  return polyfilledArrayView("Uint8Clamped", ...params);
}
export function Int16Array(...params) {
  return polyfilledArrayView("Int16", ...params);
}
export function Uint16Array(...params) {
  return polyfilledArrayView("Uint16", ...params);
}
export function Int32Array(...params) {
  return polyfilledArrayView("Int32", ...params);
}
export function Uint32Array(...params) {
  return polyfilledArrayView("Uint32", ...params);
}
export function Float32Array(...params) {
  return polyfilledArrayView("Float32", ...params);
}
export function Float64Array(...params) {
  return polyfilledArrayView("Float64", ...params);
}
export function BigInt64Array(...params) {
  return polyfilledArrayView("BigInt64", ...params);
}
export function BigUint64Array(...params) {
  return polyfilledArrayView("BigUint64", ...params);
}
