import Class from "../src/Class.mjs.js"

let Alpha = (function (){
	
	const $private = Symbol("private members of Alpha instances");
	
	function getMyVal(){
		return this[$private].val;
	}
	
	return Class.extend({
		className: "Alpha",
		constructorFn: function (Super, myVal){
			Super();
			this[$private] = {};
			this[$private].val = myVal;
			Object.defineProperty(Super.protected, "myVal", {
				get: ()=>this[$private].val,
				enumerable:true, configurable:true
			});
			this.getMyVal = getMyVal;
		}
	});
	
})();

let Bravo = (function (){
	
	const $private = Symbol("private members of Bravo instances");
	
	function viaPrivate(){
		return this[$private].getVal();
	}
	function viaReferenceToProtected(){
		return this[$private].protected.myVal;	//Super.protected.myVal
	}
	
	return Alpha.extend({
		className: "Bravo",
		constructorFn: function (Super, myVal){
			Super(myVal);
			this.viaConstructor = function (){ return Super.protected.myVal; };
			this[$private] = {};
			this[$private].getVal = function (){ return Super.protected.myVal; };
			this[$private].protected = Super.protected;
			this.viaPrivate = viaPrivate,
			this.viaReferenceToProtected = viaReferenceToProtected
		}
	});
	
})();

console.group("Alpha instance");
let a = new Alpha(5);
console.assert(a.getMyVal() === 5, "getMyVal()", a.getMyVal());
console.groupEnd();

console.group("Bravo instance");
let b = new Bravo(10);
console.assert(b.getMyVal() === 10, "getMyVal()", b.getMyVal());	//via inherited method
console.assert(b.viaConstructor() === 10, "viaConstructor()", b.viaConstructor());
console.assert(b.viaPrivate() === 10, "viaPrivate()", b.viaPrivate());
console.assert(b.viaReferenceToProtected() === 10, "viaReferenceToProtected()", b.viaReferenceToProtected());
console.groupEnd();
