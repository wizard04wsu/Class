import Class from "./Class.mjs.js"

console.group("Rectangle & Square");
	let Rectangle = Class.extend({
		className:"Rectangle",
		constructorFn:function (Super, width, height){
			Super();
			this.width = width||0;
			this.height = height||0;
			Object.defineProperty(this, "area", { get:function (){ return Math.abs(this.width * this.height); }, enumerable:true, configurable:true });
			Object.defineProperty(this, "whatAmI", { get:function (){ return "I am a rectangle."; }, enumerable:true, configurable:true });
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
			let iAm = [this.whatAmI, "I am a square."].join(" ");
			Object.defineProperty(this, "whatAmI", { get:function (){ return iAm; }, enumerable:true, configurable:true });
		},
		returnFn:function (width){
			return Math.pow(width||0, 2);
		}
	});

	let s = new Square(3);
	
	console.assert(s.toString() === "[instance of Square]", s.toString());
	console.assert(s.area === 9, s.area);
	s.height = 4;
	console.assert(s.area === 16, s.area);
	console.assert(s.whatAmI === "I am a rectangle. I am a square.", s.whatAmI);
console.groupEnd();

console.group("Alpha & Bravo");
	let Alpha = Class.extend({
		className:"Alpha",
		constructorFn:function (Super){
			Super();
			let randomInstanceID = Math.random();
			Object.defineProperty(Super.protected, "rando", {
				get:function(){return randomInstanceID},
				enumerable:true, configurable:true
			});
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

	console.log(b.foo);		//My ID is ...
console.groupEnd();