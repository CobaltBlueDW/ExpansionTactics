/**
 * ...
 * @author CobaltBlue
 */
package org.expansiontactics{

import flash.net.URLRequest;
import deng.fzip.FZip;
import deng.fzip.FZipFile;
import flash.display.Loader;
import flash.events.*;

import com.adobe.serialization.json.*;

public dynamic class ExtaC extends EventDispatcher{
	
	public var zip:FZip;
	public var obj:Object;
	
	public function ExtaC(){
		
	}
	
	public function load(filePath:String):void{
		// load zip
		zip = new FZip();
		zip.addEventListener(Event.COMPLETE, zipLoaded);
		zip.load(new URLRequest(filePath));
	}
	
	protected function zipLoaded(e:Event):void {
		//grabe base file
		var baseJson:FZipFile = zip.getFileByName("base.json");
		if (!baseJson) {
			trace("failed loading base.json");
			return;
		}
		
		//convert base file into base object
		try{
			obj = JSON.decode(baseJson.getContentAsString());
		}catch(e:Error){
			trace(e.message);
		}
		
		this.grabFiles(obj);
		
		//alert the completion of this job
		this.dispatchEvent(new Event(Event.COMPLETE));
		
	}
	
	protected function grabFiles(ref:Object):void{
		for(var key:String in ref){
			if(ref[key] is String && ref[key].substr(0, 7) == "file://"){
			
				var file:FZipFile = zip.getFileByName(ref[key].substr(7));
				if(!file) throw new Error("Failed to load internal file (" + ref[key].substr(7) + ")");
				
				switch(ref[key].substr( -4, 4).toLowerCase()){
					case "json":
						ref[key] = JSON.decode(file.getContentAsString());
						this.grabFiles(ref[key]);
					break;
					case ".png": case ".jpg": case ".gif":
						var loader:Loader = new Loader();
						loader.loadBytes(file.content);
						ref[key] = loader;
					break;
					case ".swf":
						var loader2:Loader = new Loader();
						loader2.loadBytes(file.content);
						ref[key] = loader2;
					break;
					default:
						ref[key] = file;
				}
				
			}else if(ref[key] is Object || ref[key] is Array){
				this.grabFiles(ref[key]);
			}
		}
	}
	
}//class
}//package
