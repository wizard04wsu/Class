import Class from "./Class.mjs.js"

console.group("Class");
	console.group("class");
		console.dir(Class);
		console.assert(Class.name === "Class", Class.name);
		console.assert(Class.prototype.toString() === "[object Class]", Class.prototype.toString());
		console.assert(Class.prototype.constructor === Class, Class.prototype.constructor);
	console.groupEnd();
	console.group("instance");
		let cl = new Class();
		console.dir(cl);
		console.assert(cl.toString() === "[object Class]", cl.toString());
	console.groupEnd();
console.groupEnd();

console.group("Alpha");
	console.group("class");
		let Alpha = Class.extend(function Alpha($super){ $super(); });
		console.dir(Alpha);
		console.assert(Alpha.toString() === "function Alpha($super){ $super(); }", Alpha.toString());
		console.assert(Alpha.name === "Alpha", Alpha.name);
		console.assert(Alpha.prototype.toString() === "[object Alpha]", Alpha.prototype.toString());
		console.assert(Alpha.prototype.constructor === Alpha, Alpha.prototype.constructor);
		//console.assert(Alpha.__proto__ === Class, Alpha.__proto__);
	console.groupEnd();
	console.group("instance");
		let a = new Alpha();
		console.dir(a);
		console.assert(a.toString() === "[object Alpha]", a.toString());
	console.groupEnd();
console.groupEnd();

console.group("Bravo");
	console.group("class");
		let Bravo = Alpha.extend(function Bravo($super){ $super(); });
		console.dir(Bravo);
		console.log(Bravo.toString());
		console.assert(Bravo.name === "Bravo", Bravo.name);
		console.assert(Bravo.prototype.toString() === "[object Bravo]", Alpha.prototype.toString());
		console.assert(Bravo.prototype.constructor === Bravo, Bravo.prototype.constructor);
		//console.assert(Bravo.__proto__ === Alpha, Bravo.__proto__);
	console.groupEnd();
	console.group("instance");
		let b = new Bravo();
		console.dir(b);
		console.assert(b.toString() === "[object Bravo]", b.toString());
	console.groupEnd();
console.groupEnd();

console.group("Error Traps");
	let X, x, Y, y;
	
	X = {};
	X.extend = Class.extend;
	try{
		Y = X.extend(function X($super){ $super(); });
		throw new Error("error was not thrown");
	}catch(e){
		console.assert(e.message === "'extend' method requires that 'this' be a Class constructor", e.message);
	}
	
	try{
		X = Class.extend();
		throw new Error("error was not thrown");
	}catch(e){
		console.assert(e.message === "'init' is not a function", e.message);
	}
	
	try{
		X = Class.extend(function (){});
		throw new Error("error was not thrown");
	}catch(e){
		console.assert(e.message === "'init' must be a named function", e.message);
	}
	
	try{
		X = Class.extend(function X(){}, 0);
		throw new Error("error was not thrown");
	}catch(e){
		console.assert(e.message === "'call' is not a function", e.message);
	}
	
	try{
		X = Class.extend(function X(){});
		x = new X();
		throw new Error("error was not thrown");
	}catch(e){
		console.assert(e.message === "must call super constructor before returning from derived constructor", e.message);
	}
	
	try{
		X = Class.extend(function X($super){ $super(); $super(); });
		x = new X();
		throw new Error("error was not thrown");
	}catch(e){
		console.assert(e.message === "super constructor may be called only once during execution of derived constructor", e.message);
	}
	
	try{
		X = Class.extend(function X($super){ delete $super.foo; });
		x = new X();
		throw new Error("error was not thrown");
	}catch(e){
		console.assert(e.message === "invalid delete involving super constructor", e.message);
	}
	
	try{
		X = Class.extend(function X($super){ new $super(); });
		x = new X();
		throw new Error("error was not thrown");
	}catch(e){
		console.assert(e.message === "unexpected use of 'new' keyword", e.message);
	}
	
	/*try{
		X = Class.extend(function X($super){ this; $super(); });
		x = new X();
		throw new Error("error was not thrown");
	}catch(e){
		console.assert(e.message === "must call super constructor before accessing 'this'", e.message);
	}*/
	
	try{
		X = Class.extend(function X($super){ this.test; $super(); });
		x = new X();
		throw new Error("error was not thrown");
	}catch(e){
		console.assert(e.message === "must call super constructor before accessing 'this'", e.message);
	}
	
	try{
		X = Class.extend(function X($super){ this(); $super(); });
		x = new X();
		throw new Error("error was not thrown");
	}catch(e){
		console.assert(e.message === "this is not a function", e.message);
	}
	
	try{
		X = Class.extend(function X($super){ new this(); $super(); });
		x = new X();
		throw new Error("error was not thrown");
	}catch(e){
		console.assert(e.message === "this is not a constructor", e.message);
	}
	
	try{
		X = Class.extend(function X($super){ $super(); this; });
		x = new X();
	}catch(e){
		throw e;
	}
	
	try{
		X = Class.extend(function X(){});
		x = X();
		throw new Error("error was not thrown");
	}catch(e){
		console.assert(e.message === "class constructor 'X' cannot be invoked without 'new'", e.message);
	}
console.groupEnd();

