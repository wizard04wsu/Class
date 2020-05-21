# JavaScript Class Implementation

This implementation allows for classes to be given protected access to items in a super-class.

This is a JavaScript module.

---

## Creating subclasses

**<samp>*Class*.extend([*options*])</samp>**

Creates a new class that inherits from the parent class.

Parameters:
- **<code>*options*</code>** {object}  
This can include any of the following:
	
	- **<code>className</code>** {string}  
	Used for the `name` property of the class constructor, and in the `toString` method for instances of the class. If not specified, it will be the same as the parent class.
	
	- **<code>constructorFn</code>** {function}  
	Initializes new instances of the class.<br><br>
	**<samp>*options*.constructorFn(*Super*[, ...])</samp>**<br><br>
	**<code>*Super*</code>** {function} is to be called from inside `constructorFn` to initialize the class, using the class's parent's constructor. It should be called as soon as possible, before using the `this` keyword, to ensure that the instance is properly initialized.<br><br>
	Additionally, <code>*Super*</code> provides access to protected members (<a href="#protected-members">see below</a>).
	
	- **<code>returnFn</code>** {function}  
	Returns a value when the constructor is called without using the `new` keyword.

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

A class can give its descendants protected access to its private variables. Once <code>*Super*</code> is called within the constructor, the protected properties of its parent class are made available via **<code>*Super*.protected</code>**. This object will be available to child classes as well; any additions/deletions/overloads of its members that are made here in the constructor will be reflected in the class' descendants.

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
