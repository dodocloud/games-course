---
title: JavaScript
---


## Basic structures

### Hoisting
- JS moves `var` declarations all the way up to the top of the scope
- solution: use `let` instead of `var`

```javascript

if (mojo) {
    var dojo = 1
}

// becomes
var dojo
if (mojo) {
  dojo = 1
}

```

### Assignment

```javascript
let person = {
    name: 'Kunio Otani'
}

// assign copies the values from one ore more source to a target object
// returns the target object
Object.assign(person, {
    age: 42,
    nationality: 'JP'
})

// expression, returns the right side of the operator
person.age = 42
person.nationality = 'JP'

```

### THIS reference

```javascript
foo();          // "this" in foo refers to the global object
test.foo();     // "this" in foo refers to test 
new foo();      // "this" in foo will refer to a newly created object 
foo.apply(bar, [1, 2, 3]);  // "this" in foo is set to bar
foo.call(bar, 1, 2, 3);     // "this" in foo is set to bar
foo = () => { ... }         // "this" in foo is set to the surrounding scope
```

### Arguments
- every function scope can access a special variable `arguments` which holds a list of all function arguments
- arrow functions, however, have only access to the arguments of the nearest non-arrow parent function

```javascript
function foo(a, b, c) {
	console.log(arguments[0]) // will print a
}
```

### Six falsy values
- any other values is true
- `false`, `0`, `''`, `null`, `undefined`, `NaN`

### Six primitive values (+ Object)
- Boolean, Null, Undefined, Number, String, Symbol

### For loops
- for-in - works for any object, not only arrays. **The order is undefined**

```javascript
for(let key in activeUsers) {
    console.log(activeUsers[key])
}
```
- for-of - works only for objects that have `[Symbol.iterator]`

```javascript
for(let user of activeUsers) {
    console.log(user)
}
```

### Math operations

- every bitwise operation converts numbers into integers (removing the fraction part)


|value/func|`trunc`|`floor`|`ceil`|`round`|`~~x`| x&#124;0 | `x << 0`| `x >> 0` | `x >>> 0`|
|---|---|--|--|--|--|--|--|--|--|
|3.8|3|3|4|4|3|3|3|3|3|
|3.2|3|3|4|3|3|3|3|3|3|
|-3.2|-3|-4|-3|-3|-3|-3|-3|-3|4294967293|
|-3.8|-3|-4|-3|-4|-3|-3|-3|-3|4294967293|


### Destructuring assignment
- array destructuring - allows to extract multiple array elements

```javascript
let [ name1, name2 ] = names
```

- ignoring second element

```javascript
let [ name,, name3 ] = names
```

- setting default values

```javascript
let [ a = 1, b = 2, c = 3 ] = names
```

- object destructuring - allows to extract attributes

```javascript
// assign properties - bad way
let user = buildUser('Sam', 'Williams')
let first = user.first
let last = user.last
// assign properties - good way
let { first, last, fullName } = buildUser('Sam', 'Williams')
let { fullName } = buildUser('Sam', 'Williams') // we need only fullName
```

### Template strings

```javascript
let fullName = `${first} ${last}` // ` backtick must be used!!!
```

### Rest and Spread operators
- denoted with three ellipses or periods
- rest is used to represent an infinite number of arguments
- spread is used to allow an iterable object to be expanded
- rest destructuring

```javascript
function fn(num1, num2, ...args) { } /// args always goes last
```

- destructured rest

```javascript
function fn(...[n1, n2, n3]) {}
```

- spread operator

```javascript
function myFunction(n1, n2, n3) { ... }
 
const values = [ 1, 2, 3 ]
 
myFunction(...values)
```

- object destructuring

```javascript
const { firstNamne, lastName } = obj
```

- destructuring into a new variable

```javascript
const { firstName: first, lastName } = obj
console.log(first)
```

### Arrow functions
- anonymous, not bound to an identifier
- are callable but not constructable (you can't use `new` operator)

```javascript
// old way
TagComponent.prototype.render = function(){
    getRequest(this.urlPath, function(data) {
        displayTags(this.targetElement, ... tags) // this points to getRequest() scope
    })
}

