JavaScript Class Implementation
=====

- Create sub-classes using a class's `extend()` method
- Classes inherit methods and properties from their super-class
- As part of its own initialization, a new instance can be initialized via a super-class's constructor

=====

**Class.prototype.extend()**

A class's `extend()` method creates a new class based on itself. The methods and properties of the prototype are inherited.

`MyClass.extend([options])`

Parameters:
- `options`  
An object including any of the following:
	
	- `className`  
	String used in .toString() for the prototype and instances of the new class. If not specified, it will be the same as the super-class.
	
	- `init`  
	Function used to initialize a new instance of the class. This function can include something like `MySuperClass.call(this)` to initialize the instance via the super-class's constructor.
	
	- `extensions`  
	Object containing additional and overriding methods and properties for the prototype of the new class.
	
	- `ret`  
	Function used to return a value when the constructor is called without the `new` keyword.
	
	- `returnInstance`  
	If `true` and the `ret` option is not a function, a new instance will be returned when the constructor is called without the `new` operator (as if the `new` operator _had_ been used).

=====

**Class.noConflict()**  
Restores `Class` to what it was before this script replaced it, optionally providing a new context.

`Class.noConflict([newContext])`
