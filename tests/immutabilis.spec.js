/* global window */
describe('Handling of immutable data', function () {
    'use strict';

    if (typeof window !== 'undefined' && typeof require !== 'function') {
        window.require = function () {
            return window.immutabilis;
        };
    }

    var immutabilis = require('../src/immutabilis');

    /** @name TEST_immutabilis */
    describe('immutabilis', function () {
        describe('fromJS', function () {
            it('can create immutable data from raw js objects', function () {
                expectImmutable(immutabilis.fromJS({
                    foo: 'foo'
                }));
            });

            it('can create immutable data from raw js arrays', function () {
                expectImmutable(immutabilis.fromJS([1, 2, 3]));

            });

            it('can create immutable data from any other input', function () {
                expectImmutable(immutabilis.fromJS(1));
                expectImmutable(immutabilis.fromJS('foo'));
                expectImmutable(immutabilis.fromJS(function () {}));
            });

            it('returns the input when passing an immutable', function () {
                var immutable = immutabilis.fromJS('foo');
                var result = immutabilis.fromJS(immutable);
                expect(result).toBe(immutable);
            });

            it('treats non-hash objects as values', function () {
                var Ctor = function () {};
                var obj = new Ctor();

                // execute
                var immutable = immutabilis.fromJS(obj);

                // verify
                expect(immutable).toBe(immutable);
                expect(immutable.val()).toBe(obj);
            });
        });

        describe('find', function () {
            it('allows you to find any sub value', function () {
                var data = immutabilis.fromJS({
                    foo: [{
                        ping: 'ping-1',
                        pong: 'pong-1',
                    }, {
                        ping: 'ping-2',
                        pong: 'pong-2',
                    }],

                    bar: {
                        ping: 'ping-bar',
                        pong: 'pong-bar'
                    }
                });

                expect(immutabilis.find(data, 'foo.0.ping').val()).toBe('ping-1');
                expect(immutabilis.find(data, 'foo.0.pong').val()).toBe('pong-1');
                expect(immutabilis.find(data, 'foo.1.ping').val()).toBe('ping-2');
                expect(immutabilis.find(data, 'foo.1.pong').val()).toBe('pong-2');
                expect(immutabilis.find(data, 'bar.ping').val()).toBe('ping-bar');
                expect(immutabilis.find(data, 'bar.pong').val()).toBe('pong-bar');
            });

            it('returns null if no immutable was given', function () {
                expect(immutabilis.find()).toBe(null);
            });

            it('returns null if no value was found', function () {
                var data = immutabilis.fromJS('foo');
                expect(immutabilis.find(data, 'bar')).toBe(null);
            });

            it('returns the initial immutable if no valid selector is given', function () {
                var data = immutabilis.fromJS('foo');
                expect(immutabilis.find(data, false)).toBe(data);
                expect(immutabilis.find(data, null)).toBe(data);
                expect(immutabilis.find(data)).toBe(data);
            });
        });
    });

    /** @name TEST_Value */
    describe('Immutable value', function () {
        var testData = [1, 'foo', function f1() {}];
        var changeData = [2, 'bar', function f2() {}];

        describe('val', function () {
            it('can return the stored value', function () {
                testData.forEach(function (item) {
                    expect(immutabilis.fromJS(item).val()).toBe(item);
                });
            });

            it('can return the value of computed properties', function () {
                var value = immutabilis.fromJS('foo', {
                    size: function (val) {
                        return val.length;
                    }
                });

                expect(value.val('size')).toBe(3);
            });

            it('returns "null" for any sub-keys', function () {
                testData.forEach(function (item) {
                    expect(immutabilis.fromJS(item).val('foo')).toBe(null);
                });
            });
        });

        describe('sub', function () {
            it('has no sub values', function () {
                testData.forEach(function (item) {
                    expect(immutabilis.fromJS(item).sub()).toBeFalsy();
                });
            });
        });

        describe('set', function () {
            it('does not change the immutable', function () {
                testData.forEach(function (orgData, index) {
                    // prepare
                    var newData = changeData[index];
                    var value1 = immutabilis.fromJS(orgData);

                    // execute
                    var value2 = value1.set(orgData);
                    var value3 = value1.set(newData);

                    // verify
                    expect(value1).toBe(value2);
                    expect(value1).not.toBe(value3);
                    expect(value1.val()).toBe(orgData);
                    expect(value2.val()).toBe(orgData);
                    expect(value3.val()).toBe(newData);
                });
            });

            it('allows to changes the value into a list', function () {
                // prepare
                var struct = immutabilis.fromJS(testData);

                // execute
                var list = struct.set(['foo']);

                // verify
                expect(list.val()).toEqual(['foo']);
                expect(list.sub(0).val()).toBe('foo');
            });

            it('allows to changes the value into a key-value-store', function () {
                // prepare
                var list = immutabilis.fromJS(testData);

                // execute
                var struct = list.set({foo: 'foo'});

                // verify
                expect(struct.val()).toEqual({foo: 'foo'});
                expect(struct.sub('foo').val()).toBe('foo');
            });

            it('handles immutable input correctly', function () {
                // prepare
                var immutable1 = immutabilis.fromJS('foo');
                var immutable2 = immutabilis.fromJS('bar');

                // execute
                var immutable3 = immutable1.set(immutable1);
                var immutable4 = immutable1.set(immutable2);

                // verify
                expect(immutable3).toBe(immutable1);
                expect(immutable4).toBe(immutable2);
            });
        });
    });

    /** @name TEST_Struct */
    describe('Immutable object', function () {
        var testData = {
            foo: {
                foo: 'foo_1',
                bar: 'bar_1',
            },
            bar: {
                foo: 'foo_2',
                bar: 'bar_2',
            }
        };

        describe('val', function () {
            it('can return the stored value', function () {
                // prepare
                var struct = immutabilis.fromJS(testData);

                // execute
                var value = struct.val();

                // verify
                expect(value).toEqual(testData);
            });

            it('can return the value of a sub', function () {
                var struct = immutabilis.fromJS(testData);

                expect(struct.val('foo')).toEqual(testData.foo);
                expect(struct.val('bar')).toEqual(testData.bar);
            });

            it('can return the value of computed properties', function () {
                var struct = immutabilis.fromJS(testData, {
                    size: function (val) {
                        return Object.keys(val).length;
                    }
                });

                expect(struct.val('size')).toBe(2);
            });

            it('returns "null" for any unknown sub-keys', function () {
                var struct = immutabilis.fromJS(testData);
                expect(struct.val('baz')).toBe(null);
            });
        });

        describe('sub', function () {
            it('allows to access sub values', function () {
                // prepare
                var struct = immutabilis.fromJS(testData);

                // execute
                var sub1 = struct.sub('foo');
                var sub2 = struct.sub('bar');
                var sub3 = sub1.sub('bar');
                var sub4 = sub3.sub('bar');

                // verify
                expectImmutable(sub1);
                expectImmutable(sub2);
                expectImmutable(sub3);
                expect(sub4).toBeFalsy();
            });
        });

        describe('set', function () {
            it('allows to add keys', function () {
                // prepare
                var struct = immutabilis.fromJS(testData);

                // execute
                var struct2 = struct.set('baz', 'baz_1');

                // verify
                expect(struct2.val()).toEqual(mix({}, testData, {
                    baz: 'baz_1'
                }));
            });

            it('does not change the immutable', function () {
                // prepare
                var struct = immutabilis.fromJS(testData);
                var newData = {
                    foo: 'baz'
                };
                var expectedResult = {
                    foo: 'baz',
                    bar: {
                        foo: 'foo_2',
                        bar: 'bar_2',
                    }
                };

                // execute
                var struct2 = struct.set(newData);
                var struct3 = struct.set('foo', 'baz');

                // verify
                expect(struct).not.toBe(struct2);
                expect(struct).not.toBe(struct3);
                expect(struct.val()).toEqual(testData);
                expect(struct2.val()).toEqual(expectedResult);
                expect(struct3.val()).toEqual(expectedResult);
                expect(struct.sub('bar')).toBe(struct2.sub('bar'));
                expect(struct.sub('bar')).toBe(struct3.sub('bar'));
            });


            it('does not create a new immutable if the data was unchanged', function () {
                // prepare
                var struct = immutabilis.fromJS(testData);
                var sub = struct.sub('foo');

                // execute
                var struct2 = struct.set({
                    foo: {
                        foo: 'foo_1',
                        bar: 'bar_1',
                    },
                    bar: {
                        foo: 'foo_2',
                        bar: 'bar_2',
                    }
                });
                var sub2 = sub.set('foo', 'foo_1');

                // verify
                expect(struct).toBe(struct2);
                expect(sub).toBe(sub2);
            });

            it('allows to changes the struct into a simple value', function () {
                // prepare
                var struct = immutabilis.fromJS(testData);

                // execute
                var val = struct.set('foo');

                // verify
                expect(val.val()).toBe('foo');
                expect(val.sub(0)).toBeFalsy();
            });

            it('allows to changes the struct into a list', function () {
                // prepare
                var struct = immutabilis.fromJS(testData);

                // execute
                var list = struct.set(['foo']);

                // verify
                expect(list.val()).toEqual(['foo']);
                expect(list.sub(0).val()).toBe('foo');
            });

            it('handles immutable input correctly', function () {
                // prepare
                var immutable1 = immutabilis.fromJS({foo: 'bar'});
                var immutable2 = immutabilis.fromJS('bar');

                // execute
                var immutable3 = immutable1.set(immutable1);
                var immutable4 = immutable1.set(immutable2);

                // verify
                expect(immutable3).toBe(immutable1);
                expect(immutable4).toBe(immutable2);
            });

            it('handles immutable sub-values correctly', function () {
                // prepare
                var immutable = immutabilis.fromJS({foo: 'bar'});
                var foo = immutable.sub('foo');
                var bar = immutabilis.fromJS('bar');

                // execute
                var immutable2 = immutable.set('foo', foo);
                var immutable3 = immutable.set({
                    foo: foo
                });
                var immutable4 = immutable.set({
                    foo: bar
                });

                // verify
                expect(immutable2).toBe(immutable);
                expect(immutable3).toBe(immutable);
                expect(immutable4).not.toBe(immutable);
                expect(immutable4.val('foo')).toBe('bar');
            });

            it('returns itself if no value is passed', function () {
                var struct = immutabilis.fromJS({foo: 'bar'});
                expect(struct.set()).toBe(struct);
            });
        });

        describe('each', function () {
            it('allows to change the value of each sub', function () {
                // prepare
                var struct1 = immutabilis.fromJS({foo: 1, bar: 2, baz: 3});

                // execute
                var struct2 = struct1.each(function (sub) {
                    return 2 * sub.val();
                });

                // verify
                expect(struct1.val()).toEqual({foo: 1, bar: 2, baz: 3});
                expect(struct2.val()).toEqual({foo: 2, bar: 4, baz: 6});
            });
        });
    });

    /** @name TEST_List */
    describe('Immutable array', function () {
        var testData = ['foo', 'bar', 'baz'];

        describe('val', function () {
            it('can return the stored value', function () {
                // prepare
                var list = immutabilis.fromJS(testData);

                // execute
                var value = list.val();

                // verify
                expect(value).toEqual(testData);
            });

            it('can return the value of a sub', function () {
                var list = immutabilis.fromJS(testData);

                expect(list.val(0)).toBe('foo');
                expect(list.val(1)).toBe('bar');
                expect(list.val(2)).toBe('baz');
            });

            it('can return the value of computed properties', function () {
                var list = immutabilis.fromJS(testData, {
                    size: function (val) {
                        return val.length;
                    }
                });

                expect(list.val('size')).toBe(testData.length);
            });

            it('returns "null" for any unknown sub-keys', function () {
                var list = immutabilis.fromJS(testData);
                expect(list.val(42)).toBe(null);
            });
        });

        describe('sub', function () {
            it('allows to access sub values', function () {
                // prepare
                var list = immutabilis.fromJS(testData);

                // execute
                var sub1 = list.sub(0);
                var sub2 = list.sub(1);
                var sub3 = list.sub(2);
                var sub4 = list.sub(3);

                // verify
                expectImmutable(sub1);
                expectImmutable(sub2);
                expectImmutable(sub3);
                expect(sub4).toBeFalsy();
            });
        });

        describe('set', function () {
            it('does not change the immutable', function () {
                // prepare
                var list = immutabilis.fromJS(testData);
                var newData = ['newfoo', 'newbar', 'newbaz'];

                // execute
                var list2 = list.set(newData);
                var list3 = list.set(1, newData[1]);

                // verify
                expect(list).not.toBe(list2);
                expect(list.val()).toEqual(testData);
                expect(list2.val()).toEqual(newData);
                expect(list3.val()).toEqual([testData[0], newData[1], testData[2]]);

                expect(list.sub(0)).toBe(list3.sub(0));
                expect(list.sub(2)).toBe(list3.sub(2));
            });

            it('does not create a new immutable if the data was unchanged', function () {
                // prepare
                var list = immutabilis.fromJS(testData);

                // execute
                var list2 = list.set([testData[0], testData[1], testData[2]]);
                var list3 = list.set(1, testData[1]);

                // verify
                expect(list).toBe(list2);
                expect(list).toBe(list3);
            });

            it('ignores invalid (<0 or non-numeric) keys', function () {
                // prepare
                var list = immutabilis.fromJS(testData);

                // execute
                var list2 = list.set('foo', 'ping');
                var list3 = list.set(-1, 'pong');

                // verify
                expect(list).toBe(list2);
                expect(list).toBe(list3);
            });

            it('allows to changes the list into a simple value', function () {
                // prepare
                var list = immutabilis.fromJS(testData);

                // execute
                var val = list.set('foo');

                // verify
                expect(val.val()).toBe('foo');
                expect(val.sub(0)).toBeFalsy();
            });

            it('allows to changes the list into a key-value-store', function () {
                // prepare
                var list = immutabilis.fromJS(testData);

                // execute
                var struct = list.set({foo: 'foo'});

                // verify
                expect(struct.val()).toEqual({foo: 'foo'});
                expect(struct.sub('foo').val()).toBe('foo');
            });

            it('handles immutable input correctly', function () {
                // prepare
                var immutable1 = immutabilis.fromJS([1, 2, 3]);
                var immutable2 = immutabilis.fromJS('bar');

                // execute
                var immutable3 = immutable1.set(immutable1);
                var immutable4 = immutable1.set(immutable2);

                // verify
                expect(immutable3).toBe(immutable1);
                expect(immutable4).toBe(immutable2);
            });

            it('returns itself if now values is passed', function () {
                var list = immutabilis.fromJS(['foo', 'bar']);
                expect(list.set()).toBe(list);
            });
        });

        describe('each', function () {
            it('allows to change the value of each sub', function () {
                // prepare
                var list1 = immutabilis.fromJS([1, 2, 3]);

                // execute
                var list2 = list1.each(function (num) {
                    return 2 * num.val();
                });

                // verify
                expect(list1.val()).toEqual([1, 2, 3]);
                expect(list2.val()).toEqual([2, 4, 6]);
            });

            it('allows to filter subs', function () {
                // prepare
                var list1 = immutabilis.fromJS([1, 2, 3, 4]);

                // execute
                var list2 = list1.each(function (num) {
                    if (num.val() % 2) {
                        return num;
                    }
                });

                // verify
                expect(list1.val()).toEqual([1, 2, 3, 4]);
                expect(list2.val()).toEqual([1, 3]);
            });
        });
    });

    function expectImmutable(subject) {
        expect(typeof subject).toBe('object');
        expect(typeof subject.val).toBe('function');
        expect(typeof subject.set).toBe('function');
        expect(typeof subject.sub).toBe('function');
    }

    function mix() {
        var args = Array.apply(null, arguments);
        var base = args.shift();
        var next;

        while (args.length) {
            next = args.shift();

            for (var key in next) {
                if (next.hasOwnProperty(key)) {
                    base[key] = next[key];
                }
            }
        }

        return base;
    }
});
