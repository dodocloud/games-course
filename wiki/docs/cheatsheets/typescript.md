---
title: TypeScript
---

- official page: [https://www.typescriptlang.org/](https://www.typescriptlang.org/)

### Basic Types

```typescript
any
void
unknown 
 
boolean
number
string
Symbol
  
null
undefined

string[]          /* or Array<string> */
[string, number]  /* tuple */
  
false, 0, "", null, undefined, NaN  // always false
```

### Declarations

```typescript
let isDone: boolean;
const myName: string = 'Robert'; // assignment
const myName = 'Robert'; // type determined from the right side
 
const hobbies: string[] = ['Programming', 'Cooking']; // array
const address: [string, number] = ["Street", 99]; // tuple

let repeatType: 'repeat-x' | 'repeat-y' | 'no-repeat';  // union enum

let sprites: Sprite | Sprite[]; // union type
let spriteMesh: Sprite & Mesh; // intersection type
let myCar: any = 'BMW'; // any
const greeting = `Hello I'm ${userName}`; // template literal
```

### Functions

```typescript
// normal function
function add (a: number, b: number): number {
  return a + b
}

// arrow function
const add = (a: number, b: number): number => a + b;
 
// this never returns anything
function neverReturns(): never {
  throw new Error('An error!');
}
```

### Enumerators

```typescript
enum Color {
  Gray, // 0
  Red, // 1
  Green = 100, // 100
  Blue, // 101
  Yellow = 2 // 2
}
 
const myColor: Color = Color.Green
console.log(myColor); // Prints: 100

const colors = Object.keys(Color); // gets all enum keys
```

### For loop

```typescript
// For..of, can be used only for iterable objects
for(let user of activeUsers) {
  console.log(user);
}
 
// for..in
// this can be applied to any object, just iterates over its attributes
// order is undefined, don't use it for iterable objects
for(let key in activeUsers) {
  console.log(activeUsers[key])
}
```

### Equality

```typescript
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

```

### Maps

```typescript
// regular object
let totalReplies = {};
totalReplies[user1] = 5; // keys are converted to strings
 
// Map object -> can use strings and numbers as keys
let totalReplies = new Map();
totalReplies.set(user1, 5); 
totalReplies.set(user2, 42);

let has = totalReplies.has(user1);
totalReplies.delete(user1);
```

### Array operations

```typescript
// concat, entries, fill, filter, find, flat, flatMap, forEach, 
// join, includes, keys, map, push, pop, reduce, reverse, shift, 
// slice, sort, splice, unshift, values
 
[0, 0, 0].fill(7, 1) // [0,7,7]
[1, 2, 3].find(x => x == 3) // 3
[1, 2, 3].findIndex(x => x == 2) // 1
[1, 2, 3, 4, 5].copyWithin(3, 0) // [1, 2, 3, 1, 2]
["a", "b", "c"].entries() // iterator [0, "a"], [1,"b"], [2,"c"]
["a", "b", "c"].keys() // iterator 0, 1, 2
["a", "b", "c"].values() // iterator "a", "b", "c"
const merge = [...arr1, ...arr2]; // merged arrays
```

### Classes

```typescript
class Point {
 
  public x: number;
  public y: number;
  protected static instances = 0; // initial value
 
  constructor(x: number, y: number) {
    Point.instances++;
    this.x = x;
    this.y = y;
  }
}

// abstract class
abstract class Shape {
  abstract calcSize(): number;
}
```

### Inheritance and interfaces

```typescript
class Point {
  protected x: number;
  protected y: number;
}
 
class Point3D extends Point {
  protected z: number;
}
 
interface Colored {
  select(): void;
}

class Pixel extends Point implements Colored {
  select(): void { ... }
}
```

### Getters, setters

```typescript
class Plant {
  private _species: string = 'Default';
 
  get species() {
    return this._species;
  }
 
  set species(value: string) {
    this._species = value;
  }
}

// value access
new Plant().species = 'ferns';

```

### Generics

```typescript
class Greeter<T> {
  greeting: T;

  constructor(message: T) {
    this.greeting = message;
  }
}
 
let greeter = new Greeter<string>('Hello, world');

// default parameters
class Greeter<T = any> {
  greeting: T;
}

```

### Other constructs

```typescript
// type assertions
let len: number = (input as string).length;
let len: number = (<string> input).length;
 
// optional parameters
interface User {
  name: string, // can be null but not undefined
  age?: number // can be null or undefined
}

// optional chaining (if foo is undefined, it will not throw an error)
let x = foo?.bar.baz();

// nullish coalescing
let x = foo ?? bar; // if foo is undefined, assign bar 

// destructuring declaration (will take 3 attributes from an output)
const { x, y, z } = calcPosition();


// dynamic keys
{ [key: string]: Object[] }
 
// type aliases
type Name = string | string[]
// function alias
type MyFunction = (param1: number, param2: number) => string;

// types for polymorphism
type Shape = Square | Rectangle | Circle;
 
// function types
function getUser(callback: (user: User) => any) { callback({...}) }
 
// default parameters
const greet = (name: string = 'Robert') => console.log(`Hello, ${name}`);
 
// array destructuring
const testResults: number[] = [3.89, 2.99, 1.38];
const [result1, result2, result3] = testResults;

// arrow functions
const myMultiply: (val1: number, val2: number) => number;
 
let myFunction = (val1: number, val2: number) => {
  return val1 + val2;
}
 
// object types
let userData: { name: string, age: number } = {
  name: 'Max'
};
 
// rest operator
function displayTags(targetElement: HTMLElement, ...tags: string[]) { 
  for(let i in tags) { // do something here }  
}

displayTags(myElement, "tag1", "tag2", "tag3");

// variable swap
let x = 1;
let y = 2;
[x, y] = [y, x];

// && and || declaration operators
let ent: Entity | null;
let name = ent && ent.name;  // name is of type string | null
let ent2 = ent || { name: "test" };  // ent will always contain name

// spread operator (good for shallow copy)
let copy = { ...original };
let merged = { ...foo, ...bar, ...baz };

// type as interface
type Point = {
  x: number;
  y: number;
}

```

### Asynchronous operations

```typescript
const downloadData = async () => {
  const customers = await fetchCustomers(url);
  const result = await loadCustomers(customers);
  return result;
};

async function printDelayed(elements: string[]) {
  for (const element of elements) {
      await delay(400);
      console.log(element);
  }
}
```

### Context binding

```typescript
class ContextExample {
  private x = 0;
 
  constructor() {
    setTimeout(this.arrowFunc, 1000);
    setTimeout(this.regularFunc, 1000); // will not work
    setTimeout(this.regularFunc.bind(this), 1000);
  }
 
  private arrowFunc = () => {
    this.x = 5;
  }

  private regularFunc() {
    this.x = 5;
  }
}
```

### Exports and Imports

```typescript
export const myConst = 12345; // simple export
 
// default exports
export default calculateRectangle = (width: number, length: number) => {
  return width * length;
}
 
// alternative
const calculateRectangle2 = (width: number, length: number) => { ... }
export default calculateRectangle2; // exported function
export default new MyClass(); // exported instance
export { read, write, standardOutput as stdout } from './inout'; // re-export
 
// import
import { PI, calculateCircumference } from './src/circle' // imports selected types
import calculateRectangle from './src/rectangle' // imports everything with an alias
import * as flash from './flash-message'; // imports everything
```

### Modules

```typescript
// services/tag-service/service.ts
// use default export for classes and respective export for utilities
export default TagService {
  ... 
}
//=======================================================
// services/index.ts
// import all services
import TagService from './tag-service/service';
import LabelService from './label-service/service';
...

// export them for other folders
export { TagService, LabelService }

// and import them from other folders
//=======================================================
// any ts file outside services folder
import { TagService, LabelService } from './services'; // no need to write /index 
```