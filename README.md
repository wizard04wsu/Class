# JavaScript Class Implementation

This no longer works in IE 11.

This implementation allows for classes to be given protected access to items in a super-class.

---

## Creating subclasses

**<samp style="background-color:transparent">*Class*.extend([*options*])</samp>**

Creates a new class that inherits from the parent class.

Parameters:
- *options* {object}  
This can include any of the following:
	
	- className {string}  
	Used as `.name` for the class constructor and in `.toString()` for instances of the class. If not specified, it will be the same as the parent class.
	
	- constructorFn {function}  
	Initializes new instances of the class. A 'Super' function is passed as the first argument; <a href="#user-content-super">see below.</a>
	
	- returnFn {function}  
	Returns a value when the constructor is called without using the 'new' keyword.

### <span id="super">The 'Super' function</span>

The first argument of the 'constructorFn' option is a function required to instantiate the class using the parent class' constructor. Basically, it acts like the 'super' keyword in ES6. It should be called as soon as possible inside the constructor, before using the 'this' keyword, to ensure that the instance is properly initialized.

**<samp id="super">*options*.constructorFn(*Super*[, *arg1*[, ...]])</samp>**

#### Example

```
let Rectangle = Class.extend({
	className:"Rectangle",
	constructorFn:function (Super, width, height){
		Super();
		this.width = width||0;
		this.height = height||0;
		this.area = function (){ return Math.abs(this.width * this.height); };
		this.whatAmI = function (){ return "I am a rectangle."; };
	},
	returnFn:function (width, height){
		return Math.abs((width||0) * (height||0));
	}
});

let Square = Rectangle.extend({
	className:"Square",
	constructorFn:function (Super, width){
		Super(width, width);
		Object.defineProperty(this, "height", { get:function (){ return this.width; }, set:function (val){ this.width = 1*val||0; }, enumerable:true, configurable:true });
		let iAm = [this.whatAmI(), "I am a square."].join(" ");
		this.whatAmI = function (){ return iAm; };
	},
	returnFn:function (width){
		return Math.pow(width||0, 2);
	}
});

let s = new Square(3);

s.toString();	//[instance of Square]
s.area();		//9
s.height = 4;
s.area();		//16
s.whatAmI();		//I am a rectangle. I am a square.

```

### Protected members

Additionally, a class can give its descendants protected access to its private variables. Once <code>*Super*()</code> is called within the constructor, the protected properties of its parent class are made available via <code>*Super*.protected</code>. This object will be available to child classes as well; any additions/deletions/overloads of its members that are made here in the constructor will be reflected in the class' descendants.

#### Example

```
let Alpha = Class.extend({
	className:"Alpha",
	constructorFn:function (Super){
		Super();
		let randomInstanceID = Math.random();
		Super.protected.rando = randomInstanceID;
	}
});

let Bravo = Alpha.extend({
	className:"Bravo",
	constructorFn:function (Super){
		Super();
		this.foo = "My ID is "+Super.protected.rando;
	}
});

let b = new Bravo();

b.foo;		//My ID is ...

```


---

### Private members

A WeakMap or a symbol can be used to implement private members for class instances, allowing functions defined both inside and outside of the constructor to share data.

#### Example using a WeakMap

```
let Cuber = (function (){
	
	const private = new WeakMap();
	
	function cube(){ return Math.pow(private.get(this).val, 3); }
	
	return Class.extend({
		constructorFn: function (Super, myVal){
			Super();
			private.set(this, { val: myVal });
			this.cube = cube;
		}
	});
	
})();

let c = new Cuber(5);

c.cube();	//125
```


---

## Avoid conflicts between scripts

**<samp>Class.noConflict()</samp>**

Restores `Class` to what it was before this script replaced it. The return value is this implementation of Class, so it can be assigned to another variable.
