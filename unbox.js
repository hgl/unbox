var toString = {}.toString;

module.exports = unbox;

function unbox(obj, cb) {
	if (!cb) cb = function (err) { if (err) throw err; };

	if (isGeneratorFunction(obj)) return unboxGenerator(obj(), cb);
	if (isGenerator(obj)) return unboxGenerator(obj, cb);
	if (typeof obj === 'function') obj(cb);
	else cb(null, obj);
}

function unboxGenerator(gen, cb) {
	next();

	function next(err, val) {
		var ret;

		try {
			ret = err ? gen.throw(err) : gen.next(val);
		} catch (e) {
			return cb(e);
		}

		if (ret.done) return cb(null, ret.value);
		unbox(ret.value, next);
	}
}

function isGeneratorFunction(fn) {
	return fn && fn.constructor && fn.constructor.name === 'GeneratorFunction';
}

function isGenerator(gen) {
	return gen && toString.call(gen) === '[object Generator]';
}