# JavaScript Class Implementation

IE 11 is still in use, so this was made to work in it as well.

This implementation also allows for classes to be given protected access to items in a super-class. If symbols are supported, this also allows for private members within a class.

---

## Creating subclasses

**<samp style="background-color:transparent">*Class*.extend([*options*])</samp>**

Creates a new class that inherits from the parent class.

Parameters:
- *options* {object}  
This can include any of the following:
	
	- *className* {string}  
	Used as `.name` for the class constructor and in `.toString()` for instances of the class. If not specified, it will be the same as the parent class.
	
	- *constructorFn* {function}  
	Initializes new instances of the class. A "super" function is passed as the first argument; <a href="#user-content-super">see below.</a>
	
	- *returnFn* {function}  
	Returns a value when the constructor is called without using the 'new' keyword.
	
	- *extensions* {object}  
	Additional and overriding properties and methods for the prototype of the class.

### <span id="super">The 'Super' function</span>

The first argument of the 'constructorFn' option is a function required to instantiate the class using the parent class' constructor. Basically, it acts like the 'super' keyword in ES6. It should be called as soon as possible inside the constructor, before using the 'this' keyword, to ensure that the instance is properly initialized.

**<samp id="super">*options*.*constructorFn*(*Super*[, *arg1*[, ...]])</samp>**

#### Example

```
let Rectangle = Class.extend({
	className:"Rectangle",
	constructorFn:function (Super, width, height){
		Super();
		this.width = width||0;
		this.height = height||0;
		Object.defineProperty(this, "area", { get:function (){ return Math.abs(this.width * this.height); }, enumerable:true, configurable:true });
	},
	returnFn:function (width, height){
		return Math.abs((width||0) * (height||0));
	},
	extensions:{
		foo:"I am a rectangle."
	}
});

let Square = Rectangle.extend({
	className:"Square",
	constructorFn:function (Super, width){
		Super(width, width);
		Object.defineProperty(this, "height", { get:function (){ return this.width; }, set:function (val){ this.height = this.width = val||0; }, enumerable:true, configurable:true });
	},
	returnFn:function (width){
		return Math.pow(width||0, 2);
	},
	extensions:{
		foo:"I am a rectangle and a square."
	}
});

let s = new Square(3);

s.toString();	//[instance of Square]
s.area;		//9
s.height = 4;
s.area;		//16
s.foo;		//I am a rectangle and a square.

```

### Protected members

Additionally, descendant classes can be given protected access to items in a super-class' constructor. This is done by providing getters and setters that are inherited. Once <code>*Super*()</code> is called within the constructor, the protected properties are made available as static properties of <code>*Super*</code>. The function also gains two methods that allow you to add/remove protected access to properties.

**<samp>*Super*.addProtectedMember(*name*, *getter*[, *setter*])</samp>**

Adds a getter and a setter (at least one, if not both) that will only be accessible within the constructors of any descendant classes.

**<samp>*Super*.removeProtectedMember(*name*)</samp>**

Removes a getter/setter so that it is not accessible from any descendants of this class.

#### Example

```
let Alpha = Class.extend({
	className:"Alpha",
	constructorFn:function (Super){
		Super();
		let randomInstanceID = Math.random();
		Super.addProtectedMember("rando", function(){return randomInstanceID});
	}
});

let Bravo = Alpha.extend({
	className:"Bravo",
	constructorFn:function (Super){
		Super();
		this.foo = "My ID is "+Super.rando;
	}
});

let b = new Bravo();

b.foo;		//My ID is ...

```


---

### Private members

A WeakMap or a symbol can be used to implement private members for the class, allowing functions defined both inside and outside of the constructor to share data. This can also be used to pass along access to the protected members.

#### Example using a WeakMap

```
let Alpha = Class.extend({
	constructorFn:function (Super){
		Super();
		let foo = "foo";
		Super.addProtectedMember("foo", function(){return foo});
	}
});

let Bravo = (function (){
	
	const private = new WeakMap();
	
	function cube(){ return private.get(this).val**3; }
	
	return Alpha.extend({
		constructorFn: function (Super, myVal){
			Super();
			private.set(this, {
				val: myVal,
				square: (function (){ return private.get(this).val**2; }).bind(this),
				protected: Super
			});
			this.cube = cube;
		},
		extensions: {
			test: function (){ console.log(private.get(this).val, private.get(this).square(), this.cube(), private.get(this).protected.foo); }
		}
	});
	
})();

let b = new Bravo(5);

b.test()	//5 25 125 "foo"
```

#### Example using a symbol

```
let Alpha = Class.extend({
	constructorFn:function (Super){
		Super();
		let foo = "foo";
		Super.addProtectedMember("foo", function(){return foo});
	}
});

let Bravo = (function (){
	
	const private = Symbol();
	
	function cube(){ return this[private].val**3; }
	
	return Alpha.extend({
		constructorFn: function (Super, myVal){
			Super();
			this[private] = {
				val: myVal,
				square: (function (){ return this[private].val**2; }).bind(this),
				protected: Super
			};
			this.cube = cube;
		},
		extensions: {
			test: function (){ console.log(this[private].val, this[private].square(), this.cube(), this[private].protected.foo); }
		}
	});
	
})();

let b = new Bravo(5);

b.test()	//5 25 125 "foo"
```


---

## Avoid conflicts between scripts

**<samp>Class.noConflict()</samp>**

Restores `Class` to what it was before this script replaced it. The return value is this implementation of Class, so it can be assigned to another variable.