// a regular function
const fn1 = function(a, b) { return a + b }

// arrow function
const fn2 = (a, b) => { return a + b }

// arrow function without return keyword
const fn3 = (num1, num2) => num1 + num2
```

### Array operations
- mutating arrays

```javascript
const mutatingAdd = [1, 2, 3]
mutatingAdd.push(4) // [1, 2, 3, 4]
mutatingAdd.unshift(0) // [0, 1, 2, 3, 4]

// Immutable operations over arrays 
const arr1 = [1, 2]
const arr2 = [3, 4]

const arr3 = arr1.concat(arr2) // [1, 2, 3, 4]
const arr3 = [...arr1, ...arr2]// [1, 2, 3, 4]
const arr4_altern = [0, ...arr1] //[0, 1, 2]
```

- remove strings from an array

```javascript
const arr = [0, 1, 2]
const tailArr = arr.splice(-1) // [2]
console.log(arr) // [0, 1]
```

- slice and update

```javascript
const numbers = [0, 1, 2, 3, 4]
const lessThanThree = numbers.slice(0, 3) // [0, 1, 2]
const moreThanTwo = numbers.splice(2, numbers.length) // [2, 3, 4] 
```

- other functions

```javascript
concat, entries, fill, filter, find, flat, flatMap, forEach, join, includes, keys, map, push, pop, reduce, reverse, shift, slice, sort, splice, unshift, values
```

- sorting arrays

```javascript
// sorting function: if < 0, then a < b if == 0, then a == b if > 0, then b > a
nums.sort((a,b) => {
  return a-b // ascending 
})

nums.sort((a,b) => {
  return b-a // descending 
})
```

- generating a sequence

```javascript
const indices = Array.from(Array(10).keys())
console.log(indices) // [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
```

### Maps
- when using objects as maps, their keys are always converted to strings
- Maps can't be serialized into JSON, yet they can be iterated via for-of loop

```javascript
let totalReplies = new Map()
totalReplies.set(user1, 5) 
totalReplies.set(user2, 42)
let has = totalReplies.has(user1)
totalReplies.delete(user1)
```

- `WeakMap` - only objects can be passed as keys, aren't iterable, better with memory

### Sets

```javascript
let tags = new Set()
tags.add('JavaScript')
tags.add({version : '2015'})

let [first] = tags // first item
```

### Classes
- old way (ES5)

```javascript
function SponsorWidget(name, description, url){
    this.name = name
    this.description = description
    this.url = url
}

Sponsor.prototype.render = function(){
    
}
```

- new way (ES6+), `class` is only a sugar syntax

```javascript
class SponsorWidget {
    myVar = 12
    myOtherVar
    
    constructor(name description, url){
        this.name = name
        this.description = description
        this.url = url
    }
    
    render(){     
        let link = this._buildLink(this.url)
    }
    
    _buildLink(url) { // underscore is a convention for private method
        
    }
}

class SponsorWidget extends Widget {
    constructor(name, description, url) {
        super()
    }
    
    render() {
        super.render() // parent version
        let parsedName = this.parse(this.name)
        let css = this._buildCss()
    }
}
```


### Promises
- three states - pending, fulfilled, rejected
- handlers - `then()`, `catch()`, `finally()`
- when `Promise.then()` is called, it returns a new promise in the pending state
- when `Promise.catch()` is called, it internally calls `Promise.then(undefined, rejectHandler)`

```javascript
const myPromise = new Promise((resolve, reject) => {
    reject(new Error())
})

const myPromise = new Promise((resolve, reject) => {
    setTimeout(() => { resolve('Done!')}) // also works
})
```

- error handling

```javascript
myPromise.then(() => {}, error => console.log(error))

