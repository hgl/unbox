# unbox

Extract values "boxed" inside objects like generators, generator functions, thunks, etc. Help you write asynchronous code more elegantly.

Inspired by [co](https://github.com/visionmedia/co). The main difference is that any value is yieldable in unbox and parallel execution is optional.

# Installation

	npm install unbox

# Generators and generator functions

unbox itself only uses es5 features, but to create generators and generator functions, you need to use node 0.11.x with the `--harmony-generators` (or `--harmony`) flag.

## Example

```javascript
var foo = function* () {
	return yield 1;
};

unbox(foo(), function (err, val) {
	console.log(val); // 1
});
```

```javascript
unbox(function* () {
	var foo = yield 1;
	console.log(foo); // 1
});
```

```javascript
var fn = function (done) {
	setTimeout(function () {
		done(null, 1);
	}, 0);
};
unbox();
```