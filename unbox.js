var toString = {}.toString;

module.exports = unbox;

function unbox(obj, opts, cb) {
	if (typeof opts === 'function') {
		cb = opts;
		opts = {};
	} else if (!opts) {
		opts = {};
	}
	if (!cb) cb = function (err) { if (err) throw err; };

	if (isGeneratorFunction(obj)) return unboxGenerator(obj(), opts, cb);
	if (isGenerator(obj)) return unboxGenerator(obj, opts, cb);
	if (typeof obj === 'function') return unboxThunk(obj, opts, cb);
	if (opts.parallel && Array.isArray(obj)) return unboxArray(obj, opts, cb);
	cb(null, obj);
}

function unboxGenerator(gen, opts, cb) {
	next();

	function next(err, val) {
		var ret;

		try {
			ret = err ? gen.throw(err) : gen.next(val);
		} catch (e) {
			return cb(e);
		}

		if (ret.done) return cb(null, ret.value);
		unbox(ret.value, opts, next);
	}
}

function unboxThunk(thunk, opts, cb) {
	thunk(function (err, val) {
		if (err) {
			cb(err);
			return;
		}
		unbox(val, opts, cb);
	});
}

function unboxArray(arr, opts, cb) {
	var pending = arr.length;
	var erred = false;
	arr.forEach(function (item, i) {
		unbox(item, opts, function (err, val) {
			if (erred) return;
			if (err) {
				erred = true;
				return cb(err);
			}
			arr[i] = val;
			if (!--pending) cb(null, arr);
		});
	});
}

function isGeneratorFunction(fn) {
	return fn && fn.constructor && fn.constructor.name === 'GeneratorFunction';
}

function isGenerator(gen) {
	return gen && toString.call(gen) === '[object Generator]';
}