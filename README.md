JavaScript Class Implementation
=====

- Create subclasses using a class's `extend()` method

=====

**Class.extend()**

A class's `extend()` method creates a new class based on itself. The methods and properties of the prototype are inherited.

`MyClass.extend([options])`

Parameters:
- `options` {object}  
`options` can include any of the following:
	
	- `className` {string}  
	Used as `.name` for the class constructor and in `.toString()` for instances of the class. If not specified, it will be the same as the parent class.
	
	- `constructorFn` {function}  
	Constructor. A function is passed as the first argument, used to initialize the instance using the parent class' constructor. Be sure to call it inside `constructorFn()` (before using `this`).
	
	- `returnFn` {function}  
	Returns a value when the constructor is called without using the 'new' keyword.
	
	- `extensions` {object}  
	Additional and overriding properties and methods for the prototype of the class.

=====

**Class.noConflict()**  
Restores `Class` to what it was before this script replaced it, optionally providing a new context.

`Class.noConflict([newContext])`
