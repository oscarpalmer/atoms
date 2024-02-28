// src/js/value.ts
function isArrayOrObject(value) {
  return /^(array|object)$/i.test(value?.constructor?.name);
}

// src/js/proxy.ts
var _createProxy = function(blob, value2) {
  if (!isArrayOrObject(value2) || _isProxy(value2)) {
    return value2;
  }
  const isArray = Array.isArray(value2);
  const proxyBlob = blob ?? new ProxyBlob;
  const proxyValue = new Proxy(isArray ? [] : {}, {});
  Object.defineProperty(proxyValue, "$", {
    value: proxyBlob
  });
  const keys = Object.keys(value2);
  const size = keys.length ?? 0;
  let index = 0;
  for (;index < size; index += 1) {
    const key = keys[index];
    proxyValue[key] = _createProxy(proxyBlob, value2[key]);
  }
  return proxyValue;
};
var _isProxy = function(value2) {
  return value2?.$ instanceof ProxyBlob;
};
function proxy(value2) {
  if (!isArrayOrObject(value2)) {
    throw new Error("Proxy value must be an array or object");
  }
  return _createProxy(undefined, value2);
}

class ProxyBlob {
}
export {
  proxy
};
