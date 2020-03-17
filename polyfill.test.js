import { Int8Array, Float32Array } from "./polyfill.js";

describe("ArrayBufferView-Stride-Polyfill w/ Int8Array", function() {
  it("exists", function() {
    expect(Int8Array).to.be.a("function");
  });

  it("behaves like a normal ArrayBuffer view for creating new buffers", function() {
    const view = new Int8Array([0, 1, 2, 3]);
    expect([...view]).to.deep.equal([0, 1, 2, 3]);
    expect(view.length).to.equal(4);
    expect(view.byteLength).to.equal(4);
  });

  it("behaves like a normal ArrayBuffer view for creating new views on existing buffers", function() {
    const buffer = new Int8Array([0, 1, 2, 3, 4, 5, 6, 7]).buffer;
    let view;
    view = new Int8Array(buffer);
    expect(view.length).to.equal(8);
    expect(view.byteLength).to.equal(8);
    expect([...view]).to.deep.equal([0, 1, 2, 3, 4, 5, 6, 7]);
    view = new Int8Array(buffer, 4);
    expect(view.length).to.equal(4);
    expect(view.byteLength).to.equal(4);
    expect([...view]).to.deep.equal([4, 5, 6, 7]);
    view = new Int8Array(buffer, 2, 3);
    expect(view.length).to.equal(3);
    expect(view.byteLength).to.equal(3);
    expect([...view]).to.deep.equal([2, 3, 4]);
  });

  it("can create views with a stride", function() {
    const buffer = new Int8Array([0, 0, 1, 1, 2, 2, 3, 3]).buffer;
    const view = new Int8Array(buffer, 0, 4, 2);
    expect(view.length).to.equal(4);
    expect(view.byteLength).to.equal(4);
    expect(view[0]).to.equal(0);
    expect(view[1]).to.equal(1);
    expect(view[2]).to.equal(2);
    expect(view[3]).to.equal(3);
    expect(view.stride).to.equal(2);
  });

  it("can handle iterators", function() {
    const buffer = new Int8Array([0, 0, 1, 1, 2, 2, 3, 3]).buffer;
    const view = new Int8Array(buffer, 0, 4, 2);
    expect(view.length).to.equal(4);
    expect(view.byteLength).to.equal(4);
    expect([...view]).to.deep.equal([0, 1, 2, 3]);
  });
});

describe("ArrayBufferView-Stride-Polyfill w/ Float32Array", function() {
  it("can create views with a stride", function() {
    const buffer = new Float32Array([0, 0, 1, 1, 2, 2, 3, 3]).buffer;
    const view = new Float32Array(buffer, 0, 4, 2);
    expect(view.length).to.equal(4);
    expect(view.byteLength).to.equal(16);
    expect(view[0]).to.equal(0);
    expect(view[1]).to.equal(1);
    expect(view[2]).to.equal(2);
    expect(view[3]).to.equal(3);
  });

  it("can handle iterators", function() {
    const buffer = new Float32Array([0, 0, 1, 1, 2, 2, 3, 3]).buffer;
    const view = new Float32Array(buffer, 0, 4, 2);
    expect(view.length).to.equal(4);
    expect(view.byteLength).to.equal(16);
    expect(view.buffer.byteLength).to.equal(32);
    expect([...view]).to.deep.equal([0, 1, 2, 3]);
  });

  it("can handle slice for copying", function() {
    const buffer = new Float32Array([0, 0, 1, 1, 2, 2, 3, 3]).buffer;
    const view = new Float32Array(buffer, 0, 4, 2).slice();
    expect(view.length).to.equal(4);
    expect(view.byteLength).to.equal(16);
    expect(view.buffer).to.not.equal(buffer);
    expect(view.buffer.byteLength).to.equal(16);
    expect([...view]).to.deep.equal([0, 1, 2, 3]);
  });

  it("can handle slice for slicing", function() {
    const buffer = new Float32Array([0, 0, 1, 1, 2, 2, 3, 3]).buffer;
    const view = new Float32Array(buffer, 0, 4, 2).slice(1, -1);
    expect(view.length).to.equal(2);
    expect(view.byteLength).to.equal(8);
    expect(view.buffer).to.not.equal(buffer);
    expect(view.buffer.byteLength).to.equal(8);
    expect([...view]).to.deep.equal([1, 2]);
  });
});
