(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('d3-array'), require('d3-shape'), require('d3-collection')) :
  typeof define === 'function' && define.amd ? define(['exports', 'd3-array', 'd3-shape', 'd3-collection'], factory) :
  (factory((global.sankeyCircular = {}),global.d3,global.d3,global.d3));
}(this, (function (exports,d3Array,d3Shape,d3Collection) { 'use strict';

  /**
   * Removes all key-value entries from the list cache.
   *
   * @private
   * @name clear
   * @memberOf ListCache
   */
  function listCacheClear() {
    this.__data__ = [];
    this.size = 0;
  }

  var _listCacheClear = listCacheClear;

  /**
   * Performs a
   * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
   * comparison between two values to determine if they are equivalent.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to compare.
   * @param {*} other The other value to compare.
   * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
   * @example
   *
   * var object = { 'a': 1 };
   * var other = { 'a': 1 };
   *
   * _.eq(object, object);
   * // => true
   *
   * _.eq(object, other);
   * // => false
   *
   * _.eq('a', 'a');
   * // => true
   *
   * _.eq('a', Object('a'));
   * // => false
   *
   * _.eq(NaN, NaN);
   * // => true
   */
  function eq(value, other) {
    return value === other || value !== value && other !== other;
  }

  var eq_1 = eq;

  /**
   * Gets the index at which the `key` is found in `array` of key-value pairs.
   *
   * @private
   * @param {Array} array The array to inspect.
   * @param {*} key The key to search for.
   * @returns {number} Returns the index of the matched value, else `-1`.
   */
  function assocIndexOf(array, key) {
    var length = array.length;
    while (length--) {
      if (eq_1(array[length][0], key)) {
        return length;
      }
    }
    return -1;
  }

  var _assocIndexOf = assocIndexOf;

  /** Used for built-in method references. */
  var arrayProto = Array.prototype;

  /** Built-in value references. */
  var splice = arrayProto.splice;

  /**
   * Removes `key` and its value from the list cache.
   *
   * @private
   * @name delete
   * @memberOf ListCache
   * @param {string} key The key of the value to remove.
   * @returns {boolean} Returns `true` if the entry was removed, else `false`.
   */
  function listCacheDelete(key) {
    var data = this.__data__,
        index = _assocIndexOf(data, key);

    if (index < 0) {
      return false;
    }
    var lastIndex = data.length - 1;
    if (index == lastIndex) {
      data.pop();
    } else {
      splice.call(data, index, 1);
    }
    --this.size;
    return true;
  }

  var _listCacheDelete = listCacheDelete;

  /**
   * Gets the list cache value for `key`.
   *
   * @private
   * @name get
   * @memberOf ListCache
   * @param {string} key The key of the value to get.
   * @returns {*} Returns the entry value.
   */
  function listCacheGet(key) {
    var data = this.__data__,
        index = _assocIndexOf(data, key);

    return index < 0 ? undefined : data[index][1];
  }

  var _listCacheGet = listCacheGet;

  /**
   * Checks if a list cache value for `key` exists.
   *
   * @private
   * @name has
   * @memberOf ListCache
   * @param {string} key The key of the entry to check.
   * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
   */
  function listCacheHas(key) {
    return _assocIndexOf(this.__data__, key) > -1;
  }

  var _listCacheHas = listCacheHas;

  /**
   * Sets the list cache `key` to `value`.
   *
   * @private
   * @name set
   * @memberOf ListCache
   * @param {string} key The key of the value to set.
   * @param {*} value The value to set.
   * @returns {Object} Returns the list cache instance.
   */
  function listCacheSet(key, value) {
    var data = this.__data__,
        index = _assocIndexOf(data, key);

    if (index < 0) {
      ++this.size;
      data.push([key, value]);
    } else {
      data[index][1] = value;
    }
    return this;
  }

  var _listCacheSet = listCacheSet;

  /**
   * Creates an list cache object.
   *
   * @private
   * @constructor
   * @param {Array} [entries] The key-value pairs to cache.
   */
  function ListCache(entries) {
    var index = -1,
        length = entries == null ? 0 : entries.length;

    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }

  // Add methods to `ListCache`.
  ListCache.prototype.clear = _listCacheClear;
  ListCache.prototype['delete'] = _listCacheDelete;
  ListCache.prototype.get = _listCacheGet;
  ListCache.prototype.has = _listCacheHas;
  ListCache.prototype.set = _listCacheSet;

  var _ListCache = ListCache;

  /**
   * Removes all key-value entries from the stack.
   *
   * @private
   * @name clear
   * @memberOf Stack
   */
  function stackClear() {
    this.__data__ = new _ListCache();
    this.size = 0;
  }

  var _stackClear = stackClear;

  /**
   * Removes `key` and its value from the stack.
   *
   * @private
   * @name delete
   * @memberOf Stack
   * @param {string} key The key of the value to remove.
   * @returns {boolean} Returns `true` if the entry was removed, else `false`.
   */
  function stackDelete(key) {
    var data = this.__data__,
        result = data['delete'](key);

    this.size = data.size;
    return result;
  }

  var _stackDelete = stackDelete;

  /**
   * Gets the stack value for `key`.
   *
   * @private
   * @name get
   * @memberOf Stack
   * @param {string} key The key of the value to get.
   * @returns {*} Returns the entry value.
   */
  function stackGet(key) {
    return this.__data__.get(key);
  }

  var _stackGet = stackGet;

  /**
   * Checks if a stack value for `key` exists.
   *
   * @private
   * @name has
   * @memberOf Stack
   * @param {string} key The key of the entry to check.
   * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
   */
  function stackHas(key) {
    return this.__data__.has(key);
  }

  var _stackHas = stackHas;

  var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  };

  /** Detect free variable `global` from Node.js. */
  var freeGlobal = _typeof(commonjsGlobal) == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

  var _freeGlobal = freeGlobal;

  /** Detect free variable `self`. */
  var freeSelf = (typeof self === 'undefined' ? 'undefined' : _typeof(self)) == 'object' && self && self.Object === Object && self;

  /** Used as a reference to the global object. */
  var root = _freeGlobal || freeSelf || Function('return this')();

  var _root = root;

  /** Built-in value references. */
  var _Symbol2 = _root.Symbol;

  var _Symbol = _Symbol2;

  /** Used for built-in method references. */
  var objectProto = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty = objectProto.hasOwnProperty;

  /**
   * Used to resolve the
   * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
   * of values.
   */
  var nativeObjectToString = objectProto.toString;

  /** Built-in value references. */
  var symToStringTag = _Symbol ? _Symbol.toStringTag : undefined;

  /**
   * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
   *
   * @private
   * @param {*} value The value to query.
   * @returns {string} Returns the raw `toStringTag`.
   */
  function getRawTag(value) {
    var isOwn = hasOwnProperty.call(value, symToStringTag),
        tag = value[symToStringTag];

    try {
      value[symToStringTag] = undefined;
    } catch (e) {}

    var result = nativeObjectToString.call(value);
    {
      if (isOwn) {
        value[symToStringTag] = tag;
      } else {
        delete value[symToStringTag];
      }
    }
    return result;
  }

  var _getRawTag = getRawTag;

  /** Used for built-in method references. */
  var objectProto$1 = Object.prototype;

  /**
   * Used to resolve the
   * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
   * of values.
   */
  var nativeObjectToString$1 = objectProto$1.toString;

  /**
   * Converts `value` to a string using `Object.prototype.toString`.
   *
   * @private
   * @param {*} value The value to convert.
   * @returns {string} Returns the converted string.
   */
  function objectToString(value) {
    return nativeObjectToString$1.call(value);
  }

  var _objectToString = objectToString;

  /** `Object#toString` result references. */
  var nullTag = '[object Null]',
      undefinedTag = '[object Undefined]';

  /** Built-in value references. */
  var symToStringTag$1 = _Symbol ? _Symbol.toStringTag : undefined;

  /**
   * The base implementation of `getTag` without fallbacks for buggy environments.
   *
   * @private
   * @param {*} value The value to query.
   * @returns {string} Returns the `toStringTag`.
   */
  function baseGetTag(value) {
    if (value == null) {
      return value === undefined ? undefinedTag : nullTag;
    }
    return symToStringTag$1 && symToStringTag$1 in Object(value) ? _getRawTag(value) : _objectToString(value);
  }

  var _baseGetTag = baseGetTag;

  /**
   * Checks if `value` is the
   * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
   * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an object, else `false`.
   * @example
   *
   * _.isObject({});
   * // => true
   *
   * _.isObject([1, 2, 3]);
   * // => true
   *
   * _.isObject(_.noop);
   * // => true
   *
   * _.isObject(null);
   * // => false
   */
  function isObject(value) {
    var type = typeof value === 'undefined' ? 'undefined' : _typeof(value);
    return value != null && (type == 'object' || type == 'function');
  }

  var isObject_1 = isObject;

  /** `Object#toString` result references. */
  var asyncTag = '[object AsyncFunction]',
      funcTag = '[object Function]',
      genTag = '[object GeneratorFunction]',
      proxyTag = '[object Proxy]';

  /**
   * Checks if `value` is classified as a `Function` object.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a function, else `false`.
   * @example
   *
   * _.isFunction(_);
   * // => true
   *
   * _.isFunction(/abc/);
   * // => false
   */
  function isFunction(value) {
    if (!isObject_1(value)) {
      return false;
    }
    // The use of `Object#toString` avoids issues with the `typeof` operator
    // in Safari 9 which returns 'object' for typed arrays and other constructors.
    var tag = _baseGetTag(value);
    return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
  }

  var isFunction_1 = isFunction;

  /** Used to detect overreaching core-js shims. */
  var coreJsData = _root['__core-js_shared__'];

  var _coreJsData = coreJsData;

  /** Used to detect methods masquerading as native. */
  var maskSrcKey = function () {
    var uid = /[^.]+$/.exec(_coreJsData && _coreJsData.keys && _coreJsData.keys.IE_PROTO || '');
    return uid ? 'Symbol(src)_1.' + uid : '';
  }();

  /**
   * Checks if `func` has its source masked.
   *
   * @private
   * @param {Function} func The function to check.
   * @returns {boolean} Returns `true` if `func` is masked, else `false`.
   */
  function isMasked(func) {
    return !!maskSrcKey && maskSrcKey in func;
  }

  var _isMasked = isMasked;

  /** Used for built-in method references. */
  var funcProto = Function.prototype;

  /** Used to resolve the decompiled source of functions. */
  var funcToString = funcProto.toString;

  /**
   * Converts `func` to its source code.
   *
   * @private
   * @param {Function} func The function to convert.
   * @returns {string} Returns the source code.
   */
  function toSource(func) {
    if (func != null) {
      try {
        return funcToString.call(func);
      } catch (e) {}
      try {
        return func + '';
      } catch (e) {}
    }
    return '';
  }

  var _toSource = toSource;

  /**
   * Used to match `RegExp`
   * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
   */
  var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

  /** Used to detect host constructors (Safari). */
  var reIsHostCtor = /^\[object .+?Constructor\]$/;

  /** Used for built-in method references. */
  var funcProto$1 = Function.prototype,
      objectProto$2 = Object.prototype;

  /** Used to resolve the decompiled source of functions. */
  var funcToString$1 = funcProto$1.toString;

  /** Used to check objects for own properties. */
  var hasOwnProperty$1 = objectProto$2.hasOwnProperty;

  /** Used to detect if a method is native. */
  var reIsNative = RegExp('^' + funcToString$1.call(hasOwnProperty$1).replace(reRegExpChar, '\\$&').replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$');

  /**
   * The base implementation of `_.isNative` without bad shim checks.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a native function,
   *  else `false`.
   */
  function baseIsNative(value) {
    if (!isObject_1(value) || _isMasked(value)) {
      return false;
    }
    var pattern = isFunction_1(value) ? reIsNative : reIsHostCtor;
    return pattern.test(_toSource(value));
  }

  var _baseIsNative = baseIsNative;

  /**
   * Gets the value at `key` of `object`.
   *
   * @private
   * @param {Object} [object] The object to query.
   * @param {string} key The key of the property to get.
   * @returns {*} Returns the property value.
   */
  function getValue(object, key) {
    return object == null ? undefined : object[key];
  }

  var _getValue = getValue;

  /**
   * Gets the native function at `key` of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @param {string} key The key of the method to get.
   * @returns {*} Returns the function if it's native, else `undefined`.
   */
  function getNative(object, key) {
    var value = _getValue(object, key);
    return _baseIsNative(value) ? value : undefined;
  }

  var _getNative = getNative;

  /* Built-in method references that are verified to be native. */
  var Map = _getNative(_root, 'Map');

  var _Map = Map;

  /* Built-in method references that are verified to be native. */
  var nativeCreate = _getNative(Object, 'create');

  var _nativeCreate = nativeCreate;

  /**
   * Removes all key-value entries from the hash.
   *
   * @private
   * @name clear
   * @memberOf Hash
   */
  function hashClear() {
    this.__data__ = _nativeCreate ? _nativeCreate(null) : {};
    this.size = 0;
  }

  var _hashClear = hashClear;

  /**
   * Removes `key` and its value from the hash.
   *
   * @private
   * @name delete
   * @memberOf Hash
   * @param {Object} hash The hash to modify.
   * @param {string} key The key of the value to remove.
   * @returns {boolean} Returns `true` if the entry was removed, else `false`.
   */
  function hashDelete(key) {
    var result = this.has(key) && delete this.__data__[key];
    this.size -= result ? 1 : 0;
    return result;
  }

  var _hashDelete = hashDelete;

  /** Used to stand-in for `undefined` hash values. */
  var HASH_UNDEFINED = '__lodash_hash_undefined__';

  /** Used for built-in method references. */
  var objectProto$3 = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$2 = objectProto$3.hasOwnProperty;

  /**
   * Gets the hash value for `key`.
   *
   * @private
   * @name get
   * @memberOf Hash
   * @param {string} key The key of the value to get.
   * @returns {*} Returns the entry value.
   */
  function hashGet(key) {
    var data = this.__data__;
    if (_nativeCreate) {
      var result = data[key];
      return result === HASH_UNDEFINED ? undefined : result;
    }
    return hasOwnProperty$2.call(data, key) ? data[key] : undefined;
  }

  var _hashGet = hashGet;

  /** Used for built-in method references. */
  var objectProto$4 = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$3 = objectProto$4.hasOwnProperty;

  /**
   * Checks if a hash value for `key` exists.
   *
   * @private
   * @name has
   * @memberOf Hash
   * @param {string} key The key of the entry to check.
   * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
   */
  function hashHas(key) {
    var data = this.__data__;
    return _nativeCreate ? data[key] !== undefined : hasOwnProperty$3.call(data, key);
  }

  var _hashHas = hashHas;

  /** Used to stand-in for `undefined` hash values. */
  var HASH_UNDEFINED$1 = '__lodash_hash_undefined__';

  /**
   * Sets the hash `key` to `value`.
   *
   * @private
   * @name set
   * @memberOf Hash
   * @param {string} key The key of the value to set.
   * @param {*} value The value to set.
   * @returns {Object} Returns the hash instance.
   */
  function hashSet(key, value) {
    var data = this.__data__;
    this.size += this.has(key) ? 0 : 1;
    data[key] = _nativeCreate && value === undefined ? HASH_UNDEFINED$1 : value;
    return this;
  }

  var _hashSet = hashSet;

  /**
   * Creates a hash object.
   *
   * @private
   * @constructor
   * @param {Array} [entries] The key-value pairs to cache.
   */
  function Hash(entries) {
    var index = -1,
        length = entries == null ? 0 : entries.length;

    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }

  // Add methods to `Hash`.
  Hash.prototype.clear = _hashClear;
  Hash.prototype['delete'] = _hashDelete;
  Hash.prototype.get = _hashGet;
  Hash.prototype.has = _hashHas;
  Hash.prototype.set = _hashSet;

  var _Hash = Hash;

  /**
   * Removes all key-value entries from the map.
   *
   * @private
   * @name clear
   * @memberOf MapCache
   */
  function mapCacheClear() {
    this.size = 0;
    this.__data__ = {
      'hash': new _Hash(),
      'map': new (_Map || _ListCache)(),
      'string': new _Hash()
    };
  }

  var _mapCacheClear = mapCacheClear;

  /**
   * Checks if `value` is suitable for use as unique object key.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
   */
  function isKeyable(value) {
    var type = typeof value === 'undefined' ? 'undefined' : _typeof(value);
    return type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean' ? value !== '__proto__' : value === null;
  }

  var _isKeyable = isKeyable;

  /**
   * Gets the data for `map`.
   *
   * @private
   * @param {Object} map The map to query.
   * @param {string} key The reference key.
   * @returns {*} Returns the map data.
   */
  function getMapData(map, key) {
    var data = map.__data__;
    return _isKeyable(key) ? data[typeof key == 'string' ? 'string' : 'hash'] : data.map;
  }

  var _getMapData = getMapData;

  /**
   * Removes `key` and its value from the map.
   *
   * @private
   * @name delete
   * @memberOf MapCache
   * @param {string} key The key of the value to remove.
   * @returns {boolean} Returns `true` if the entry was removed, else `false`.
   */
  function mapCacheDelete(key) {
    var result = _getMapData(this, key)['delete'](key);
    this.size -= result ? 1 : 0;
    return result;
  }

  var _mapCacheDelete = mapCacheDelete;

  /**
   * Gets the map value for `key`.
   *
   * @private
   * @name get
   * @memberOf MapCache
   * @param {string} key The key of the value to get.
   * @returns {*} Returns the entry value.
   */
  function mapCacheGet(key) {
    return _getMapData(this, key).get(key);
  }

  var _mapCacheGet = mapCacheGet;

  /**
   * Checks if a map value for `key` exists.
   *
   * @private
   * @name has
   * @memberOf MapCache
   * @param {string} key The key of the entry to check.
   * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
   */
  function mapCacheHas(key) {
    return _getMapData(this, key).has(key);
  }

  var _mapCacheHas = mapCacheHas;

  /**
   * Sets the map `key` to `value`.
   *
   * @private
   * @name set
   * @memberOf MapCache
   * @param {string} key The key of the value to set.
   * @param {*} value The value to set.
   * @returns {Object} Returns the map cache instance.
   */
  function mapCacheSet(key, value) {
    var data = _getMapData(this, key),
        size = data.size;

    data.set(key, value);
    this.size += data.size == size ? 0 : 1;
    return this;
  }

  var _mapCacheSet = mapCacheSet;

  /**
   * Creates a map cache object to store key-value pairs.
   *
   * @private
   * @constructor
   * @param {Array} [entries] The key-value pairs to cache.
   */
  function MapCache(entries) {
    var index = -1,
        length = entries == null ? 0 : entries.length;

    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }

  // Add methods to `MapCache`.
  MapCache.prototype.clear = _mapCacheClear;
  MapCache.prototype['delete'] = _mapCacheDelete;
  MapCache.prototype.get = _mapCacheGet;
  MapCache.prototype.has = _mapCacheHas;
  MapCache.prototype.set = _mapCacheSet;

  var _MapCache = MapCache;

  /** Used as the size to enable large array optimizations. */
  var LARGE_ARRAY_SIZE = 200;

  /**
   * Sets the stack `key` to `value`.
   *
   * @private
   * @name set
   * @memberOf Stack
   * @param {string} key The key of the value to set.
   * @param {*} value The value to set.
   * @returns {Object} Returns the stack cache instance.
   */
  function stackSet(key, value) {
    var data = this.__data__;
    if (data instanceof _ListCache) {
      var pairs = data.__data__;
      if (!_Map || pairs.length < LARGE_ARRAY_SIZE - 1) {
        pairs.push([key, value]);
        this.size = ++data.size;
        return this;
      }
      data = this.__data__ = new _MapCache(pairs);
    }
    data.set(key, value);
    this.size = data.size;
    return this;
  }

  var _stackSet = stackSet;

  /**
   * Creates a stack cache object to store key-value pairs.
   *
   * @private
   * @constructor
   * @param {Array} [entries] The key-value pairs to cache.
   */
  function Stack(entries) {
    var data = this.__data__ = new _ListCache(entries);
    this.size = data.size;
  }

  // Add methods to `Stack`.
  Stack.prototype.clear = _stackClear;
  Stack.prototype['delete'] = _stackDelete;
  Stack.prototype.get = _stackGet;
  Stack.prototype.has = _stackHas;
  Stack.prototype.set = _stackSet;

  var _Stack = Stack;

  /**
   * A specialized version of `_.forEach` for arrays without support for
   * iteratee shorthands.
   *
   * @private
   * @param {Array} [array] The array to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {Array} Returns `array`.
   */
  function arrayEach(array, iteratee) {
    var index = -1,
        length = array == null ? 0 : array.length;

    while (++index < length) {
      if (iteratee(array[index], index, array) === false) {
        break;
      }
    }
    return array;
  }

  var _arrayEach = arrayEach;

  var defineProperty$1 = function () {
    try {
      var func = _getNative(Object, 'defineProperty');
      func({}, '', {});
      return func;
    } catch (e) {}
  }();

  var _defineProperty = defineProperty$1;

  /**
   * The base implementation of `assignValue` and `assignMergeValue` without
   * value checks.
   *
   * @private
   * @param {Object} object The object to modify.
   * @param {string} key The key of the property to assign.
   * @param {*} value The value to assign.
   */
  function baseAssignValue(object, key, value) {
    if (key == '__proto__' && _defineProperty) {
      _defineProperty(object, key, {
        'configurable': true,
        'enumerable': true,
        'value': value,
        'writable': true
      });
    } else {
      object[key] = value;
    }
  }

  var _baseAssignValue = baseAssignValue;

  /** Used for built-in method references. */
  var objectProto$5 = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$4 = objectProto$5.hasOwnProperty;

  /**
   * Assigns `value` to `key` of `object` if the existing value is not equivalent
   * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
   * for equality comparisons.
   *
   * @private
   * @param {Object} object The object to modify.
   * @param {string} key The key of the property to assign.
   * @param {*} value The value to assign.
   */
  function assignValue(object, key, value) {
    var objValue = object[key];
    if (!(hasOwnProperty$4.call(object, key) && eq_1(objValue, value)) || value === undefined && !(key in object)) {
      _baseAssignValue(object, key, value);
    }
  }

  var _assignValue = assignValue;

  /**
   * Copies properties of `source` to `object`.
   *
   * @private
   * @param {Object} source The object to copy properties from.
   * @param {Array} props The property identifiers to copy.
   * @param {Object} [object={}] The object to copy properties to.
   * @param {Function} [customizer] The function to customize copied values.
   * @returns {Object} Returns `object`.
   */
  function copyObject(source, props, object, customizer) {
    var isNew = !object;
    object || (object = {});

    var index = -1,
        length = props.length;

    while (++index < length) {
      var key = props[index];

      var newValue = customizer ? customizer(object[key], source[key], key, object, source) : undefined;

      if (newValue === undefined) {
        newValue = source[key];
      }
      if (isNew) {
        _baseAssignValue(object, key, newValue);
      } else {
        _assignValue(object, key, newValue);
      }
    }
    return object;
  }

  var _copyObject = copyObject;

  /**
   * The base implementation of `_.times` without support for iteratee shorthands
   * or max array length checks.
   *
   * @private
   * @param {number} n The number of times to invoke `iteratee`.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {Array} Returns the array of results.
   */
  function baseTimes(n, iteratee) {
    var index = -1,
        result = Array(n);

    while (++index < n) {
      result[index] = iteratee(index);
    }
    return result;
  }

  var _baseTimes = baseTimes;

  /**
   * Checks if `value` is object-like. A value is object-like if it's not `null`
   * and has a `typeof` result of "object".
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
   * @example
   *
   * _.isObjectLike({});
   * // => true
   *
   * _.isObjectLike([1, 2, 3]);
   * // => true
   *
   * _.isObjectLike(_.noop);
   * // => false
   *
   * _.isObjectLike(null);
   * // => false
   */
  function isObjectLike(value) {
    return value != null && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) == 'object';
  }

  var isObjectLike_1 = isObjectLike;

  /** `Object#toString` result references. */
  var argsTag = '[object Arguments]';

  /**
   * The base implementation of `_.isArguments`.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an `arguments` object,
   */
  function baseIsArguments(value) {
    return isObjectLike_1(value) && _baseGetTag(value) == argsTag;
  }

  var _baseIsArguments = baseIsArguments;

  /** Used for built-in method references. */
  var objectProto$6 = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$5 = objectProto$6.hasOwnProperty;

  /** Built-in value references. */
  var propertyIsEnumerable = objectProto$6.propertyIsEnumerable;

  /**
   * Checks if `value` is likely an `arguments` object.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an `arguments` object,
   *  else `false`.
   * @example
   *
   * _.isArguments(function() { return arguments; }());
   * // => true
   *
   * _.isArguments([1, 2, 3]);
   * // => false
   */
  var isArguments = _baseIsArguments(function () {
    return arguments;
  }()) ? _baseIsArguments : function (value) {
    return isObjectLike_1(value) && hasOwnProperty$5.call(value, 'callee') && !propertyIsEnumerable.call(value, 'callee');
  };

  var isArguments_1 = isArguments;

  /**
   * Checks if `value` is classified as an `Array` object.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an array, else `false`.
   * @example
   *
   * _.isArray([1, 2, 3]);
   * // => true
   *
   * _.isArray(document.body.children);
   * // => false
   *
   * _.isArray('abc');
   * // => false
   *
   * _.isArray(_.noop);
   * // => false
   */
  var isArray = Array.isArray;

  var isArray_1 = isArray;

  /**
   * This method returns `false`.
   *
   * @static
   * @memberOf _
   * @since 4.13.0
   * @category Util
   * @returns {boolean} Returns `false`.
   * @example
   *
   * _.times(2, _.stubFalse);
   * // => [false, false]
   */
  function stubFalse() {
    return false;
  }

  var stubFalse_1 = stubFalse;

  var isBuffer_1 = createCommonjsModule(function (module, exports) {
    /** Detect free variable `exports`. */
    var freeExports = exports && !exports.nodeType && exports;

    /** Detect free variable `module`. */
    var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

    /** Detect the popular CommonJS extension `module.exports`. */
    var moduleExports = freeModule && freeModule.exports === freeExports;

    /** Built-in value references. */
    var Buffer = moduleExports ? _root.Buffer : undefined;

    /* Built-in method references for those with the same name as other `lodash` methods. */
    var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;

    /**
     * Checks if `value` is a buffer.
     *
     * @static
     * @memberOf _
     * @since 4.3.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
     * @example
     *
     * _.isBuffer(new Buffer(2));
     * // => true
     *
     * _.isBuffer(new Uint8Array(2));
     * // => false
     */
    var isBuffer = nativeIsBuffer || stubFalse_1;

    module.exports = isBuffer;
  });

  /** Used as references for various `Number` constants. */
  var MAX_SAFE_INTEGER = 9007199254740991;

  /** Used to detect unsigned integer values. */
  var reIsUint = /^(?:0|[1-9]\d*)$/;

  /**
   * Checks if `value` is a valid array-like index.
   *
   * @private
   * @param {*} value The value to check.
   * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
   * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
   */
  function isIndex(value, length) {
    length = length == null ? MAX_SAFE_INTEGER : length;
    return !!length && (typeof value == 'number' || reIsUint.test(value)) && value > -1 && value % 1 == 0 && value < length;
  }

  var _isIndex = isIndex;

  /** Used as references for various `Number` constants. */
  var MAX_SAFE_INTEGER$1 = 9007199254740991;

  /**
   * Checks if `value` is a valid array-like length.
   *
   * **Note:** This method is loosely based on
   * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
   * @example
   *
   * _.isLength(3);
   * // => true
   *
   * _.isLength(Number.MIN_VALUE);
   * // => false
   *
   * _.isLength(Infinity);
   * // => false
   *
   * _.isLength('3');
   * // => false
   */
  function isLength(value) {
    return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER$1;
  }

  var isLength_1 = isLength;

  /** `Object#toString` result references. */
  var argsTag$1 = '[object Arguments]',
      arrayTag = '[object Array]',
      boolTag = '[object Boolean]',
      dateTag = '[object Date]',
      errorTag = '[object Error]',
      funcTag$1 = '[object Function]',
      mapTag = '[object Map]',
      numberTag = '[object Number]',
      objectTag = '[object Object]',
      regexpTag = '[object RegExp]',
      setTag = '[object Set]',
      stringTag = '[object String]',
      weakMapTag = '[object WeakMap]';

  var arrayBufferTag = '[object ArrayBuffer]',
      dataViewTag = '[object DataView]',
      float32Tag = '[object Float32Array]',
      float64Tag = '[object Float64Array]',
      int8Tag = '[object Int8Array]',
      int16Tag = '[object Int16Array]',
      int32Tag = '[object Int32Array]',
      uint8Tag = '[object Uint8Array]',
      uint8ClampedTag = '[object Uint8ClampedArray]',
      uint16Tag = '[object Uint16Array]',
      uint32Tag = '[object Uint32Array]';

  /** Used to identify `toStringTag` values of typed arrays. */
  var typedArrayTags = {};
  typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
  typedArrayTags[argsTag$1] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] = typedArrayTags[dataViewTag] = typedArrayTags[dateTag] = typedArrayTags[errorTag] = typedArrayTags[funcTag$1] = typedArrayTags[mapTag] = typedArrayTags[numberTag] = typedArrayTags[objectTag] = typedArrayTags[regexpTag] = typedArrayTags[setTag] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;

  /**
   * The base implementation of `_.isTypedArray` without Node.js optimizations.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
   */
  function baseIsTypedArray(value) {
      return isObjectLike_1(value) && isLength_1(value.length) && !!typedArrayTags[_baseGetTag(value)];
  }

  var _baseIsTypedArray = baseIsTypedArray;

  /**
   * The base implementation of `_.unary` without support for storing metadata.
   *
   * @private
   * @param {Function} func The function to cap arguments for.
   * @returns {Function} Returns the new capped function.
   */
  function baseUnary(func) {
    return function (value) {
      return func(value);
    };
  }

  var _baseUnary = baseUnary;

  var _nodeUtil = createCommonjsModule(function (module, exports) {
    /** Detect free variable `exports`. */
    var freeExports = exports && !exports.nodeType && exports;

    /** Detect free variable `module`. */
    var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

    /** Detect the popular CommonJS extension `module.exports`. */
    var moduleExports = freeModule && freeModule.exports === freeExports;

    /** Detect free variable `process` from Node.js. */
    var freeProcess = moduleExports && _freeGlobal.process;

    /** Used to access faster Node.js helpers. */
    var nodeUtil = function () {
      try {
        return freeProcess && freeProcess.binding && freeProcess.binding('util');
      } catch (e) {}
    }();

    module.exports = nodeUtil;
  });

  /* Node.js helper references. */
  var nodeIsTypedArray = _nodeUtil && _nodeUtil.isTypedArray;

  /**
   * Checks if `value` is classified as a typed array.
   *
   * @static
   * @memberOf _
   * @since 3.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
   * @example
   *
   * _.isTypedArray(new Uint8Array);
   * // => true
   *
   * _.isTypedArray([]);
   * // => false
   */
  var isTypedArray = nodeIsTypedArray ? _baseUnary(nodeIsTypedArray) : _baseIsTypedArray;

  var isTypedArray_1 = isTypedArray;

  /** Used for built-in method references. */
  var objectProto$7 = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$6 = objectProto$7.hasOwnProperty;

  /**
   * Creates an array of the enumerable property names of the array-like `value`.
   *
   * @private
   * @param {*} value The value to query.
   * @param {boolean} inherited Specify returning inherited property names.
   * @returns {Array} Returns the array of property names.
   */
  function arrayLikeKeys(value, inherited) {
    var isArr = isArray_1(value),
        isArg = !isArr && isArguments_1(value),
        isBuff = !isArr && !isArg && isBuffer_1(value),
        isType = !isArr && !isArg && !isBuff && isTypedArray_1(value),
        skipIndexes = isArr || isArg || isBuff || isType,
        result = skipIndexes ? _baseTimes(value.length, String) : [],
        length = result.length;

    for (var key in value) {
      if ((inherited || hasOwnProperty$6.call(value, key)) && !(skipIndexes && (
      // Safari 9 has enumerable `arguments.length` in strict mode.
      key == 'length' ||
      // Node.js 0.10 has enumerable non-index properties on buffers.
      isBuff && (key == 'offset' || key == 'parent') ||
      // PhantomJS 2 has enumerable non-index properties on typed arrays.
      isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset') ||
      // Skip index properties.
      _isIndex(key, length)))) {
        result.push(key);
      }
    }
    return result;
  }

  var _arrayLikeKeys = arrayLikeKeys;

  /** Used for built-in method references. */
  var objectProto$8 = Object.prototype;

  /**
   * Checks if `value` is likely a prototype object.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
   */
  function isPrototype(value) {
    var Ctor = value && value.constructor,
        proto = typeof Ctor == 'function' && Ctor.prototype || objectProto$8;

    return value === proto;
  }

  var _isPrototype = isPrototype;

  /**
   * Creates a unary function that invokes `func` with its argument transformed.
   *
   * @private
   * @param {Function} func The function to wrap.
   * @param {Function} transform The argument transform.
   * @returns {Function} Returns the new function.
   */
  function overArg(func, transform) {
    return function (arg) {
      return func(transform(arg));
    };
  }

  var _overArg = overArg;

  /* Built-in method references for those with the same name as other `lodash` methods. */
  var nativeKeys = _overArg(Object.keys, Object);

  var _nativeKeys = nativeKeys;

  /** Used for built-in method references. */
  var objectProto$9 = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$7 = objectProto$9.hasOwnProperty;

  /**
   * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names.
   */
  function baseKeys(object) {
    if (!_isPrototype(object)) {
      return _nativeKeys(object);
    }
    var result = [];
    for (var key in Object(object)) {
      if (hasOwnProperty$7.call(object, key) && key != 'constructor') {
        result.push(key);
      }
    }
    return result;
  }

  var _baseKeys = baseKeys;

  /**
   * Checks if `value` is array-like. A value is considered array-like if it's
   * not a function and has a `value.length` that's an integer greater than or
   * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
   * @example
   *
   * _.isArrayLike([1, 2, 3]);
   * // => true
   *
   * _.isArrayLike(document.body.children);
   * // => true
   *
   * _.isArrayLike('abc');
   * // => true
   *
   * _.isArrayLike(_.noop);
   * // => false
   */
  function isArrayLike(value) {
    return value != null && isLength_1(value.length) && !isFunction_1(value);
  }

  var isArrayLike_1 = isArrayLike;

  /**
   * Creates an array of the own enumerable property names of `object`.
   *
   * **Note:** Non-object values are coerced to objects. See the
   * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
   * for more details.
   *
   * @static
   * @since 0.1.0
   * @memberOf _
   * @category Object
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names.
   * @example
   *
   * function Foo() {
   *   this.a = 1;
   *   this.b = 2;
   * }
   *
   * Foo.prototype.c = 3;
   *
   * _.keys(new Foo);
   * // => ['a', 'b'] (iteration order is not guaranteed)
   *
   * _.keys('hi');
   * // => ['0', '1']
   */
  function keys(object) {
    return isArrayLike_1(object) ? _arrayLikeKeys(object) : _baseKeys(object);
  }

  var keys_1 = keys;

  /**
   * The base implementation of `_.assign` without support for multiple sources
   * or `customizer` functions.
   *
   * @private
   * @param {Object} object The destination object.
   * @param {Object} source The source object.
   * @returns {Object} Returns `object`.
   */
  function baseAssign(object, source) {
    return object && _copyObject(source, keys_1(source), object);
  }

  var _baseAssign = baseAssign;

  /**
   * This function is like
   * [`Object.keys`](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
   * except that it includes inherited enumerable properties.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names.
   */
  function nativeKeysIn(object) {
    var result = [];
    if (object != null) {
      for (var key in Object(object)) {
        result.push(key);
      }
    }
    return result;
  }

  var _nativeKeysIn = nativeKeysIn;

  /** Used for built-in method references. */
  var objectProto$a = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$8 = objectProto$a.hasOwnProperty;

  /**
   * The base implementation of `_.keysIn` which doesn't treat sparse arrays as dense.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names.
   */
  function baseKeysIn(object) {
    if (!isObject_1(object)) {
      return _nativeKeysIn(object);
    }
    var isProto = _isPrototype(object),
        result = [];

    for (var key in object) {
      if (!(key == 'constructor' && (isProto || !hasOwnProperty$8.call(object, key)))) {
        result.push(key);
      }
    }
    return result;
  }

  var _baseKeysIn = baseKeysIn;

  /**
   * Creates an array of the own and inherited enumerable property names of `object`.
   *
   * **Note:** Non-object values are coerced to objects.
   *
   * @static
   * @memberOf _
   * @since 3.0.0
   * @category Object
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names.
   * @example
   *
   * function Foo() {
   *   this.a = 1;
   *   this.b = 2;
   * }
   *
   * Foo.prototype.c = 3;
   *
   * _.keysIn(new Foo);
   * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
   */
  function keysIn$1(object) {
    return isArrayLike_1(object) ? _arrayLikeKeys(object, true) : _baseKeysIn(object);
  }

  var keysIn_1 = keysIn$1;

  /**
   * The base implementation of `_.assignIn` without support for multiple sources
   * or `customizer` functions.
   *
   * @private
   * @param {Object} object The destination object.
   * @param {Object} source The source object.
   * @returns {Object} Returns `object`.
   */
  function baseAssignIn(object, source) {
    return object && _copyObject(source, keysIn_1(source), object);
  }

  var _baseAssignIn = baseAssignIn;

  var _cloneBuffer = createCommonjsModule(function (module, exports) {
    /** Detect free variable `exports`. */
    var freeExports = exports && !exports.nodeType && exports;

    /** Detect free variable `module`. */
    var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

    /** Detect the popular CommonJS extension `module.exports`. */
    var moduleExports = freeModule && freeModule.exports === freeExports;

    /** Built-in value references. */
    var Buffer = moduleExports ? _root.Buffer : undefined,
        allocUnsafe = Buffer ? Buffer.allocUnsafe : undefined;

    /**
     * Creates a clone of  `buffer`.
     *
     * @private
     * @param {Buffer} buffer The buffer to clone.
     * @param {boolean} [isDeep] Specify a deep clone.
     * @returns {Buffer} Returns the cloned buffer.
     */
    function cloneBuffer(buffer, isDeep) {
      if (isDeep) {
        return buffer.slice();
      }
      var length = buffer.length,
          result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);

      buffer.copy(result);
      return result;
    }

    module.exports = cloneBuffer;
  });

  /**
   * Copies the values of `source` to `array`.
   *
   * @private
   * @param {Array} source The array to copy values from.
   * @param {Array} [array=[]] The array to copy values to.
   * @returns {Array} Returns `array`.
   */
  function copyArray(source, array) {
    var index = -1,
        length = source.length;

    array || (array = Array(length));
    while (++index < length) {
      array[index] = source[index];
    }
    return array;
  }

  var _copyArray = copyArray;

  /**
   * A specialized version of `_.filter` for arrays without support for
   * iteratee shorthands.
   *
   * @private
   * @param {Array} [array] The array to iterate over.
   * @param {Function} predicate The function invoked per iteration.
   * @returns {Array} Returns the new filtered array.
   */
  function arrayFilter(array, predicate) {
    var index = -1,
        length = array == null ? 0 : array.length,
        resIndex = 0,
        result = [];

    while (++index < length) {
      var value = array[index];
      if (predicate(value, index, array)) {
        result[resIndex++] = value;
      }
    }
    return result;
  }

  var _arrayFilter = arrayFilter;

  /**
   * This method returns a new empty array.
   *
   * @static
   * @memberOf _
   * @since 4.13.0
   * @category Util
   * @returns {Array} Returns the new empty array.
   * @example
   *
   * var arrays = _.times(2, _.stubArray);
   *
   * console.log(arrays);
   * // => [[], []]
   *
   * console.log(arrays[0] === arrays[1]);
   * // => false
   */
  function stubArray() {
    return [];
  }

  var stubArray_1 = stubArray;

  /** Used for built-in method references. */
  var objectProto$b = Object.prototype;

  /** Built-in value references. */
  var propertyIsEnumerable$1 = objectProto$b.propertyIsEnumerable;

  /* Built-in method references for those with the same name as other `lodash` methods. */
  var nativeGetSymbols = Object.getOwnPropertySymbols;

  /**
   * Creates an array of the own enumerable symbols of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of symbols.
   */
  var getSymbols = !nativeGetSymbols ? stubArray_1 : function (object) {
    if (object == null) {
      return [];
    }
    object = Object(object);
    return _arrayFilter(nativeGetSymbols(object), function (symbol) {
      return propertyIsEnumerable$1.call(object, symbol);
    });
  };

  var _getSymbols = getSymbols;

  /**
   * Copies own symbols of `source` to `object`.
   *
   * @private
   * @param {Object} source The object to copy symbols from.
   * @param {Object} [object={}] The object to copy symbols to.
   * @returns {Object} Returns `object`.
   */
  function copySymbols(source, object) {
    return _copyObject(source, _getSymbols(source), object);
  }

  var _copySymbols = copySymbols;

  /**
   * Appends the elements of `values` to `array`.
   *
   * @private
   * @param {Array} array The array to modify.
   * @param {Array} values The values to append.
   * @returns {Array} Returns `array`.
   */
  function arrayPush(array, values) {
    var index = -1,
        length = values.length,
        offset = array.length;

    while (++index < length) {
      array[offset + index] = values[index];
    }
    return array;
  }

  var _arrayPush = arrayPush;

  /** Built-in value references. */
  var getPrototype = _overArg(Object.getPrototypeOf, Object);

  var _getPrototype = getPrototype;

  /* Built-in method references for those with the same name as other `lodash` methods. */
  var nativeGetSymbols$1 = Object.getOwnPropertySymbols;

  /**
   * Creates an array of the own and inherited enumerable symbols of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of symbols.
   */
  var getSymbolsIn = !nativeGetSymbols$1 ? stubArray_1 : function (object) {
    var result = [];
    while (object) {
      _arrayPush(result, _getSymbols(object));
      object = _getPrototype(object);
    }
    return result;
  };

  var _getSymbolsIn = getSymbolsIn;

  /**
   * Copies own and inherited symbols of `source` to `object`.
   *
   * @private
   * @param {Object} source The object to copy symbols from.
   * @param {Object} [object={}] The object to copy symbols to.
   * @returns {Object} Returns `object`.
   */
  function copySymbolsIn(source, object) {
    return _copyObject(source, _getSymbolsIn(source), object);
  }

  var _copySymbolsIn = copySymbolsIn;

  /**
   * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
   * `keysFunc` and `symbolsFunc` to get the enumerable property names and
   * symbols of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @param {Function} keysFunc The function to get the keys of `object`.
   * @param {Function} symbolsFunc The function to get the symbols of `object`.
   * @returns {Array} Returns the array of property names and symbols.
   */
  function baseGetAllKeys(object, keysFunc, symbolsFunc) {
    var result = keysFunc(object);
    return isArray_1(object) ? result : _arrayPush(result, symbolsFunc(object));
  }

  var _baseGetAllKeys = baseGetAllKeys;

  /**
   * Creates an array of own enumerable property names and symbols of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names and symbols.
   */
  function getAllKeys(object) {
    return _baseGetAllKeys(object, keys_1, _getSymbols);
  }

  var _getAllKeys = getAllKeys;

  /**
   * Creates an array of own and inherited enumerable property names and
   * symbols of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names and symbols.
   */
  function getAllKeysIn(object) {
    return _baseGetAllKeys(object, keysIn_1, _getSymbolsIn);
  }

  var _getAllKeysIn = getAllKeysIn;

  /* Built-in method references that are verified to be native. */
  var DataView = _getNative(_root, 'DataView');

  var _DataView = DataView;

  /* Built-in method references that are verified to be native. */
  var Promise$1 = _getNative(_root, 'Promise');

  var _Promise = Promise$1;

  /* Built-in method references that are verified to be native. */
  var Set = _getNative(_root, 'Set');

  var _Set = Set;

  /* Built-in method references that are verified to be native. */
  var WeakMap = _getNative(_root, 'WeakMap');

  var _WeakMap = WeakMap;

  /** `Object#toString` result references. */
  var mapTag$1 = '[object Map]',
      objectTag$1 = '[object Object]',
      promiseTag = '[object Promise]',
      setTag$1 = '[object Set]',
      weakMapTag$1 = '[object WeakMap]';

  var dataViewTag$1 = '[object DataView]';

  /** Used to detect maps, sets, and weakmaps. */
  var dataViewCtorString = _toSource(_DataView),
      mapCtorString = _toSource(_Map),
      promiseCtorString = _toSource(_Promise),
      setCtorString = _toSource(_Set),
      weakMapCtorString = _toSource(_WeakMap);

  /**
   * Gets the `toStringTag` of `value`.
   *
   * @private
   * @param {*} value The value to query.
   * @returns {string} Returns the `toStringTag`.
   */
  var getTag = _baseGetTag;

  // Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.
  if (_DataView && getTag(new _DataView(new ArrayBuffer(1))) != dataViewTag$1 || _Map && getTag(new _Map()) != mapTag$1 || _Promise && getTag(_Promise.resolve()) != promiseTag || _Set && getTag(new _Set()) != setTag$1 || _WeakMap && getTag(new _WeakMap()) != weakMapTag$1) {
      getTag = function getTag(value) {
          var result = _baseGetTag(value),
              Ctor = result == objectTag$1 ? value.constructor : undefined,
              ctorString = Ctor ? _toSource(Ctor) : '';

          if (ctorString) {
              switch (ctorString) {
                  case dataViewCtorString:
                      return dataViewTag$1;
                  case mapCtorString:
                      return mapTag$1;
                  case promiseCtorString:
                      return promiseTag;
                  case setCtorString:
                      return setTag$1;
                  case weakMapCtorString:
                      return weakMapTag$1;
              }
          }
          return result;
      };
  }

  var _getTag = getTag;

  /** Used for built-in method references. */
  var objectProto$c = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$9 = objectProto$c.hasOwnProperty;

  /**
   * Initializes an array clone.
   *
   * @private
   * @param {Array} array The array to clone.
   * @returns {Array} Returns the initialized clone.
   */
  function initCloneArray(array) {
    var length = array.length,
        result = array.constructor(length);

    // Add properties assigned by `RegExp#exec`.
    if (length && typeof array[0] == 'string' && hasOwnProperty$9.call(array, 'index')) {
      result.index = array.index;
      result.input = array.input;
    }
    return result;
  }

  var _initCloneArray = initCloneArray;

  /** Built-in value references. */
  var Uint8Array = _root.Uint8Array;

  var _Uint8Array = Uint8Array;

  /**
   * Creates a clone of `arrayBuffer`.
   *
   * @private
   * @param {ArrayBuffer} arrayBuffer The array buffer to clone.
   * @returns {ArrayBuffer} Returns the cloned array buffer.
   */
  function cloneArrayBuffer(arrayBuffer) {
    var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
    new _Uint8Array(result).set(new _Uint8Array(arrayBuffer));
    return result;
  }

  var _cloneArrayBuffer = cloneArrayBuffer;

  /**
   * Creates a clone of `dataView`.
   *
   * @private
   * @param {Object} dataView The data view to clone.
   * @param {boolean} [isDeep] Specify a deep clone.
   * @returns {Object} Returns the cloned data view.
   */
  function cloneDataView(dataView, isDeep) {
    var buffer = isDeep ? _cloneArrayBuffer(dataView.buffer) : dataView.buffer;
    return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
  }

  var _cloneDataView = cloneDataView;

  /**
   * Adds the key-value `pair` to `map`.
   *
   * @private
   * @param {Object} map The map to modify.
   * @param {Array} pair The key-value pair to add.
   * @returns {Object} Returns `map`.
   */
  function addMapEntry(map, pair) {
    // Don't return `map.set` because it's not chainable in IE 11.
    map.set(pair[0], pair[1]);
    return map;
  }

  var _addMapEntry = addMapEntry;

  /**
   * A specialized version of `_.reduce` for arrays without support for
   * iteratee shorthands.
   *
   * @private
   * @param {Array} [array] The array to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @param {*} [accumulator] The initial value.
   * @param {boolean} [initAccum] Specify using the first element of `array` as
   *  the initial value.
   * @returns {*} Returns the accumulated value.
   */
  function arrayReduce(array, iteratee, accumulator, initAccum) {
    var index = -1,
        length = array == null ? 0 : array.length;

    if (initAccum && length) {
      accumulator = array[++index];
    }
    while (++index < length) {
      accumulator = iteratee(accumulator, array[index], index, array);
    }
    return accumulator;
  }

  var _arrayReduce = arrayReduce;

  /**
   * Converts `map` to its key-value pairs.
   *
   * @private
   * @param {Object} map The map to convert.
   * @returns {Array} Returns the key-value pairs.
   */
  function mapToArray(map) {
    var index = -1,
        result = Array(map.size);

    map.forEach(function (value, key) {
      result[++index] = [key, value];
    });
    return result;
  }

  var _mapToArray = mapToArray;

  /** Used to compose bitmasks for cloning. */
  var CLONE_DEEP_FLAG = 1;

  /**
   * Creates a clone of `map`.
   *
   * @private
   * @param {Object} map The map to clone.
   * @param {Function} cloneFunc The function to clone values.
   * @param {boolean} [isDeep] Specify a deep clone.
   * @returns {Object} Returns the cloned map.
   */
  function cloneMap(map, isDeep, cloneFunc) {
    var array = isDeep ? cloneFunc(_mapToArray(map), CLONE_DEEP_FLAG) : _mapToArray(map);
    return _arrayReduce(array, _addMapEntry, new map.constructor());
  }

  var _cloneMap = cloneMap;

  /** Used to match `RegExp` flags from their coerced string values. */
  var reFlags = /\w*$/;

  /**
   * Creates a clone of `regexp`.
   *
   * @private
   * @param {Object} regexp The regexp to clone.
   * @returns {Object} Returns the cloned regexp.
   */
  function cloneRegExp(regexp) {
    var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
    result.lastIndex = regexp.lastIndex;
    return result;
  }

  var _cloneRegExp = cloneRegExp;

  /**
   * Adds `value` to `set`.
   *
   * @private
   * @param {Object} set The set to modify.
   * @param {*} value The value to add.
   * @returns {Object} Returns `set`.
   */
  function addSetEntry(set, value) {
    // Don't return `set.add` because it's not chainable in IE 11.
    set.add(value);
    return set;
  }

  var _addSetEntry = addSetEntry;

  /**
   * Converts `set` to an array of its values.
   *
   * @private
   * @param {Object} set The set to convert.
   * @returns {Array} Returns the values.
   */
  function setToArray(set) {
    var index = -1,
        result = Array(set.size);

    set.forEach(function (value) {
      result[++index] = value;
    });
    return result;
  }

  var _setToArray = setToArray;

  /** Used to compose bitmasks for cloning. */
  var CLONE_DEEP_FLAG$1 = 1;

  /**
   * Creates a clone of `set`.
   *
   * @private
   * @param {Object} set The set to clone.
   * @param {Function} cloneFunc The function to clone values.
   * @param {boolean} [isDeep] Specify a deep clone.
   * @returns {Object} Returns the cloned set.
   */
  function cloneSet(set, isDeep, cloneFunc) {
    var array = isDeep ? cloneFunc(_setToArray(set), CLONE_DEEP_FLAG$1) : _setToArray(set);
    return _arrayReduce(array, _addSetEntry, new set.constructor());
  }

  var _cloneSet = cloneSet;

  /** Used to convert symbols to primitives and strings. */
  var symbolProto = _Symbol ? _Symbol.prototype : undefined,
      symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;

  /**
   * Creates a clone of the `symbol` object.
   *
   * @private
   * @param {Object} symbol The symbol object to clone.
   * @returns {Object} Returns the cloned symbol object.
   */
  function cloneSymbol(symbol) {
    return symbolValueOf ? Object(symbolValueOf.call(symbol)) : {};
  }

  var _cloneSymbol = cloneSymbol;

  /**
   * Creates a clone of `typedArray`.
   *
   * @private
   * @param {Object} typedArray The typed array to clone.
   * @param {boolean} [isDeep] Specify a deep clone.
   * @returns {Object} Returns the cloned typed array.
   */
  function cloneTypedArray(typedArray, isDeep) {
    var buffer = isDeep ? _cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
    return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
  }

  var _cloneTypedArray = cloneTypedArray;

  /** `Object#toString` result references. */
  var boolTag$1 = '[object Boolean]',
      dateTag$1 = '[object Date]',
      mapTag$2 = '[object Map]',
      numberTag$1 = '[object Number]',
      regexpTag$1 = '[object RegExp]',
      setTag$2 = '[object Set]',
      stringTag$1 = '[object String]',
      symbolTag = '[object Symbol]';

  var arrayBufferTag$1 = '[object ArrayBuffer]',
      dataViewTag$2 = '[object DataView]',
      float32Tag$1 = '[object Float32Array]',
      float64Tag$1 = '[object Float64Array]',
      int8Tag$1 = '[object Int8Array]',
      int16Tag$1 = '[object Int16Array]',
      int32Tag$1 = '[object Int32Array]',
      uint8Tag$1 = '[object Uint8Array]',
      uint8ClampedTag$1 = '[object Uint8ClampedArray]',
      uint16Tag$1 = '[object Uint16Array]',
      uint32Tag$1 = '[object Uint32Array]';

  /**
   * Initializes an object clone based on its `toStringTag`.
   *
   * **Note:** This function only supports cloning values with tags of
   * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
   *
   * @private
   * @param {Object} object The object to clone.
   * @param {string} tag The `toStringTag` of the object to clone.
   * @param {Function} cloneFunc The function to clone values.
   * @param {boolean} [isDeep] Specify a deep clone.
   * @returns {Object} Returns the initialized clone.
   */
  function initCloneByTag(object, tag, cloneFunc, isDeep) {
    var Ctor = object.constructor;
    switch (tag) {
      case arrayBufferTag$1:
        return _cloneArrayBuffer(object);

      case boolTag$1:
      case dateTag$1:
        return new Ctor(+object);

      case dataViewTag$2:
        return _cloneDataView(object, isDeep);

      case float32Tag$1:case float64Tag$1:
      case int8Tag$1:case int16Tag$1:case int32Tag$1:
      case uint8Tag$1:case uint8ClampedTag$1:case uint16Tag$1:case uint32Tag$1:
        return _cloneTypedArray(object, isDeep);

      case mapTag$2:
        return _cloneMap(object, isDeep, cloneFunc);

      case numberTag$1:
      case stringTag$1:
        return new Ctor(object);

      case regexpTag$1:
        return _cloneRegExp(object);

      case setTag$2:
        return _cloneSet(object, isDeep, cloneFunc);

      case symbolTag:
        return _cloneSymbol(object);
    }
  }

  var _initCloneByTag = initCloneByTag;

  /** Built-in value references. */
  var objectCreate = Object.create;

  /**
   * The base implementation of `_.create` without support for assigning
   * properties to the created object.
   *
   * @private
   * @param {Object} proto The object to inherit from.
   * @returns {Object} Returns the new object.
   */
  var baseCreate = function () {
    function object() {}
    return function (proto) {
      if (!isObject_1(proto)) {
        return {};
      }
      if (objectCreate) {
        return objectCreate(proto);
      }
      object.prototype = proto;
      var result = new object();
      object.prototype = undefined;
      return result;
    };
  }();

  var _baseCreate = baseCreate;

  /**
   * Initializes an object clone.
   *
   * @private
   * @param {Object} object The object to clone.
   * @returns {Object} Returns the initialized clone.
   */
  function initCloneObject(object) {
    return typeof object.constructor == 'function' && !_isPrototype(object) ? _baseCreate(_getPrototype(object)) : {};
  }

  var _initCloneObject = initCloneObject;

  /** Used to compose bitmasks for cloning. */
  var CLONE_DEEP_FLAG$2 = 1,
      CLONE_FLAT_FLAG = 2,
      CLONE_SYMBOLS_FLAG = 4;

  /** `Object#toString` result references. */
  var argsTag$2 = '[object Arguments]',
      arrayTag$1 = '[object Array]',
      boolTag$2 = '[object Boolean]',
      dateTag$2 = '[object Date]',
      errorTag$1 = '[object Error]',
      funcTag$2 = '[object Function]',
      genTag$1 = '[object GeneratorFunction]',
      mapTag$3 = '[object Map]',
      numberTag$2 = '[object Number]',
      objectTag$2 = '[object Object]',
      regexpTag$2 = '[object RegExp]',
      setTag$3 = '[object Set]',
      stringTag$2 = '[object String]',
      symbolTag$1 = '[object Symbol]',
      weakMapTag$2 = '[object WeakMap]';

  var arrayBufferTag$2 = '[object ArrayBuffer]',
      dataViewTag$3 = '[object DataView]',
      float32Tag$2 = '[object Float32Array]',
      float64Tag$2 = '[object Float64Array]',
      int8Tag$2 = '[object Int8Array]',
      int16Tag$2 = '[object Int16Array]',
      int32Tag$2 = '[object Int32Array]',
      uint8Tag$2 = '[object Uint8Array]',
      uint8ClampedTag$2 = '[object Uint8ClampedArray]',
      uint16Tag$2 = '[object Uint16Array]',
      uint32Tag$2 = '[object Uint32Array]';

  /** Used to identify `toStringTag` values supported by `_.clone`. */
  var cloneableTags = {};
  cloneableTags[argsTag$2] = cloneableTags[arrayTag$1] = cloneableTags[arrayBufferTag$2] = cloneableTags[dataViewTag$3] = cloneableTags[boolTag$2] = cloneableTags[dateTag$2] = cloneableTags[float32Tag$2] = cloneableTags[float64Tag$2] = cloneableTags[int8Tag$2] = cloneableTags[int16Tag$2] = cloneableTags[int32Tag$2] = cloneableTags[mapTag$3] = cloneableTags[numberTag$2] = cloneableTags[objectTag$2] = cloneableTags[regexpTag$2] = cloneableTags[setTag$3] = cloneableTags[stringTag$2] = cloneableTags[symbolTag$1] = cloneableTags[uint8Tag$2] = cloneableTags[uint8ClampedTag$2] = cloneableTags[uint16Tag$2] = cloneableTags[uint32Tag$2] = true;
  cloneableTags[errorTag$1] = cloneableTags[funcTag$2] = cloneableTags[weakMapTag$2] = false;

  /**
   * The base implementation of `_.clone` and `_.cloneDeep` which tracks
   * traversed objects.
   *
   * @private
   * @param {*} value The value to clone.
   * @param {boolean} bitmask The bitmask flags.
   *  1 - Deep clone
   *  2 - Flatten inherited properties
   *  4 - Clone symbols
   * @param {Function} [customizer] The function to customize cloning.
   * @param {string} [key] The key of `value`.
   * @param {Object} [object] The parent object of `value`.
   * @param {Object} [stack] Tracks traversed objects and their clone counterparts.
   * @returns {*} Returns the cloned value.
   */
  function baseClone(value, bitmask, customizer, key, object, stack) {
    var result,
        isDeep = bitmask & CLONE_DEEP_FLAG$2,
        isFlat = bitmask & CLONE_FLAT_FLAG,
        isFull = bitmask & CLONE_SYMBOLS_FLAG;

    if (customizer) {
      result = object ? customizer(value, key, object, stack) : customizer(value);
    }
    if (result !== undefined) {
      return result;
    }
    if (!isObject_1(value)) {
      return value;
    }
    var isArr = isArray_1(value);
    if (isArr) {
      result = _initCloneArray(value);
      if (!isDeep) {
        return _copyArray(value, result);
      }
    } else {
      var tag = _getTag(value),
          isFunc = tag == funcTag$2 || tag == genTag$1;

      if (isBuffer_1(value)) {
        return _cloneBuffer(value, isDeep);
      }
      if (tag == objectTag$2 || tag == argsTag$2 || isFunc && !object) {
        result = isFlat || isFunc ? {} : _initCloneObject(value);
        if (!isDeep) {
          return isFlat ? _copySymbolsIn(value, _baseAssignIn(result, value)) : _copySymbols(value, _baseAssign(result, value));
        }
      } else {
        if (!cloneableTags[tag]) {
          return object ? value : {};
        }
        result = _initCloneByTag(value, tag, baseClone, isDeep);
      }
    }
    // Check for circular references and return its corresponding clone.
    stack || (stack = new _Stack());
    var stacked = stack.get(value);
    if (stacked) {
      return stacked;
    }
    stack.set(value, result);

    var keysFunc = isFull ? isFlat ? _getAllKeysIn : _getAllKeys : isFlat ? keysIn : keys_1;

    var props = isArr ? undefined : keysFunc(value);
    _arrayEach(props || value, function (subValue, key) {
      if (props) {
        key = subValue;
        subValue = value[key];
      }
      // Recursively populate clone (susceptible to call stack limits).
      _assignValue(result, key, baseClone(subValue, bitmask, customizer, key, value, stack));
    });
    return result;
  }

  var _baseClone = baseClone;

  /** Used to compose bitmasks for cloning. */
  var CLONE_DEEP_FLAG$3 = 1,
      CLONE_SYMBOLS_FLAG$1 = 4;

  /**
   * This method is like `_.clone` except that it recursively clones `value`.
   *
   * @static
   * @memberOf _
   * @since 1.0.0
   * @category Lang
   * @param {*} value The value to recursively clone.
   * @returns {*} Returns the deep cloned value.
   * @see _.clone
   * @example
   *
   * var objects = [{ 'a': 1 }, { 'b': 2 }];
   *
   * var deep = _.cloneDeep(objects);
   * console.log(deep[0] === objects[0]);
   * // => false
   */
  function cloneDeep(value) {
    return _baseClone(value, CLONE_DEEP_FLAG$3 | CLONE_SYMBOLS_FLAG$1);
  }

  var cloneDeep_1 = cloneDeep;

  // returns a function, using the parameter given to the sankey setting
  function constant(x) {
    return function () {
      return x;
    };
  }

  // For a given link, return the target node's depth
  function targetDepth(d) {
    return d.target.depth;
  }

  // The depth of a node when the nodeAlign (align) is set to 'left'
  function left(node) {
    return node.depth;
  }

  // The depth of a node when the nodeAlign (align) is set to 'right'
  function right(node, n) {
    return n - 1 - node.height;
  }

  // The depth of a node when the nodeAlign (align) is set to 'justify'
  function justify(node, n) {
    return node.sourceLinks.length ? node.depth : n - 1;
  }

  // The depth of a node when the nodeAlign (align) is set to 'center'
  function center(node) {
    return node.targetLinks.length ? node.depth : node.sourceLinks.length ? d3Array.min(node.sourceLinks, targetDepth) - 1 : 0;
  }

  function fillHeight(graph, y0, y1) {
    var nodes = graph.nodes;
    var links = graph.links;

    var top = false;
    var bottom = false;

    links.forEach(function (link) {
      if (link.circularLinkType == 'top') {
        top = true;
      } else if (link.circularLinkType == 'bottom') {
        bottom = true;
      }
    });

    if (top == false || bottom == false) {
      var minY0 = min(nodes, function (node) {
        return node.y0;
      });
      var maxY1 = max(nodes, function (node) {
        return node.y1;
      });
      var currentHeight = maxY1 - minY0;
      var chartHeight = y1 - y0;
      var ratio = chartHeight / currentHeight;

      nodes.forEach(function (node) {
        var nodeHeight = (node.y1 - node.y0) * ratio;
        node.y0 = (node.y0 - minY0) * ratio;
        node.y1 = node.y0 + nodeHeight;
      });

      links.forEach(function (link) {
        link.y0 = (link.y0 - minY0) * ratio;
        link.y1 = (link.y1 - minY0) * ratio;
        link.width = link.width * ratio;
      });
    }
  }

  function getNodeID(node, id) {
    return id(node);
  }

  // returns the slope of a link, from source to target
  // up => slopes up from source to target
  // down => slopes down from source to target
  function incline(link) {
    return link.y0 - link.y1 > 0 ? 'up' : 'down';
  }

  // test if links both slope up, or both slope down
  function sameInclines(link1, link2) {
    return incline(link1) == incline(link2);
  }

  // Return the angle between a straight line between
  // the source and target of the link,
  // and the vertical plane of the node
  function linkAngle(link) {
    var adjacent = Math.abs(link.y1 - link.y0);
    var opposite = Math.abs(link.target.x0 - link.source.x1);

    return Math.atan(opposite / adjacent);
  }

  // return the distance between the link's target and source node, in terms of the nodes' X coordinate
  function linkXLength(link) {
    return link.target.x0 - link.source.x1;
  }

  // Return the Y coordinate on the longerLink path * which is perpendicular shorterLink's source.
  // * approx, based on a straight line from target to source, when in fact the path is a bezier
  function linkPerpendicularYToLinkSource(longerLink, shorterLink) {
    // get the angle for the longer link
    var angle = linkAngle(longerLink);

    // get the adjacent length to the other link's x position
    var heightFromY1ToPependicular = linkXLength(shorterLink) / Math.tan(angle);

    // add or subtract from longer link1's original y1, depending on the slope
    var yPerpendicular = incline(longerLink) == 'up' ? longerLink.y1 + heightFromY1ToPependicular : longerLink.y1 - heightFromY1ToPependicular;

    return yPerpendicular;
  }

  // sort and set the links' y1 for each node
  function sortTargetLinks(graph, y1, id) {
    graph.nodes.forEach(function (node) {
      var nodesTargetLinks = graph.links.filter(function (l) {
        return getNodeID(l.target, id) == getNodeID(node, id);
      });

      var nodesTargetLinksLength = nodesTargetLinks.length;

      if (nodesTargetLinksLength > 1) {
        nodesTargetLinks.sort(function (link1, link2) {
          // if both are not circular, the base on the source y position
          if (!link1.circular && !link2.circular) {
            if (link1.source.column == link2.source.column) {
              return link1.y0 - link2.y0;
            } else if (!sameInclines(link1, link2)) {
              return link1.y0 - link2.y0;
            } else {
              // get the angle of the link to the further source node (ie the smaller column)
              if (link2.source.column < link1.source.column) {
                var link2Adj = linkPerpendicularYToLinkSource(link2, link1);

                return link1.y0 - link2Adj;
              }
              if (link1.source.column < link2.source.column) {
                var link1Adj = linkPerpendicularYToLinkSource(link1, link2);

                return link1Adj - link2.y0;
              }
            }
          }

          // if only one is circular, the move top links up, or bottom links down
          if (link1.circular && !link2.circular) {
            return link1.circularLinkType == 'top' ? -1 : 1;
          } else if (link2.circular && !link1.circular) {
            return link2.circularLinkType == 'top' ? 1 : -1;
          }

          // if both links are circular...
          if (link1.circular && link2.circular) {
            // ...and they both loop the same way (both top)
            if (link1.circularLinkType === link2.circularLinkType && link1.circularLinkType == 'top') {
              // ...and they both connect to a target with same column, then sort by the target's y
              if (link1.source.column === link2.source.column) {
                return link1.source.y1 - link2.source.y1;
              } else {
                // ...and they connect to different column targets, then sort by how far back they
                return link1.source.column - link2.source.column;
              }
            } else if (link1.circularLinkType === link2.circularLinkType && link1.circularLinkType == 'bottom') {
              // ...and they both loop the same way (both bottom)
              // ...and they both connect to a target with same column, then sort by the target's y
              if (link1.source.column === link2.source.column) {
                return link1.source.y1 - link2.source.y1;
              } else {
                // ...and they connect to different column targets, then sort by how far back they
                return link2.source.column - link1.source.column;
              }
            } else {
              // ...and they loop around different ways, the move top up and bottom down
              return link1.circularLinkType == 'top' ? -1 : 1;
            }
          }
        });
      }

      // update y1 for links
      var yTargetOffset = node.y0;

      nodesTargetLinks.forEach(function (link) {
        link.y1 = yTargetOffset + link.width / 2;
        yTargetOffset = yTargetOffset + link.width;
      });

      // correct any circular bottom links so they are at the bottom of the node
      nodesTargetLinks.forEach(function (link, i) {
        if (link.circularLinkType == 'bottom') {
          var j = i + 1;
          var offsetFromBottom = 0;
          // sum the widths of any links that are below this link
          for (j; j < nodesTargetLinksLength; j++) {
            offsetFromBottom = offsetFromBottom + nodesTargetLinks[j].width;
          }
          link.y1 = node.y1 - offsetFromBottom - link.width / 2;
        }
      });
    });
  }

  // create a d path using the circularPathData
  function createCircularPathString(link) {
        var pathString = '';

        if (link.circularLinkType == 'top') {
              pathString =
              // start at the right of the source node
              'M' + link.circularPathData.sourceX + ' ' + link.circularPathData.sourceY + ' ' +
              // line right to buffer point
              'L' + link.circularPathData.leftInnerExtent + ' ' + link.circularPathData.sourceY + ' ' +
              // Arc around: Centre of arc X and  //Centre of arc Y
              'A' + link.circularPathData.leftLargeArcRadius + ' ' + link.circularPathData.leftSmallArcRadius + ' 0 0 0 ' +
              // End of arc X //End of arc Y
              link.circularPathData.leftFullExtent + ' ' + (link.circularPathData.sourceY - link.circularPathData.leftSmallArcRadius) + ' ' + // End of arc X
              // line up to buffer point
              'L' + link.circularPathData.leftFullExtent + ' ' + link.circularPathData.verticalLeftInnerExtent + ' ' +
              // Arc around: Centre of arc X and  //Centre of arc Y
              'A' + link.circularPathData.leftLargeArcRadius + ' ' + link.circularPathData.leftLargeArcRadius + ' 0 0 0 ' +
              // End of arc X //End of arc Y
              link.circularPathData.leftInnerExtent + ' ' + link.circularPathData.verticalFullExtent + ' ' + // End of arc X
              // line left to buffer point
              'L' + link.circularPathData.rightInnerExtent + ' ' + link.circularPathData.verticalFullExtent + ' ' +
              // Arc around: Centre of arc X and  //Centre of arc Y
              'A' + link.circularPathData.rightLargeArcRadius + ' ' + link.circularPathData.rightLargeArcRadius + ' 0 0 0 ' +
              // End of arc X //End of arc Y
              link.circularPathData.rightFullExtent + ' ' + link.circularPathData.verticalRightInnerExtent + ' ' + // End of arc X
              // line down
              'L' + link.circularPathData.rightFullExtent + ' ' + (link.circularPathData.targetY - link.circularPathData.rightSmallArcRadius) + ' ' +
              // Arc around: Centre of arc X and  //Centre of arc Y
              'A' + link.circularPathData.rightLargeArcRadius + ' ' + link.circularPathData.rightSmallArcRadius + ' 0 0 0 ' +
              // End of arc X //End of arc Y
              link.circularPathData.rightInnerExtent + ' ' + link.circularPathData.targetY + ' ' + // End of arc X
              // line to end
              'L' + link.circularPathData.targetX + ' ' + link.circularPathData.targetY;
        } else {
              // bottom path
              pathString =
              // start at the right of the source node
              'M' + link.circularPathData.sourceX + ' ' + link.circularPathData.sourceY + ' ' +
              // line right to buffer point
              'L' + link.circularPathData.leftInnerExtent + ' ' + link.circularPathData.sourceY + ' ' +
              // Arc around: Centre of arc X and  //Centre of arc Y
              'A' + link.circularPathData.leftLargeArcRadius + ' ' + link.circularPathData.leftSmallArcRadius + ' 0 0 1 ' +
              // End of arc X //End of arc Y
              link.circularPathData.leftFullExtent + ' ' + (link.circularPathData.sourceY + link.circularPathData.leftSmallArcRadius) + ' ' + // End of arc X
              // line down to buffer point
              'L' + link.circularPathData.leftFullExtent + ' ' + link.circularPathData.verticalLeftInnerExtent + ' ' +
              // Arc around: Centre of arc X and  //Centre of arc Y
              'A' + link.circularPathData.leftLargeArcRadius + ' ' + link.circularPathData.leftLargeArcRadius + ' 0 0 1 ' +
              // End of arc X //End of arc Y
              link.circularPathData.leftInnerExtent + ' ' + link.circularPathData.verticalFullExtent + ' ' + // End of arc X
              // line left to buffer point
              'L' + link.circularPathData.rightInnerExtent + ' ' + link.circularPathData.verticalFullExtent + ' ' +
              // Arc around: Centre of arc X and  //Centre of arc Y
              'A' + link.circularPathData.rightLargeArcRadius + ' ' + link.circularPathData.rightLargeArcRadius + ' 0 0 1 ' +
              // End of arc X //End of arc Y
              link.circularPathData.rightFullExtent + ' ' + link.circularPathData.verticalRightInnerExtent + ' ' + // End of arc X
              // line up
              'L' + link.circularPathData.rightFullExtent + ' ' + (link.circularPathData.targetY + link.circularPathData.rightSmallArcRadius) + ' ' +
              // Arc around: Centre of arc X and  //Centre of arc Y
              'A' + link.circularPathData.rightLargeArcRadius + ' ' + link.circularPathData.rightSmallArcRadius + ' 0 0 1 ' +
              // End of arc X //End of arc Y
              link.circularPathData.rightInnerExtent + ' ' + link.circularPathData.targetY + ' ' + // End of arc X
              // line to end
              'L' + link.circularPathData.targetX + ' ' + link.circularPathData.targetY;
        }

        return pathString;
  }

  // return the distance between the link's target and source node,
  // in terms of the nodes' column
  function linkColumnDistance(link) {
    return link.target.column - link.source.column;
  }

  // sort descending links by their source vertical position, y0
  function sortLinkSourceYDescending(link1, link2) {
    return link2.y0 - link1.y0;
  }

  // sort ascending links by their source vertical position, y0
  function sortLinkSourceYAscending(link1, link2) {
    return link1.y0 - link2.y0;
  }

  // sort links based on the distance between the source and tartget node columns
  // if the same, then use Y position of the source node
  function sortLinkColumnAscending(link1, link2) {
    if (linkColumnDistance(link1) == linkColumnDistance(link2)) {
      return link1.circularLinkType == 'bottom' ? sortLinkSourceYDescending(link1, link2) : sortLinkSourceYAscending(link1, link2);
    } else {
      return linkColumnDistance(link2) - linkColumnDistance(link1);
    }
  }

  // check if link is self linking, ie links a node to the same node
  function selfLinking(link, id) {
    return getNodeID(link.source, id) == getNodeID(link.target, id);
  }

  // Check if two circular links potentially overlap
  function circularLinksCross(link1, link2) {
    if (link1.source.column < link2.target.column) {
      return false;
    } else if (link1.target.column > link2.source.column) {
      return false;
    } else {
      return true;
    }
  }

  // Check if a circular link is the only circular link for both its source and target node
  function onlyCircularLink(link) {
    var nodeSourceLinks = link.source.sourceLinks;
    var sourceCount = 0;
    nodeSourceLinks.forEach(function (l) {
      sourceCount = l.circular ? sourceCount + 1 : sourceCount;
    });

    var nodeTargetLinks = link.target.targetLinks;
    var targetCount = 0;
    nodeTargetLinks.forEach(function (l) {
      targetCount = l.circular ? targetCount + 1 : targetCount;
    });

    if (sourceCount > 1 || targetCount > 1) {
      return false;
    } else {
      return true;
    }
  }

  // creates vertical buffer values per set of top/bottom links
  function calcVerticalBuffer(links, circularLinkGap, id) {
    links.sort(sortLinkColumnAscending);
    links.forEach(function (link, i) {
      var buffer = 0;

      if (selfLinking(link, id) && onlyCircularLink(link)) {
        link.circularPathData.verticalBuffer = buffer + link.width / 2;
      } else {
        var j = 0;
        for (j; j < i; j++) {
          if (circularLinksCross(links[i], links[j])) {
            var bufferOverThisLink = links[j].circularPathData.verticalBuffer + links[j].width / 2 + circularLinkGap;
            buffer = bufferOverThisLink > buffer ? bufferOverThisLink : buffer;
          }
        }

        link.circularPathData.verticalBuffer = buffer + link.width / 2;
      }
    });

    return links;
  }

  // sort descending links by their target vertical position, y1
  function sortLinkTargetYDescending(link1, link2) {
    return link2.y1 - link1.y1;
  }

  // sort ascending links by their target vertical position, y1
  function sortLinkTargetYAscending(link1, link2) {
    return link1.y1 - link2.y1;
  }

  // calculate the optimum path for a link to reduce overlaps
  function addCircularPathData(graph, circularLinkGap, y1, id, baseRadius, verticalMargin) {
    //var baseRadius = 10
    var buffer = 5;
    //var verticalMargin = 25

    var minY = d3Array.min(graph.links, function (link) {
      return link.source.y0;
    });

    // create object for circular Path Data
    graph.links.forEach(function (link) {
      if (link.circular) {
        link.circularPathData = {};
      }
    });

    // calc vertical offsets per top/bottom links
    var topLinks = graph.links.filter(function (l) {
      return l.circularLinkType == 'top';
    });
    topLinks = calcVerticalBuffer(topLinks, circularLinkGap, id);

    var bottomLinks = graph.links.filter(function (l) {
      return l.circularLinkType == 'bottom';
    });
    bottomLinks = calcVerticalBuffer(bottomLinks, circularLinkGap, id);

    // add the base data for each link
    graph.links.forEach(function (link) {
      if (link.circular) {
        link.circularPathData.arcRadius = link.width + baseRadius;
        link.circularPathData.leftNodeBuffer = buffer;
        link.circularPathData.rightNodeBuffer = buffer;
        link.circularPathData.sourceWidth = link.source.x1 - link.source.x0;
        link.circularPathData.sourceX = link.source.x0 + link.circularPathData.sourceWidth;
        link.circularPathData.targetX = link.target.x0;
        link.circularPathData.sourceY = link.y0;
        link.circularPathData.targetY = link.y1;

        // for self linking paths, and that the only circular link in/out of that node
        if (selfLinking(link, id) && onlyCircularLink(link)) {
          link.circularPathData.leftSmallArcRadius = baseRadius + link.width / 2;
          link.circularPathData.leftLargeArcRadius = baseRadius + link.width / 2;
          link.circularPathData.rightSmallArcRadius = baseRadius + link.width / 2;
          link.circularPathData.rightLargeArcRadius = baseRadius + link.width / 2;

          if (link.circularLinkType == 'bottom') {
            link.circularPathData.verticalFullExtent = link.source.y1 + verticalMargin + link.circularPathData.verticalBuffer;
            link.circularPathData.verticalLeftInnerExtent = link.circularPathData.verticalFullExtent - link.circularPathData.leftLargeArcRadius;
            link.circularPathData.verticalRightInnerExtent = link.circularPathData.verticalFullExtent - link.circularPathData.rightLargeArcRadius;
          } else {
            // top links
            link.circularPathData.verticalFullExtent = link.source.y0 - verticalMargin - link.circularPathData.verticalBuffer;
            link.circularPathData.verticalLeftInnerExtent = link.circularPathData.verticalFullExtent + link.circularPathData.leftLargeArcRadius;
            link.circularPathData.verticalRightInnerExtent = link.circularPathData.verticalFullExtent + link.circularPathData.rightLargeArcRadius;
          }
        } else {
          // else calculate normally
          // add left extent coordinates, based on links with same source column and circularLink type
          var thisColumn = link.source.column;
          var thisCircularLinkType = link.circularLinkType;
          var sameColumnLinks = graph.links.filter(function (l) {
            return l.source.column == thisColumn && l.circularLinkType == thisCircularLinkType;
          });

          if (link.circularLinkType == 'bottom') {
            sameColumnLinks.sort(sortLinkSourceYDescending);
          } else {
            sameColumnLinks.sort(sortLinkSourceYAscending);
          }

          var radiusOffset = 0;
          sameColumnLinks.forEach(function (l, i) {
            if (l.circularLinkID == link.circularLinkID) {
              link.circularPathData.leftSmallArcRadius = baseRadius + link.width / 2 + radiusOffset;
              link.circularPathData.leftLargeArcRadius = baseRadius + link.width / 2 + i * circularLinkGap + radiusOffset;
            }
            radiusOffset = radiusOffset + l.width;
          });

          // add right extent coordinates, based on links with same target column and circularLink type
          thisColumn = link.target.column;
          sameColumnLinks = graph.links.filter(function (l) {
            return l.target.column == thisColumn && l.circularLinkType == thisCircularLinkType;
          });
          if (link.circularLinkType == 'bottom') {
            sameColumnLinks.sort(sortLinkTargetYDescending);
          } else {
            sameColumnLinks.sort(sortLinkTargetYAscending);
          }

          radiusOffset = 0;
          sameColumnLinks.forEach(function (l, i) {
            if (l.circularLinkID == link.circularLinkID) {
              link.circularPathData.rightSmallArcRadius = baseRadius + link.width / 2 + radiusOffset;
              link.circularPathData.rightLargeArcRadius = baseRadius + link.width / 2 + i * circularLinkGap + radiusOffset;
            }
            radiusOffset = radiusOffset + l.width;
          });

          // bottom links
          if (link.circularLinkType == 'bottom') {
            link.circularPathData.verticalFullExtent = y1 + verticalMargin + link.circularPathData.verticalBuffer;
            link.circularPathData.verticalLeftInnerExtent = link.circularPathData.verticalFullExtent - link.circularPathData.leftLargeArcRadius;
            link.circularPathData.verticalRightInnerExtent = link.circularPathData.verticalFullExtent - link.circularPathData.rightLargeArcRadius;
          } else {
            // top links
            link.circularPathData.verticalFullExtent = minY - verticalMargin - link.circularPathData.verticalBuffer;
            link.circularPathData.verticalLeftInnerExtent = link.circularPathData.verticalFullExtent + link.circularPathData.leftLargeArcRadius;
            link.circularPathData.verticalRightInnerExtent = link.circularPathData.verticalFullExtent + link.circularPathData.rightLargeArcRadius;
          }
        }

        // all links
        link.circularPathData.leftInnerExtent = link.circularPathData.sourceX + link.circularPathData.leftNodeBuffer;
        link.circularPathData.rightInnerExtent = link.circularPathData.targetX - link.circularPathData.rightNodeBuffer;
        link.circularPathData.leftFullExtent = link.circularPathData.sourceX + link.circularPathData.leftLargeArcRadius + link.circularPathData.leftNodeBuffer;
        link.circularPathData.rightFullExtent = link.circularPathData.targetX - link.circularPathData.rightLargeArcRadius - link.circularPathData.rightNodeBuffer;
      }

      if (link.circular) {
        link.path = createCircularPathString(link);
      } else {
        var normalPath = d3Shape.linkHorizontal().source(function (d) {
          var x = d.source.x0 + (d.source.x1 - d.source.x0);
          var y = d.y0;
          return [x, y];
        }).target(function (d) {
          var x = d.target.x0;
          var y = d.y1;
          return [x, y];
        });
        link.path = normalPath(link);
      }
    });
  }

  // check if two nodes overlap
  function nodesOverlap(nodeA, nodeB) {
    // test if nodeA top partially overlaps nodeB
    if (nodeA.y0 > nodeB.y0 && nodeA.y0 < nodeB.y1) {
      return true;
    } else if (nodeA.y1 > nodeB.y0 && nodeA.y1 < nodeB.y1) {
      // test if nodeA bottom partially overlaps nodeB
      return true;
    } else if (nodeA.y0 < nodeB.y0 && nodeA.y1 > nodeB.y1) {
      // test if nodeA covers nodeB
      return true;
    } else {
      return false;
    }
  }

  // sort nodes' breadth (ie top to bottom in a column)
  // if both nodes have circular links, or both don't have circular links, then sort by the top (y0) of the node
  // else push nodes that have top circular links to the top, and nodes that have bottom circular links to the bottom
  function ascendingBreadth(a, b) {
    if (a.partOfCycle === b.partOfCycle) {
      return a.y0 - b.y0;
    } else {
      if (a.circularLinkType === 'top' || b.circularLinkType === 'bottom') {
        return -1;
      } else {
        return 1;
      }
    }
  }

  // Return the Y coordinate on the longerLink path *
  // which is perpendicular shorterLink's source.
  //
  // * approx, based on a straight line from target to source,
  // when in fact the path is a bezier
  function linkPerpendicularYToLinkTarget(longerLink, shorterLink) {
    // get the angle for the longer link
    var angle = linkAngle(longerLink);

    // get the adjacent length to the other link's x position
    var heightFromY1ToPependicular = linkXLength(shorterLink) / Math.tan(angle);

    // add or subtract from longer link's original y1, depending on the slope
    var yPerpendicular = incline(longerLink) == 'up' ? longerLink.y1 - heightFromY1ToPependicular : longerLink.y1 + heightFromY1ToPependicular;

    return yPerpendicular;
  }

  // sort and set the links' y0 for each node
  function sortSourceLinks(graph, y1, id) {
    graph.nodes.forEach(function (node) {
      // move any nodes up which are off the bottom
      if (node.y + (node.y1 - node.y0) > y1) {
        node.y = node.y - (node.y + (node.y1 - node.y0) - y1);
      }

      var nodesSourceLinks = graph.links.filter(function (l) {
        return getNodeID(l.source, id) == getNodeID(node, id);
      });

      var nodeSourceLinksLength = nodesSourceLinks.length;

      // if more than 1 link then sort
      if (nodeSourceLinksLength > 1) {
        nodesSourceLinks.sort(function (link1, link2) {
          // if both are not circular...
          if (!link1.circular && !link2.circular) {
            // if the target nodes are the same column, then sort by the link's target y
            if (link1.target.column == link2.target.column) {
              return link1.y1 - link2.y1;
            } else if (!sameInclines(link1, link2)) {
              // if the links slope in different directions, then sort by the link's target y
              return link1.y1 - link2.y1;

              // if the links slope in same directions, then sort by any overlap
            } else {
              if (link1.target.column > link2.target.column) {
                var link2Adj = linkPerpendicularYToLinkTarget(link2, link1);
                return link1.y1 - link2Adj;
              }
              if (link2.target.column > link1.target.column) {
                var link1Adj = linkPerpendicularYToLinkTarget(link1, link2);
                return link1Adj - link2.y1;
              }
            }
          }

          // if only one is circular, the move top links up, or bottom links down
          if (link1.circular && !link2.circular) {
            return link1.circularLinkType == 'top' ? -1 : 1;
          } else if (link2.circular && !link1.circular) {
            return link2.circularLinkType == 'top' ? 1 : -1;
          }

          // if both links are circular...
          if (link1.circular && link2.circular) {
            // ...and they both loop the same way (both top)
            if (link1.circularLinkType === link2.circularLinkType && link1.circularLinkType == 'top') {
              // ...and they both connect to a target with same column, then sort by the target's y
              if (link1.target.column === link2.target.column) {
                return link1.target.y1 - link2.target.y1;
              } else {
                // ...and they connect to different column targets, then sort by how far back they
                return link2.target.column - link1.target.column;
              }
            } else if (link1.circularLinkType === link2.circularLinkType && link1.circularLinkType == 'bottom') {
              // ...and they both loop the same way (both bottom)
              // ...and they both connect to a target with same column, then sort by the target's y
              if (link1.target.column === link2.target.column) {
                return link2.target.y1 - link1.target.y1;
              } else {
                // ...and they connect to different column targets, then sort by how far back they
                return link1.target.column - link2.target.column;
              }
            } else {
              // ...and they loop around different ways, the move top up and bottom down
              return link1.circularLinkType == 'top' ? -1 : 1;
            }
          }
        });
      }

      // update y0 for links
      var ySourceOffset = node.y0;

      nodesSourceLinks.forEach(function (link) {
        link.y0 = ySourceOffset + link.width / 2;
        ySourceOffset = ySourceOffset + link.width;
      });

      // correct any circular bottom links so they are at the bottom of the node
      nodesSourceLinks.forEach(function (link, i) {
        if (link.circularLinkType == 'bottom') {
          var j = i + 1;
          var offsetFromBottom = 0;
          // sum the widths of any links that are below this link
          for (j; j < nodeSourceLinksLength; j++) {
            offsetFromBottom = offsetFromBottom + nodesSourceLinks[j].width;
          }
          link.y0 = node.y1 - offsetFromBottom - link.width / 2;
        }
      });
    });
  }

  // update a node, and its associated links, vertical positions (y0, y1)
  function adjustNodeHeight(node, dy, sankeyY0, sankeyY1) {
    if (node.y0 + dy >= sankeyY0 && node.y1 + dy <= sankeyY1) {
      node.y0 = node.y0 + dy;
      node.y1 = node.y1 + dy;

      node.targetLinks.forEach(function (l) {
        l.y1 = l.y1 + dy;
      });

      node.sourceLinks.forEach(function (l) {
        l.y0 = l.y0 + dy;
      });
    }
    return node;
  }

  // Move any nodes that overlap links which span 2+ columns
  function resolveNodeLinkOverlaps(graph, y0, y1, id) {
    graph.links.forEach(function (link) {
      if (link.circular) {
        return;
      }

      if (link.target.column - link.source.column > 1) {
        var columnToTest = link.source.column + 1;
        var maxColumnToTest = link.target.column - 1;

        var i = 1;
        var numberOfColumnsToTest = maxColumnToTest - columnToTest + 1;

        for (i = 1; columnToTest <= maxColumnToTest; columnToTest++, i++) {
          graph.nodes.forEach(function (node) {
            if (node.column == columnToTest) {
              var t = i / (numberOfColumnsToTest + 1);

              // Find all the points of a cubic bezier curve in javascript
              // https://stackoverflow.com/questions/15397596/find-all-the-points-of-a-cubic-bezier-curve-in-javascript

              var B0_t = Math.pow(1 - t, 3);
              var B1_t = 3 * t * Math.pow(1 - t, 2);
              var B2_t = 3 * Math.pow(t, 2) * (1 - t);
              var B3_t = Math.pow(t, 3);

              var py_t = B0_t * link.y0 + B1_t * link.y0 + B2_t * link.y1 + B3_t * link.y1;

              var linkY0AtColumn = py_t - link.width / 2;
              var linkY1AtColumn = py_t + link.width / 2;

              // If top of link overlaps node, push node up
              if (linkY0AtColumn > node.y0 && linkY0AtColumn < node.y1) {
                var dy = node.y1 - linkY0AtColumn + 10;
                dy = node.circularLinkType == 'bottom' ? dy : -dy;

                node = adjustNodeHeight(node, dy, y0, y1);

                // check if other nodes need to move up too
                graph.nodes.forEach(function (otherNode) {
                  // don't need to check itself or nodes at different columns
                  if (getNodeID(otherNode, id) == getNodeID(node, id) || otherNode.column != node.column) {
                    return;
                  }
                  if (nodesOverlap(node, otherNode)) {
                    adjustNodeHeight(otherNode, dy, y0, y1);
                  }
                });
              } else if (linkY1AtColumn > node.y0 && linkY1AtColumn < node.y1) {
                // If bottom of link overlaps node, push node down
                var dy = linkY1AtColumn - node.y0 + 10;

                node = adjustNodeHeight(node, dy, y0, y1);

                // check if other nodes need to move down too
                graph.nodes.forEach(function (otherNode) {
                  // don't need to check itself or nodes at different columns
                  if (getNodeID(otherNode, id) == getNodeID(node, id) || otherNode.column != node.column) {
                    return;
                  }
                  if (otherNode.y0 < node.y1 && otherNode.y1 > node.y1) {
                    adjustNodeHeight(otherNode, dy, y0, y1);
                  }
                });
              } else if (linkY0AtColumn < node.y0 && linkY1AtColumn > node.y1) {
                // if link completely overlaps node
                var dy = linkY1AtColumn - node.y0 + 10;

                node = adjustNodeHeight(node, dy, y0, y1);

                graph.nodes.forEach(function (otherNode) {
                  // don't need to check itself or nodes at different columns
                  if (getNodeID(otherNode, id) == getNodeID(node, id) || otherNode.column != node.column) {
                    return;
                  }
                  if (otherNode.y0 < node.y1 && otherNode.y1 > node.y1) {
                    adjustNodeHeight(otherNode, dy, y0, y1);
                  }
                });
              }
            }
          });
        }
      }
    });
  }

  // Return the number of circular links for node, not including self linking links
  function numberOfNonSelfLinkingCycles(node, id) {
    var sourceCount = 0;
    node.sourceLinks.forEach(function (l) {
      sourceCount = l.circular && !selfLinking(l, id) ? sourceCount + 1 : sourceCount;
    });

    var targetCount = 0;
    node.targetLinks.forEach(function (l) {
      targetCount = l.circular && !selfLinking(l, id) ? targetCount + 1 : targetCount;
    });

    return sourceCount + targetCount;
  }

  // Given a node, find all links for which this is a source in the current 'known' graph
  function findLinksOutward(node, graph) {
    var children = [];

    for (var i = 0; i < graph.length; i++) {
      if (node == graph[i].source) {
        children.push(graph[i]);
      }
    }

    return children;
  }

  // Checks if link creates a cycle
  function createsCycle(originalSource, nodeToCheck, graph, id) {
    // Check for self linking nodes
    if (getNodeID(originalSource, id) == getNodeID(nodeToCheck, id)) {
      return true;
    }

    if (graph.length == 0) {
      return false;
    }

    var nextLinks = findLinksOutward(nodeToCheck, graph);
    // leaf node check
    if (nextLinks.length == 0) {
      return false;
    }

    // cycle check
    for (var i = 0; i < nextLinks.length; i++) {
      var nextLink = nextLinks[i];

      if (nextLink.target === originalSource) {
        return true;
      }

      // Recurse
      if (createsCycle(originalSource, nextLink.target, graph, id)) {
        return true;
      }
    }

    // Exhausted all links
    return false;
  }

  // Assign a circular link type (top or bottom), based on:
  // - if the source/target node already has circular links, then use the same type
  // - if not, choose the type with fewer links
  function selectCircularLinkTypes(graph, id) {
    var numberOfTops = 0;
    var numberOfBottoms = 0;
    graph.links.forEach(function (link) {
      if (link.circular) {
        // if either souce or target has type already use that
        if (link.source.circularLinkType || link.target.circularLinkType) {
          // default to source type if available
          link.circularLinkType = link.source.circularLinkType ? link.source.circularLinkType : link.target.circularLinkType;
        } else {
          link.circularLinkType = numberOfTops < numberOfBottoms ? 'top' : 'bottom';
        }

        if (link.circularLinkType == 'top') {
          numberOfTops = numberOfTops + 1;
        } else {
          numberOfBottoms = numberOfBottoms + 1;
        }

        graph.nodes.forEach(function (node) {
          if (getNodeID(node, id) == getNodeID(link.source, id) || getNodeID(node, id) == getNodeID(link.target, id)) {
            node.circularLinkType = link.circularLinkType;
          }
        });
      }
    });

    //correct self-linking links to be same direction as node
    graph.links.forEach(function (link) {
      if (link.circular) {
        //if both source and target node are same type, then link should have same type
        if (link.source.circularLinkType == link.target.circularLinkType) {
          link.circularLinkType = link.source.circularLinkType;
        }
        //if link is self-linking, then link should have same type as node
        if (selfLinking(link, id)) {
          link.circularLinkType = link.source.circularLinkType;
        }
      }
    });
  }

  // Identify circles in the link objects
  function identifyCircles(inputGraph, id) {
    var graph = cloneDeep_1(inputGraph);
    var addedLinks = [];
    var circularLinkID = 0;
    graph.links.forEach(function (link) {
      if (createsCycle(link.source, link.target, addedLinks, id)) {
        link.circular = true;
        link.circularLinkID = circularLinkID;
        circularLinkID = circularLinkID + 1;
      } else {
        link.circular = false;
        addedLinks.push(link);
      }
    });
    return graph;
  }

  // Return the node from the collection that matches the provided ID,
  // or throw an error if no match
  function find(nodeById, id) {
    var node = nodeById.get(id);
    if (!node) throw new Error('missing: ' + id);
    return node;
  }

  // Populate the sourceLinks and targetLinks for each node.
  // Also, if the source and target are not objects, assume they are indices.
  function computeNodeLinks(inputGraph, id) {
    var graph = cloneDeep_1(inputGraph);
    graph.nodes.forEach(function (node, i) {
      node.index = i;
      node.sourceLinks = [];
      node.targetLinks = [];
    });
    var nodeById = d3Collection.map(graph.nodes, id);
    graph.links.forEach(function (link, i) {
      link.index = i;
      var source = link.source;
      var target = link.target;
      if ((typeof source === 'undefined' ? 'undefined' : _typeof(source)) !== 'object') {
        source = link.source = find(nodeById, source);
      }
      if ((typeof target === 'undefined' ? 'undefined' : _typeof(target)) !== 'object') {
        target = link.target = find(nodeById, target);
      }
      source.sourceLinks.push(link);
      target.targetLinks.push(link);
    });
    return graph;
  }

  // https://github.com/tomshanley/d3-sankeyCircular-circular

  // sort links' breadth (ie top to bottom in a column),
  // based on their source nodes' breadths
  function ascendingSourceBreadth(a, b) {
    return ascendingBreadth(a.source, b.source) || a.index - b.index;
  }

  // sort links' breadth (ie top to bottom in a column),
  // based on their target nodes' breadths
  function ascendingTargetBreadth(a, b) {
    return ascendingBreadth(a.target, b.target) || a.index - b.index;
  }

  // return the value of a node or link
  function value(d) {
    return d.value;
  }

  // return the vertical center of a node
  function nodeCenter(node) {
    return (node.y0 + node.y1) / 2;
  }

  // return the vertical center of a link's source node
  function linkSourceCenter(link) {
    return nodeCenter(link.source);
  }
  // return the vertical center of a link's target node
  function linkTargetCenter(link) {
    return nodeCenter(link.target);
  }

  /* function weightedSource (link) {
      return nodeCenter(link.source) * link.value
    } */

  /* function weightedTarget (link) {
      return nodeCenter(link.target) * link.value
    } */

  // Return the default value for ID for node, d.index
  function defaultId(d) {
    return d.index;
  }

  // Return the default object the graph's nodes, graph.nodes
  function defaultNodes(graph) {
    return graph.nodes;
  }

  // Return the default object the graph's nodes, graph.links
  function defaultLinks(graph) {
    return graph.links;
  }

  // The main sankeyCircular functions

  // Some constants for circular link calculations
  var verticalMargin = 25;
  var baseRadius = 10;

  //Possibly let user control this,
  // although anything over 0.5 starts to get too cramped
  var scale = 0.3;

  function sankeyCircular () {
    // Set the default values
    var x0 = 0,
        y0 = 0,
        x1 = 1,
        y1 = 1,
        // extent
    dx = 24,
        // nodeWidth
    py,
        // nodePadding, for vertical postioning
    id = defaultId,
        align = justify,
        nodes = defaultNodes,
        links = defaultLinks,
        iterations = 32,
        circularLinkGap = 2,
        paddingRatio;

    function sankeyCircular() {
      var graph = {
        nodes: nodes.apply(null, arguments),
        links: links.apply(null, arguments)

        // Process the graph's nodes and links, setting their positions

        // 1.  Associate the nodes with their respective links, and vice versa
      };graph = computeNodeLinks(graph, id);

      // 2.  Determine which links result in a circular path in the graph
      graph = identifyCircles(graph, id);

      // 4. Calculate the nodes' values, based on the values
      // of the incoming and outgoing links
      computeNodeValues(graph);

      // 5.  Calculate the nodes' depth based on the incoming and outgoing links
      //     Sets the nodes':
      //     - depth:  the depth in the graph
      //     - column: the depth (0, 1, 2, etc), as is relates to visual position from left to right
      //     - x0, x1: the x coordinates, as is relates to visual position from left to right
      computeNodeDepths(graph);

      // 3.  Determine how the circular links will be drawn,
      //     either travelling back above the main chart ("top")
      //     or below the main chart ("bottom")
      selectCircularLinkTypes(graph, id);

      // 6.  Calculate the nodes' and links' vertical position within their respective column
      //     Also readjusts sankeyCircular size if circular links are needed, and node x's
      computeNodeBreadths(graph, iterations, id);
      computeLinkBreadths(graph);

      // 7.  Sort links per node, based on the links' source/target nodes' breadths
      // 8.  Adjust nodes that overlap links that span 2+ columns

      //Possibly let user control this number, like the iterations over node placement
      var linkSortingIterations = 4;
      for (var iteration = 0; iteration < linkSortingIterations; iteration++) {
        sortSourceLinks(graph, y1, id);
        sortTargetLinks(graph, y1, id);
        resolveNodeLinkOverlaps(graph, y0, y1, id);
        sortSourceLinks(graph, y1, id);
        sortTargetLinks(graph, y1, id);
      }

      // 8.1  Adjust node and link positions back to fill height of chart area if compressed
      fillHeight(graph, y0, y1);

      // 9. Calculate visually appealling path for the circular paths, and create the "d" string
      addCircularPathData(graph, circularLinkGap, y1, id, baseRadius, verticalMargin);

      return graph;
    } // end of sankeyCircular function

    // Set the sankeyCircular parameters
    // nodeID, nodeAlign, nodeWidth, nodePadding, nodes, links, size, extent,
    // iterations, nodePaddingRatio, circularLinkGap
    sankeyCircular.nodeId = function (_) {
      return arguments.length ? (id = typeof _ === 'function' ? _ : constant(_), sankeyCircular) : id;
    };

    sankeyCircular.nodeAlign = function (_) {
      return arguments.length ? (align = typeof _ === 'function' ? _ : constant(_), sankeyCircular) : align;
    };

    sankeyCircular.nodeWidth = function (_) {
      return arguments.length ? (dx = +_, sankeyCircular) : dx;
    };

    sankeyCircular.nodePadding = function (_) {
      return arguments.length ? (py = +_, sankeyCircular) : py;
    };

    sankeyCircular.nodes = function (_) {
      return arguments.length ? (nodes = typeof _ === 'function' ? _ : constant(_), sankeyCircular) : nodes;
    };

    sankeyCircular.links = function (_) {
      return arguments.length ? (links = typeof _ === 'function' ? _ : constant(_), sankeyCircular) : links;
    };

    sankeyCircular.size = function (_) {
      return arguments.length ? (x0 = y0 = 0, x1 = +_[0], y1 = +_[1], sankeyCircular) : [x1 - x0, y1 - y0];
    };

    sankeyCircular.extent = function (_) {
      return arguments.length ? (x0 = +_[0][0], x1 = +_[1][0], y0 = +_[0][1], y1 = +_[1][1], sankeyCircular) : [[x0, y0], [x1, y1]];
    };

    sankeyCircular.iterations = function (_) {
      return arguments.length ? (iterations = +_, sankeyCircular) : iterations;
    };

    sankeyCircular.circularLinkGap = function (_) {
      return arguments.length ? (circularLinkGap = +_, sankeyCircular) : circularLinkGap;
    };

    sankeyCircular.nodePaddingRatio = function (_) {
      return arguments.length ? (paddingRatio = +_, sankeyCircular) : paddingRatio;
    };

    // Compute the value (size) and cycleness of each node by summing the associated links.
    function computeNodeValues(graph) {
      graph.nodes.forEach(function (node) {
        node.partOfCycle = false;
        node.value = Math.max(d3Array.sum(node.sourceLinks, value), d3Array.sum(node.targetLinks, value));
        node.sourceLinks.forEach(function (link) {
          if (link.circular) {
            node.partOfCycle = true;
            node.circularLinkType = link.circularLinkType;
          }
        });
        node.targetLinks.forEach(function (link) {
          if (link.circular) {
            node.partOfCycle = true;
            node.circularLinkType = link.circularLinkType;
          }
        });
      });
    }

    function getCircleMargins(graph) {
      var totalTopLinksWidth = 0,
          totalBottomLinksWidth = 0,
          totalRightLinksWidth = 0,
          totalLeftLinksWidth = 0;

      var maxColumn = d3Array.max(graph.nodes, function (node) {
        return node.column;
      });

      graph.links.forEach(function (link) {
        if (link.circular) {
          if (link.circularLinkType == 'top') {
            totalTopLinksWidth = totalTopLinksWidth + link.width;
          } else {
            totalBottomLinksWidth = totalBottomLinksWidth + link.width;
          }

          if (link.target.column == 0) {
            totalLeftLinksWidth = totalLeftLinksWidth + link.width;
          }

          if (link.source.column == maxColumn) {
            totalRightLinksWidth = totalRightLinksWidth + link.width;
          }
        }
      });

      //account for radius of curves and padding between links
      totalTopLinksWidth = totalTopLinksWidth > 0 ? totalTopLinksWidth + verticalMargin + baseRadius : totalTopLinksWidth;
      totalBottomLinksWidth = totalBottomLinksWidth > 0 ? totalBottomLinksWidth + verticalMargin + baseRadius : totalBottomLinksWidth;
      totalRightLinksWidth = totalRightLinksWidth > 0 ? totalRightLinksWidth + verticalMargin + baseRadius : totalRightLinksWidth;
      totalLeftLinksWidth = totalLeftLinksWidth > 0 ? totalLeftLinksWidth + verticalMargin + baseRadius : totalLeftLinksWidth;

      return {
        top: totalTopLinksWidth,
        bottom: totalBottomLinksWidth,
        left: totalLeftLinksWidth,
        right: totalRightLinksWidth
      };
    }

    // Update the x0, y0, x1 and y1 for the sankeyCircular, to allow space for any circular links
    function scaleSankeySize(graph, margin) {
      var maxColumn = d3Array.max(graph.nodes, function (node) {
        return node.column;
      });

      var currentWidth = x1 - x0;
      var currentHeight = y1 - y0;

      var newWidth = currentWidth + margin.right + margin.left;
      var newHeight = currentHeight + margin.top + margin.bottom;

      var scaleX = currentWidth / newWidth;
      var scaleY = currentHeight / newHeight;

      x0 = x0 * scaleX + margin.left;
      x1 = margin.right == 0 ? x1 : x1 * scaleX;
      y0 = y0 * scaleY + margin.top;
      y1 = y1 * scaleY;

      graph.nodes.forEach(function (node) {
        node.x0 = x0 + node.column * ((x1 - x0 - dx) / maxColumn);
        node.x1 = node.x0 + dx;
      });

      return scaleY;
    }

    // Iteratively assign the depth for each node.
    // Nodes are assigned the maximum depth of incoming neighbors plus one;
    // nodes with no incoming links are assigned depth zero, while
    // nodes with no outgoing links are assigned the maximum depth.
    function computeNodeDepths(graph) {
      var nodes, next, x;

      for (nodes = graph.nodes, next = [], x = 0; nodes.length; ++x, nodes = next, next = []) {
        nodes.forEach(function (node) {
          node.depth = x;
          node.sourceLinks.forEach(function (link) {
            if (next.indexOf(link.target) < 0 && !link.circular) {
              next.push(link.target);
            }
          });
        });
      }

      for (nodes = graph.nodes, next = [], x = 0; nodes.length; ++x, nodes = next, next = []) {
        nodes.forEach(function (node) {
          node.height = x;
          node.targetLinks.forEach(function (link) {
            if (next.indexOf(link.source) < 0 && !link.circular) {
              next.push(link.source);
            }
          });
        });
      }

      // assign column numbers, and get max value
      graph.nodes.forEach(function (node) {
        node.column = Math.floor(align.call(null, node, x));
      });
    }

    // Assign nodes' breadths, and then shift nodes that overlap (resolveCollisions)
    function computeNodeBreadths(graph, iterations, id) {
      var columns = d3Collection.nest().key(function (d) {
        return d.column;
      }).sortKeys(d3Array.ascending).entries(graph.nodes).map(function (d) {
        return d.values;
      });

      initializeNodeBreadth(id);
      resolveCollisions();

      for (var alpha = 1, n = iterations; n > 0; --n) {
        relaxLeftAndRight(alpha *= 0.99, id);
        resolveCollisions();
      }

      function initializeNodeBreadth(id) {
        //override py if nodePadding has been set
        if (paddingRatio) {
          var padding = Infinity;
          columns.forEach(function (nodes) {
            var thisPadding = y1 * paddingRatio / (nodes.length + 1);
            padding = thisPadding < padding ? thisPadding : padding;
          });
          py = padding;
        }

        var ky = d3Array.min(columns, function (nodes) {
          return (y1 - y0 - (nodes.length - 1) * py) / d3Array.sum(nodes, value);
        });

        //calculate the widths of the links
        ky = ky * scale;

        graph.links.forEach(function (link) {
          link.width = link.value * ky;
        });

        //determine how much to scale down the chart, based on circular links
        var margin = getCircleMargins(graph);
        var ratio = scaleSankeySize(graph, margin);

        //re-calculate widths
        ky = ky * ratio;

        graph.links.forEach(function (link) {
          link.width = link.value * ky;
        });

        columns.forEach(function (nodes) {
          var nodesLength = nodes.length;
          nodes.forEach(function (node, i) {
            if (node.depth == columns.length - 1 && nodesLength == 1) {
              node.y0 = y1 / 2 - node.value * ky;
              node.y1 = node.y0 + node.value * ky;
            } else if (node.depth == 0 && nodesLength == 1) {
              node.y0 = y1 / 2 - node.value * ky;
              node.y1 = node.y0 + node.value * ky;
            } else if (node.partOfCycle) {
              if (numberOfNonSelfLinkingCycles(node, id) == 0) {
                node.y0 = y1 / 2 + i;
                node.y1 = node.y0 + node.value * ky;
              } else if (node.circularLinkType == 'top') {
                node.y0 = y0 + i;
                node.y1 = node.y0 + node.value * ky;
              } else {
                node.y0 = y1 - node.value * ky - i;
                node.y1 = node.y0 + node.value * ky;
              }
            } else {
              if (margin.top == 0 || margin.bottom == 0) {
                node.y0 = (y1 - y0) / nodesLength * i;
                node.y1 = node.y0 + node.value * ky;
              } else {
                node.y0 = (y1 - y0) / 2 - nodesLength / 2 + i;
                node.y1 = node.y0 + node.value * ky;
              }
            }
          });
        });
      }

      // For each node in each column,
      // check the node's vertical position in relation to
      // its target's and source's vertical position
      // and shift up/down to be closer to
      // the vertical middle of those targets and sources
      function relaxLeftAndRight(alpha, id) {
        var columnsLength = columns.length;

        columns.forEach(function (nodes, i) {
          var n = nodes.length;
          var depth = nodes[0].depth;

          nodes.forEach(function (node) {
            // check the node is not an orphan
            if (node.sourceLinks.length || node.targetLinks.length) {
              if (node.partOfCycle && numberOfNonSelfLinkingCycles(node, id) > 0) ; else if (depth == 0 && n == 1) {
                var nodeHeight = node.y1 - node.y0;

                node.y0 = y1 / 2 - nodeHeight / 2;
                node.y1 = y1 / 2 + nodeHeight / 2;
              } else if (depth == columnsLength - 1 && n == 1) {
                var nodeHeight = node.y1 - node.y0;

                node.y0 = y1 / 2 - nodeHeight / 2;
                node.y1 = y1 / 2 + nodeHeight / 2;
              } else {
                var avg = 0;

                var avgTargetY = d3Array.mean(node.sourceLinks, linkTargetCenter);
                var avgSourceY = d3Array.mean(node.targetLinks, linkSourceCenter);

                if (avgTargetY && avgSourceY) {
                  avg = (avgTargetY + avgSourceY) / 2;
                } else {
                  avg = avgTargetY || avgSourceY;
                }

                var dy = (avg - nodeCenter(node)) * alpha;
                // positive if it node needs to move down
                node.y0 += dy;
                node.y1 += dy;
              }
            }
          });
        });
      }

      // For each column, check if nodes are overlapping, and if so, shift up/down
      function resolveCollisions() {
        columns.forEach(function (nodes) {
          var node,
              dy,
              y = y0,
              n = nodes.length,
              i;

          // Push any overlapping nodes down.
          nodes.sort(ascendingBreadth);

          for (i = 0; i < n; ++i) {
            node = nodes[i];
            dy = y - node.y0;

            if (dy > 0) {
              node.y0 += dy;
              node.y1 += dy;
            }
            y = node.y1 + py;
          }

          // If the bottommost node goes outside the bounds, push it back up.
          dy = y - py - y1;
          if (dy > 0) {
  y = node.y0 -= dy, node.y1 -= dy;

            // Push any overlapping nodes back up.
            for (i = n - 2; i >= 0; --i) {
              node = nodes[i];
              dy = node.y1 + py - y;
              if (dy > 0) node.y0 -= dy, node.y1 -= dy;
              y = node.y0;
            }
          }
        });
      }
    }

    // Assign the links y0 and y1 based on source/target nodes position,
    // plus the link's relative position to other links to the same node
    function computeLinkBreadths(graph) {
      graph.nodes.forEach(function (node) {
        node.sourceLinks.sort(ascendingTargetBreadth);
        node.targetLinks.sort(ascendingSourceBreadth);
      });
      graph.nodes.forEach(function (node) {
        var y0 = node.y0;
        var y1 = y0;

        // start from the bottom of the node for cycle links
        var y0cycle = node.y1;
        var y1cycle = y0cycle;

        node.sourceLinks.forEach(function (link) {
          if (link.circular) {
            link.y0 = y0cycle - link.width / 2;
            y0cycle = y0cycle - link.width;
          } else {
            link.y0 = y0 + link.width / 2;
            y0 += link.width;
          }
        });
        node.targetLinks.forEach(function (link) {
          if (link.circular) {
            link.y1 = y1cycle - link.width / 2;
            y1cycle = y1cycle - link.width;
          } else {
            link.y1 = y1 + link.width / 2;
            y1 += link.width;
          }
        });
      });
    }

    return sankeyCircular;
  }

  /// /////////////////////////////////////////////////////////////////////////////////
  // Cycle functions
  // portion of code to detect circular links based on Colin Fergus'
  // bl.ock https://gist.github.com/cfergus/3956043

  /// ////////////////////////////////////////////////////////////////////////////

  /*exports.sankeyCircular = sankeyCircular
    exports.sankeyCenter = center
    exports.sankeyLeft = left
    exports.sankeyRight = right
    exports.sankeyJustify = justify

    Object.defineProperty(exports, '__esModule', { value: true })*/

  exports.sankeyCircular = sankeyCircular;
  exports.sankeyCenter = center;
  exports.sankeyLeft = left;
  exports.sankeyRight = right;
  exports.sankeyJustify = justify;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
