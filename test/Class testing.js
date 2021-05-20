import Class from "../src/Class.mjs.js"

console.group("Class");
	console.group("class");
		console.dir(Class);
		console.log(typeof Class);
		console.assert(Class.toString() === `function Class(){\r
	Object.defineProperty(this, protectedMembers, {\r
		writable: false, enumerable: false, configurable: true,\r
		value: {}\r
	});\r
}`, Class.toString());
		console.assert(Class.name === "Class", Class.name);
		console.assert(Class.prototype.toString() === "[object Class]", Class.prototype.toString());
		console.assert(Class.prototype.constructor === Class, Class.prototype.constructor);
	console.groupEnd();
	console.group("instance");
		let cl = new Class();
		console.dir(cl);
		console.log(typeof cl);
		console.assert(Class.prototype.toString() === "[object Class]", Class.prototype.toString());
		console.assert(cl.toString() === "[object Class]", cl.toString());
	console.groupEnd();
console.groupEnd();

console.group("Alpha");
	console.group("class");
		let Alpha = Class.extend(function Alpha($super){ $super(); });
		console.dir(Alpha);
		console.log(typeof Alpha);
		console.assert(Alpha.toString() === "function Alpha($super){ $super(); }", Alpha.toString());
		console.assert(Alpha.name === "Alpha", Alpha.name);
		console.assert(Alpha.prototype.toString() === "[object Class]", Alpha.prototype.toString());
		console.assert(Alpha.prototype.constructor === Class, Alpha.prototype.constructor);
	console.groupEnd();
	console.group("instance");
		let a = new Alpha();
		console.dir(a);
		console.log(typeof a);
		console.assert(a.toString() === "[object Alpha]", a.toString());
	console.groupEnd();
console.groupEnd();

console.group("Bravo");
	console.group("class");
		let Bravo = Alpha.extend(function Bravo($super){ $super(); });
		console.dir(Bravo);
		console.log(typeof Bravo);
		console.assert(Bravo.toString() === "function Bravo($super){ $super(); }", Bravo.toString());
		console.assert(Bravo.name === "Bravo", Bravo.name);
		console.assert(Bravo.prototype.toString() === "[object Alpha]", Alpha.prototype.toString());
		console.assert(Bravo.prototype.constructor === Alpha, Bravo.prototype.constructor);
	console.groupEnd();
	console.group("instance");
		let b = new Bravo();
		console.dir(b);
		console.log(typeof b);
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
		console.assert(e.message === "extend requires that 'this' be a Class constructor", e.message);
	}
	
	try{
		X = Class.extend();
		throw new Error("error was not thrown");
	}catch(e){
		console.assert(e.message === "constructor is not a function", e.message);
	}
	
	try{
		X = Class.extend(function (){});
		throw new Error("error was not thrown");
	}catch(e){
		console.assert(e.message === "constructor must be a named function", e.message);
	}
	
	try{
		X = Class.extend(function X(){}, 0);
		throw new Error("error was not thrown");
	}catch(e){
		console.assert(e.message === "applier is not a function", e.message);
	}
	
	try{
		X = Class.extend(function X(){});
		x = new X();
		throw new Error("error was not thrown");
	}catch(e){
		console.assert(e.message === "Must call super constructor before returning from derived constructor", e.message);
	}
	
	try{
		X = Class.extend(function X($super){ $super(); $super(); });
		x = new X();
		throw new Error("error was not thrown");
	}catch(e){
		console.assert(e.message === "Super constructor may only be called once", e.message);
	}
	
	try{
		X = Class.extend(function X($super){ $super._protected; });
		x = new X();
		throw new Error("error was not thrown");
	}catch(e){
		console.assert(e.message === "Must call super constructor from derived constructor before accessing protected members", e.message);
	}
	
	try{
		X = Class.extend(function X($super){ delete $super.foo; });
		x = new X();
		throw new Error("error was not thrown");
	}catch(e){
		console.assert(e.message === "invalid delete involving super constructor", e.message);
	}
	
	try{
		X = Class.extend(function X(){});
		x = X();
		throw new Error("error was not thrown");
	}catch(e){
		console.assert(e.message === "Class constructor X cannot be invoked without 'new'", e.message);
	}
console.groupEnd();
