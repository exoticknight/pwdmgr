export namespace main {
	
	export class FileFilter {
	    displayName: string;
	    pattern: string;
	
	    static createFrom(source: any = {}) {
	        return new FileFilter(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.displayName = source["displayName"];
	        this.pattern = source["pattern"];
	    }
	}
	export class OpenDialogOptions {
	    title: string;
	    filters: FileFilter[];
	    defaultDirectory: string;
	    defaultFilename: string;
	    canCreateDirectories: boolean;
	    resolvesAliases: boolean;
	    treatPackagesAsDirectories: boolean;
	
	    static createFrom(source: any = {}) {
	        return new OpenDialogOptions(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.title = source["title"];
	        this.filters = this.convertValues(source["filters"], FileFilter);
	        this.defaultDirectory = source["defaultDirectory"];
	        this.defaultFilename = source["defaultFilename"];
	        this.canCreateDirectories = source["canCreateDirectories"];
	        this.resolvesAliases = source["resolvesAliases"];
	        this.treatPackagesAsDirectories = source["treatPackagesAsDirectories"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class SaveDialogOptions {
	    title: string;
	    filters: FileFilter[];
	    defaultDirectory: string;
	    defaultFilename: string;
	    canCreateDirectories: boolean;
	    showHiddenFiles: boolean;
	    treatPackagesAsDirectories: boolean;
	
	    static createFrom(source: any = {}) {
	        return new SaveDialogOptions(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.title = source["title"];
	        this.filters = this.convertValues(source["filters"], FileFilter);
	        this.defaultDirectory = source["defaultDirectory"];
	        this.defaultFilename = source["defaultFilename"];
	        this.canCreateDirectories = source["canCreateDirectories"];
	        this.showHiddenFiles = source["showHiddenFiles"];
	        this.treatPackagesAsDirectories = source["treatPackagesAsDirectories"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

