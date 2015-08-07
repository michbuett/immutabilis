# immutabilis
[![Build Status](https://travis-ci.org/michbuett/immutabilis.svg?branch=master)](https://travis-ci.org/michbuett/immutabilis)

A small an powerfull lib for handling immutable data.

Usage Examples
--------------

```js
var immutabilis = require('immutabilis');

// create immutable data from any js object or array
var data = immutabilis.fromJS({
    foo: 'foo'
});

// modify
var newData1 = data.set('foo', 'bar');
var newData2 = data.set({
    foo: 'baz'
});

// get values
data.val();  // { foo: 'foo' }
newData1.val();  // { foo: 'bar' }
newData2.val();  // { foo: 'baz' }

```