Promise.resolve('Resolve').then(console.log) // prints Resolve
Promise.reject('Reject').catch(console.log) // prints Reject
```

- combined promises

```javascript
await Promise.all([
    resolveAfter1Second(),
    resolveAfter2Seconds(),
])
```

### Async/await
- `async` function returns a promise - all async functions can have `then()` and `catch()` handlers
- if we don't return a promise, JS will do it automagically!

```javascript
async function example1() {
    return 'Hello' // JS will wrap this into a promise
}
 
async function example2() {
    return Promise.resolve('World')
}
```

- `await` can be used only within an `async` function
- error rejection

```javascript
try {
    const value1 = await Promise.reject('Error')
} catch(err) {
    
}
```

## Advanced structures

### Curried functions
- multiple arrow functions, can be used to wrap event handlers with additional parameters

```javascript
const three = a => b => c => a + b + c
three(1)(2)(3)

// equivalent:
const three = (a) => {
    return (b) => {
        return (c) => {
            return a + b + c
        }
    }
}
```

### Iterators
- we have to define a function that takes a collection in as the parameter and returns an object which **must** have property `next`
- when `next` is called, the iterator steps to the next value in the collection and returns an object with the value and the done status of the iteration

```javascript
function createIterator(array){
    let currIdx = 0
    return {
        next() {
            return currIdx < array.lenth ? {
                value: array[currIdx++], done: false,
            } : { done: true }
        },
    }
}
```

## Generators
- provide an iterative way to build a collection of data
- can be used for asynchronous processing also

```javascript
function *nameList(){
    yield 'Sam'   // { done : false, value: 'Sam' }
    yield 'Tyler' // { done : false, value: 'Tyler' }
}

for(let name of nameList()) {...} // usage
let names = [...nameList()]
```

```javascript
function *gen() {
    let i = 0
    while(true) {
        yield i++ 
    }
}
```

### Tagged template literals
- can be parsed with tag functions and can return a manipulated string

```javascript
function tagFunction(strings, param) {
    return strings[0] + param
}
 
const tagged = tagFunction`We have ${num} param`
```

### Enhanced object properties
- ES6 added 3 ways to simplify the creation of object literals
- object properties

```javascript
function getPersonES6(name, age, height) {
    return {
        name,
        age,
        height  
    }
}
```

- function declaration

```javascript
function getPersonES5(name, age, height) {
    return {
        getAge: function() { return age }
    }
}
 
function getPersonES6(name, age, height) {
    return {
        getAge() { return age }
    }
}
```

- computed properties

```javascript
const personES5 = {
    lastName: 'Smith'
}
personES5[varName] = 'John'
 
const personES6 = {
    lastName: 'Smith',
    [varName]: 'John',
}
```

### Readonly properties

```javascript
var a = {}
Object.defineProperty(a, 'mojo', {
  value: 15,
  writable: false
})
```

### Getters and setters

```javascript
function Foobar () {
    var _foo //  true private property
  
    Object.defineProperty(obj, 'foo', {
      get: function () { return _foo },
      set: function (value) { _foo = value }
    })
}
```

### Proxies

```javascript
function Foo() {
    return new Proxy(this, {
      get: function (object, property) {
        if (Reflect.has(object, property)) {
          return Reflect.get(object, property)
        } else {
          return function methodMissing() {
            console.log('you called ' + property + ' but it doesn\'t exist!')
          }
        }
      }
    })
}
```

### Modules
- old way (ES5)

```javascript
// anonymous namespaces 
(function () {
    // a self contained namespace 
    window.foo = function() {
        // exposed closure 
    }
})() // execute immediately
```

- new way (ES6+)
  - we can use `require` or `import`

```javascript
// flas-message.js
export default function(message){
    alert(message)
}

