var assert = require('assert');
var unbox = require('../unbox');

describe('unbox', function () {
	it('should pass primitive number directly', function (done) {
		unbox(1, function (err, val) {
			assert.equal(val, 1);
			done();
		});
	});

	it('should unbox function', function (done) {
		var fn = function (done) {
			setTimeout(function () {
				done(null, 1);
			}, 0);
		};

		unbox(fn, function (err, val) {
			assert.equal(val, 1);
			done()
		});
	});

	it('should unbox function directly, if no callback passed', function (done) {
		var fn = function (cb) {
			setTimeout(function () {
				cb();
				done();
			}, 0);
		};

		unbox(fn);
	});

	it('should unbox generator function', function (done) {
		var fn = function* () {
			return yield 1;
		};

		unbox(fn, function (err, val) {
			assert.equal(val, 1);
			done()
		});
	});

	it('should unbox generator function directly if no callback passed', function (done) {
		var fn = function* () {
			var val = yield 1;
			assert.equal(val, 1);
			done();
		};

		unbox(fn);
	});

	it('should unbox generator', function (done) {
		var foo = function* () {
			return yield 1;
		};
		var gen = foo();

		unbox(gen, function (err, val) {
			assert.equal(val, 1);
			done()
		});
	});

	it('should unbox nested generator', function (done) {
		var foo = function* () {
			return yield 1;
		};
		var bar = function* () {
			return yield foo();
		};
		var gen = bar();

		unbox(gen, function (err, val) {
			assert.equal(val, 1);
			done()
		});
	});

	it('should unbox generator yielded with callback', function (done) {
		var foo = function* () {
			return yield function (done) {
				setTimeout(function () {
					done(null, 1);
				}, 0);
			};
		};
		var gen = foo();

		unbox(gen, function (err, val) {
			assert.equal(val, 1);
			done()
		});
	});

	it('should unbox generator yielded with generator function', function (done) {
		var foo = function* () {
			return yield 1;
		};
		var bar = function* () {
			return yield foo;
		};
		var gen = bar();

		unbox(gen, function (err, val) {
			assert.equal(val, 1);
			done()
		});
	});

	it('should pass generator\'s thrown error', function (done) {
		var foo = function* () {
			throw new Error('error');
			return yield 1;
		};
		var gen = foo();

		unbox(gen, function (err, val) {
			assert.ok(err);
			assert.equal(err.message, 'error');
			done()
		});
	});

	it('should throw generator\'s thrown error if no callback passed', function () {
		var foo = function* () {
			throw new Error('error');
			return yield 1;
		};
		var gen = foo();

		assert.throws(unbox.bind(undefined, gen), Error);
	});

	it('should pass nested generator\'s thrown error', function (done) {
		var foo = function* () {
			throw new Error('error');
			return yield 1;
		};
		var bar = function* () {
			return yield foo();
		};
		var gen = bar();

		unbox(gen, function (err, val) {
			assert.ok(err);
			assert.equal(err.message, 'error');
			done()
		});
	});

	it('should throw nested generator\'s thrown error if no callback passed', function () {
		var foo = function* () {
			throw new Error('error');
			return yield 1;
		};
		var bar = function* () {
			return yield foo();
		};
		var gen = bar();

		assert.throws(unbox.bind(undefined, gen), Error);
	});

	it('should allow generator function to catch error', function (done) {
		var foo = function* () {
			throw new Error('error');
		};
		var bar = function* () {
			try {
				yield foo();
			} catch (err) {
				return 1;
			}
		};
		var gen = bar();

		unbox(gen, function (err, val) {
			assert.equal(val, 1);
			done();
		});
	});

	it('should unbox complexly nested generator', function (done) {
		var foo = function* () {
			return yield 1;
		};
		var bar = function* () {
			var f = yield foo();
			return yield f;
		};
		var baz = function* () {
			var b = yield bar();
			b = yield b;
			return yield b;
		};
		var gen = baz();

		unbox(gen, function (err, val) {
			assert.equal(val, 1);
			done();
		});
	});
});