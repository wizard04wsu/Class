# JavaScript Class Implementation

This implementation adds the capability for class instances to have [**protected members**](#readme-protected) that can be accessed by derivative class constructors.

This is a JavaScript module. It can be imported into your script like so: `import Class from "Class.mjs.js"`

# Class.extend()

Creates a child class. This is a static method of `Class` and its derivative classes.

## Syntax

```javascript
Class.extend(initializer)
Class.extend(initializer, applier)
```

### Parameters

[**<code>*initializer*</code>**](#readme-initializer)  
A function to be executed by the constructor, during the process of constructing a new instance of the child class. The name of the *<code>initializer</code>* is used as the name of the class. 

**<code>*applier*</code>** *optional*  
A handler function for when the class is called without using the `new` keyword. Default behavior is to throw a [TypeError](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypeError).

### Return value

The new class constructor. It has its own static copy of the `extend` method.

<a name="readme-initializer"></a>
### Initializer

The signature of the *<code>initializer</code>* function is expected to be:
```javascript
function MyClassName($super, ...args){
	//code that does not include `this`
	const protectedMembers = $super(...args);
	//code that may include `this`
}
```

**<code>*$super*</code>**  
A [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) to the parent class's constructor, bound as the first argument of the *<code>initializer</code>*. It is to be used like the [`super`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/super) keyword. It *must* be called exactly once during the execution of the constructor, *before* any reference to `this`.

<a name="readme-protected"></a>
**<code>*protectedMembers*</code>**  
An object whose members are shared among all the <i><code>initializer</code></i>s that are executed when a new instance of the class is created. This allows a protected value defined in the *<code>initializer</code>* of a class to be accessed and modified within the *<code>initializer</code>* of a derivative class directly, without needing static getters and setters.

## Description

TODO

## Examples

TODO
