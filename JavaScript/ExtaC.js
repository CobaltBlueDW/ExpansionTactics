/**	Expansion Tactics:
*	
*	@author	David Wipperfurth
*	@dated	5/5/12
*/

//requires zipLib/archive.js 

(function(){
	//declare namespace
	E = NameSpace('Engine.ExpansionTactics');

	/** Fabricator:  Manages construction of this object and it's constructor inheritance chain.
	*
	*	@param	object	infoObject	InterpreterConstructor param
	*/
	E.ExtaC = function(filePath){
		this.ExtaCConstructor(filePath);
	};
	
	//extends from Object
	E.ExtaC.prototype = new Object();

	//constructor declaration
	E.ExtaC.prototype.constructor = E.ExtaC;

	//static methods
	E.ExtaC.canvas = null;
	E.ExtaC.cContext = null;
	
	//memebers
	E.ExtaC.prototype.zip = null;		//unzip object
	E.ExtaC.prototype.obj = null;		//unzipped object
	E.ExtaC.prototype.filePath = null;	//zip file path
	E.ExtaC.prototype.onloadCount = 0;	//load counter
	E.ExtaC.prototype.isLoading = false; //loading status
	E.ExtaC.prototype.callBack = null; //loading status
	
	//methods
	/**	Constructor:  because of the way JavaScript works(or doesn't) the actual constructor code for the class
	*	is stored here.  This function should get called once, in the class-named function, after all super 
	*	constructor calls.
	*
	*/
	E.ExtaC.prototype.ExtaCConstructor = function(filePath){
		// load zip
		this.filePath = filePath;
		this.zip = new ZipLoader(filePath);
	}
	
	E.ExtaC.prototype.load = function(callBack){
		this.callBack = callBack;
		//grabe base file
		var baseJson = this.zip.load(this.filePath+"://"+"base.json");
		if(!baseJson){
			alert("failed loading base.json");
			return;
		}
		
		//convert base file into base object
		try{
			this.obj = jQuery.parseJSON(baseJson);
		}catch(e){
			alert(e);
		}
		
		this.isLoading = true;
		this.grabFiles(this.obj);
		this.isLoading = false;
		
		//alert the completion of this job
		//alert(this.obj.races.Stonedweller.portrait);
		if(this.onloadCount == 0) this.callBack();
		
	}
	
	E.ExtaC.prototype.grabFiles = function(ref){
		for(var key in ref){
			if(ref[key].substr && ref[key].substr(0, 7) == "file://"){
				switch(ref[key].substr(ref[key].lastIndexOf('.')).toLowerCase()){
					case ".json":
						ref[key] = jQuery.parseJSON(this.zip.load(this.filePath+"://"+ref[key].substr(7)));
						this.grabFiles(ref[key]);
					break;
					case ".png": case ".jpeg": case ".jpg": case ".gif":
						this.loadImageData(ref,key);
					break;
					case ".swf":
						ref[key] = this.filePath+"://"+ref[key].substr(7);
					break;
					case ".js":
						this.zip.loadScript(this.filePath+"://"+ref[key].substr(7));
						ref[key] = this.filePath+"://"+ref[key].substr(7);
					break;
					case ".css":
						this.zip.loadCSS(this.filePath+"://"+ref[key].substr(7));
						ref[key] = this.filePath+"://"+ref[key].substr(7);
					break;
					default:
						ref[key] = this.zip.load(this.filePath+"://"+ref[key].substr(7));
				}
				
			}else if(ref[key] instanceof Object){
				this.grabFiles(ref[key]);
			}
		}
	}
	
	E.ExtaC.prototype.loadImageData = function(ref,key){
		this.onloadCount++;
		if(!E.ExtaC.canvas) E.ExtaC.canvas = document.createElement("canvas");
		if(!E.ExtaC.cContext) E.ExtaC.cContext = E.ExtaC.canvas.getContext('2d');
		var imgLoader = document.createElement("img");
		var self = this;
		imgLoader.onload = function(){
			E.ExtaC.cContext.drawImage(imgLoader, 0, 0, imgLoader.width, imgLoader.height);
			ref[key] = E.ExtaC.cContext.getImageData(0, 0, imgLoader.width, imgLoader.height);
			self.onloadCount--;
			if(!self.isLoading && self.onloadCount===0) self.callBack();
		}
		imgLoader.src = this.zip.loadImage(this.filePath+"://"+ref[key].substr(7));
	}
	
})();