// app.js
import flashMessage from './flash-message'
flashMessage('Hello')
```

## Tips and tricks

### Creating own trim function

```javascript
String.prototype.trim = function(){return this.replace(/^s+|s+$/g, '')}  
```

### Transforming arguments object into an array

```javascript
var argArray = Array.prototype.slice.call(arguments)
```

### Closures inside loops
- wrong

```javascript
var funcs = []
for (var i = 0; i < 3; i++) {
  funcs[i] = function() {
    console.log('i value is' + i) // i value is 3, always!
  }
}
```

- good

```javascript
for (var i = 0; i < 3; i++) {
    funcs[i] = (function(value) {
      console.log('i value is ' + i) // 0, 1, 2
    })(i)
}
```

- even better

```javascript
for (let i = 0; i < 3; i++) {
    funcs[i] = () => {
      console.log('i value is ' + i) // 0, 1, 2
    }
} 
```

### Remove duplicities from an array

```javascript
const arr = [...new Set([1, 2, 3, 3])] // [1, 2, 3]
```

### Get the last item in an array

```javascript
let array = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
console.log(array.slice(-1)) // Result: [9]
```

### Assigning operator in a constructor

```javascript

class Polygon {
  constructor(options) { // many attributes
    Object.assign(this, options)
  }
}
```

### Freezing properties of an object

```javascript

const obj = { foo1: 'bar1', foo2: { value: 'bar2' } };

Object.freeze( obj );

obj.foo = 'foo'; // doesn't change the property nor does throw any Error
obj.foo2.value = 'bar3'; // does change the value of a property since it's nested!

```

### Deep cloning and comparing

```javascript
JSON.stringify(myObj1) === JSON.stringify(myObj2) 
```

## Weird parts of JavaScript

```javascript
false.toString() // false 
function Foo() { } 
Foo.bar = 1 

2.toString()   // SyntaxError, dot here means a floating point literal 
(2).toString() // OK 
2 .toString()  // OK
2..toString()  // OK

var foo = {} // new object, derives from Object.prototype 

// property access 
var foo = { name : 'kitten' }
foo.name    // OK 
foo['name'] // OK 
var get = 'name'
foo[get]    // OK 
foo.1234    // ERROR 
foo['1234'] // OK

// delete is the only way how to remove a property
// undefined or null only removes the VALUE 
var obj = { bar: 1 }
obj.bar = undefined // removes value 
delete obj.bar // removes key

// you can't delete global variables declared by var!
var mojo = 12
// use assignment to a global property instead, if you need to create a global variable
global.mojo = 12

// arrays 
new Array(3)   // [undefined, undefined, undefined], 
new Array('3') // ['3']


// equality operator 
'' == '0'              // false 
0 == ''                // true 
0 == '0'               // true
false == 'false'       // false 
false == '0'           // true 
false == undefined     // false 
false == null          // false 
null == undefined      // true 
{ } === {}             // false 
new String('foo') === 'foo' // false 
10 == '10'             // true 
10 == '+10'            // true 
10 == '010'            // true 
isNan(null) == false   // true, null converts to 0
new Number(10) === 10  // false, object !== number 

// typeof operator 
'foo'                  // string 
new String('foo')      // object 
true                   // boolean 
[1, 2, 3]              // object 
new Function()         // function 

// casting 
'' + 10 === '10'       // true 
!!'foo'                // true 
!!true                 // true

// boolean evaluation
new Boolean()           // false
new Boolean(0)          // false (for any falsy parameter)
// but careful, (new Boolean(anything) === true/false) -> always FALSE
new Boolean(true)        // true (for any truthy parameter)

// this invocation returns [1, NaN, 2]
['1', '2', '10'].map(parseInt); 
// explanation: 
//  map callback has 3 arguments: (val, index, array) 
//  parseInt has 2 arguments: (string, radix) where radix represents a base (2 for binary, 10 for dec)
//  map will put array index as the second parameter to the parseInt function
//  invocation: parseInt(1, 0), parseInt(2, 1), parseInt(10, 2) results in [1, NaN, 2]
//  conclusion: be aware of optional parameters when using a function pointer

// this will throw TypeError, tags is undefined
if(tags = content.getTags() && tags.length > 0) {

}
// explanation: priority of operators = and &&
if((tags = content.getTags()) && tags.length > 0) {
    // this will work
}

// why is this comma recommended? Because it prevents any previous code from 
// executing your code as the arguments to that function
;(async () => { ... }

```