console.group("Inheritance");
	console.assert(b instanceof Bravo, b);
	console.assert(b instanceof Alpha, b);
	console.assert(b instanceof Class, b);
	console.assert(b.constructor === Bravo, b.constructor);
	console.assert(Bravo.prototype instanceof Alpha, Bravo.prototype);
	console.assert(!(Bravo.prototype instanceof Bravo), Bravo.prototype);
	console.assert(Bravo.prototype.constructor === Bravo, Bravo.prototype.constructor);
	console.assert(!(a instanceof Bravo), a);
	console.assert(a instanceof Alpha, a);
	console.assert(a instanceof Class, a);
	console.assert(a.constructor === Alpha, a.constructor);
	console.assert(Alpha.prototype instanceof Class, Alpha.prototype);
	console.assert(Alpha.prototype.constructor === Alpha, Alpha.prototype.constructor);
console.groupEnd();

console.group("Rectangle & Square");
	let testCount = 0;
	let Rectangle = Class.extend(function Rectangle($super, width, height){
			let protectedMembers = $super();
			this.width = 1*width||0;
			this.height = 1*height||0;
			this.area = function (){ return Math.abs(this.width * this.height); };
			protectedMembers.color = "red";
			this.whatAmI = function (){ return `I am a ${protectedMembers.color} rectangle.`; };
			
			if(testCount++ < 1){
				let expectedArea = Math.abs((1*width||0) * (1*height||0)),
					area;
				try{
					area = Rectangle($super, width, height);
				}catch(e){
					console.assert(e.message === "super constructor may be called only once during execution of derived constructor", e.message);
				}
				area = this.constructor(width, height);
				console.assert(area === expectedArea, area, this.constructor);
			}
		},
		(width, height)=>Math.abs((1*width||0) * (1*height||0))
	);
	Rectangle.draw = function (obj){ console.log(`Drawing: ${obj.whatAmI()}`); };

	let Square = Rectangle.extend(function Square($super, width){
			let protectedMembers = $super(width, width);
			Object.defineProperty(this, "height", {
				get:function (){ return this.width; },
				set:function (val){ return this.width = 1*val||0; },
				enumerable:true, configurable:true
			});
			let superIs = this.whatAmI;
			this.whatAmI = function (){ return `${superIs()} I am a ${protectedMembers.color} square.`; };
			this.changeColor = function (color){ protectedMembers.color = color; };
			$super.draw(this);
		},
		(width)=>Math.pow(1*width||0, 2)
	);

	let s = new Square(3);
	
	console.assert(s.toString() === "[object Square]", s.toString());
	console.assert(s.width === 3, s.width);
	console.assert(s.height === 3, s.height);
	console.assert(s.area() === 9, s.area());
	s.height = 4;
	console.assert(s.width === 4, s.width);
	console.assert(s.height === 4, s.height);
	console.assert(s.area() === 16, s.area());
	console.assert(s.whatAmI() === "I am a red rectangle. I am a red square.", s.whatAmI());
	console.assert(s.color === void 0, s.color);
	s.changeColor("blue");
	console.assert(s.whatAmI() === "I am a blue rectangle. I am a blue square.", s.whatAmI());
console.groupEnd();

console.group("Readme Examples");
	console.group("Create a new class");
		let MyClass = Class.extend(function Rectangle($super, width, height){
			$super();
			this.area = function (){ return width * height; };
		});

		let r = new MyClass(2, 3);

		console.assert(MyClass.name === "Rectangle", MyClass.name);
		console.assert(r.toString() === "[object Rectangle]", r.toString());
		console.assert(r.area() === 6, r.area());
	console.groupEnd();
	
	console.group("Use an applier function");
		Rectangle = Class.extend(function Rectangle($super, width, height){
				$super();
				this.dimensions = ()=>width+" x "+height;
			},
			(width, height)=>"area = "+(width*height)	//applier function for when Rectangle() is called without using `new`
		);
		
		console.assert((new Rectangle(2, 3)).toString() === "[object Rectangle]", (new Rectangle(2, 3)).toString());
		console.assert(Rectangle(2, 3) === "area = 6", Rectangle(2, 3));
	console.groupEnd();
	
	console.group("Inherit from a parent class");
		Rectangle = Class.extend(function Rectangle($super, width, height){
			$super();
			this.dimensions = ()=>width+" x "+height;
		});

		Square = Rectangle.extend(function Square($super, width){
			$super(width, width);
			//this.dimensions() is inherited from Rectangle
		});

		s = new Square(2);

		console.assert(s.dimensions() === "2 x 2", s.dimensions());
	console.groupEnd();
	
	console.group("Use static methods of a parent class");
		Rectangle = Class.extend(function Rectangle($super, width, height){
			$super();
			this.dimensions = ()=>width+" x "+height;
		});
		Rectangle.area = function (width, height){ return width * height; };

		Square = Rectangle.extend(function Square($super, width){
			console.assert($super.area(3, 3) === 9, $super.area(3, 3));
			$super(width, width);
			this.area = function (){
				return $super.area(width, width);	//here, using `$super` as an object is equivalent to using `Rectangle`
			};
		});

		s = new Square(2);

		console.assert(Rectangle.area(2, 2) === 4, Rectangle.area(2, 2));
		console.assert(s.area() === 4, s.area());
	console.groupEnd();
	
	console.group("Use protected members");
		Rectangle = Class.extend(function Rectangle($super, width, height){
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

		Square = Rectangle.extend(function Square($super, width){
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

		s = new Square(2);
		console.assert(s.dimensions() === "2 x 2", s.dimensions());
		s.height = 3;
		console.assert(s.dimensions() === "3 x 3", s.dimensions());
	console.groupEnd();
console.groupEnd();
