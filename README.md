# JavaScript Class Implementation

This implementation adds the capability for a class to have [protected members](#readme-protected) that can be accessed by derivative class constructors.

This is a JavaScript module. It can be imported into your script like so: `import Class from "Class.mjs"`

# Class.extend()

Creates a child class. This is a static method of `Class` and its derivative classes.

## Syntax

```javascript
Class.extend(init)
Class.extend(init, call)
```

### Parameters

**<code>*init*</code>**  
An [initializer](#readme-initializer) function that is called as part of the child class's constructor. The name of the initializer is used as the name of the class.

**<code>*call*</code>** *optional*  
A handler function for when the class is called without using the `new` keyword. Default behavior is to throw a TypeError.

### Return value

The new class constructor. It has its own static copy of the `extend` method.

<a name="readme-initializer"></a>
### Initializer

The signature of an initializer function is expected to be:
```javascript
function MyClassName($super, ...args){
	//code that does not include `this`
	const protectedMembers = $super(arg1, arg2, ...);
	//code that may include `this`
}
```

**<code>*$super*</code>**  
A [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) to the parent class's constructor, bound as the first argument of the *<code>initializer</code>*. It is to be used like the [`super`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/super) keyword. It *must* be called exactly once during the execution of the initializer, *before* any reference to `this`.

<a name="readme-protected"></a>
**<code>*protectedMembers*</code>**  
An object whose members are shared among all the initializers that are executed when a new instance of the class is created. This allows a protected value defined in the initializer of a class to be accessed and modified within the initializer of a derivative class directly, without needing static getters and setters.

## Examples

### Create a new class

```javascript
const MyClass = Class.extend(function Rectangle($super, width, height){
	$super();
	this.dimensions = ()=>width+" x "+height;
});

let r = new MyClass(2, 3);

console.log(MyClass.name);		// Rectangle
console.log(r.toString());		// [object Rectangle]
console.log(r.dimensions());	// 2 x 3
```

### Use a call handler

```javascript
const Rectangle = Class.extend(
	function Rectangle($super, width, height){
		$super();
		this.dimensions = ()=>width+" x "+height;
	},
	(width, height)=>"area is "+(width*height)+" square units"	//handler for when Rectangle() is called without using `new`
);

console.log(Rectangle(2, 3));		// area is 6 square units
```

### Inherit from a superclass

```javascript
const Rectangle = Class.extend(function Rectangle($super, width, height){
	$super();
	this.dimensions = ()=>width+" x "+height;
});

const Square = Rectangle.extend(function Square($super, width){
	$super(width, width);
	//this.dimensions() is inherited from Rectangle
});

let s = new Square(2);

console.log(s.dimensions());	// 2 x 2
```

### Use static methods of the parent class

```javascript
const Rectangle = Class.extend(function Rectangle($super, width, height){
	$super();
	this.dimensions = ()=>width+" x "+height;
});
Rectangle.area = function (width, height){ return width * height; };

const Square = Rectangle.extend(function Square($super, width){
	$super(width, width);
	this.area = function (){
		return $super.area(width, width);	//here, using `$super` as an object is equivalent to using `Rectangle`
	};
});

let s = new Square(2);

console.log(Rectangle.area(2, 2));	// 4
console.log(s.area());				// 4
```

### Use protected members

```javascript
const Rectangle = Class.extend(function Rectangle($super, width, height){
	const prot = $super();
	
	prot.width = width;
	prot.height = height;
	
	Object.defineProperty(this, "width", {
		enumerable: true, configurable: true,
		get(){ return prot.width; },
		set(width){ return prot.width = width; }
	});
	Object.defineProperty(this, "height", {
		enumerable: true, configurable: true,
		get(){ return prot.height; },
		set(height){ return prot.height = height; }
	});
	
	this.dimensions = ()=>prot.width+" x "+prot.height;
});

const Square = Rectangle.extend(function Square($super, width){
	const prot = $super(width, width);
	
	Object.defineProperty(this, "width", {
		enumerable: true, configurable: true,
		get(){ return prot.width; },
		set(width){ return prot.width = prot.height = width; }
	});
	Object.defineProperty(this, "height", {
		enumerable: true, configurable: true,
		get(){ return prot.height; },
		set(height){ return prot.height = prot.width = height; }
	});
});

let s = new Square(2);
console.log(s.dimensions());	// 2 x 2
s.height = 3;
console.log(s.dimensions());	// 3 x 3
```
