var fs = require("fs");
var path = require("path");

module.exports = {
	deleteFolderRecursive: function (path, keepDir) {
		if (fs.existsSync(path)) {
			fs.readdirSync(path).forEach(function (file, index) {
				var curPath = path + "/" + file;
				if (fs.lstatSync(curPath).isDirectory()) {
					// recurse
					module.exports.deleteFolderRecursive(curPath);
				} else {
					// delete file
					fs.unlinkSync(curPath);
				}
			});
			fs.rmdirSync(path);

			if (keepDir) {
				fs.mkdirSync(path);
			}
		}
	},

	deleteFile: function (...paths) {
		paths.forEach(path => {
			if (fs.existsSync(path) && !fs.lstatSync(path).isDirectory()) {
				fs.unlinkSync(path);
			}
		});
	},

	copyFileSync: function (source, target) {
		let targetFile = target;
		//if target is a directory a new file with the same name will be created
		if (fs.existsSync(target)) {
			if (fs.lstatSync(target).isDirectory()) {
				targetFile = path.join(target, path.basename(source));
			}
		} else {
			module.exports.createDirAlongThePath(target);
		}
		fs.writeFileSync(targetFile, fs.readFileSync(source));
	},

	copyFolderRecursiveSync: function (source, target) {
		let targetFolder;

		if(!source.endsWith('/')) {
			//check if folder needs to be created or integrated
			targetFolder = path.join(target, path.basename(source));
			module.exports.createDirAlongThePath(targetFolder);
		} else {
			// copy content directly
			module.exports.createDirAlongThePath(target);
			targetFolder = target;
		} 
	
		//copy
		if (fs.lstatSync(source).isDirectory()) {
			const files = fs.readdirSync(source);

			// skip folders that contain '.dontcopy' file
			if (!files.find(file => file === '.dontcopy')) {
				if (!fs.existsSync(targetFolder)) {
					fs.mkdirSync(targetFolder);
				}

				files.forEach(function (file) {
					var curSource = path.join(source, file);
					if (fs.lstatSync(curSource).isDirectory()) {
						module.exports.copyFolderRecursiveSync(curSource, targetFolder);
					} else {
						module.exports.copyFileSync(curSource, targetFolder);
					}
				});
			}
		}
	},

	searchFiles: function (startPath, filter, pathMask) {
		let output = [];

		if(Array.isArray(startPath)) {
			startPath.forEach(path => {
				output = output.concat(module.exports.searchFiles(path, filter, pathMask));
			})			
			return output;
		}

		if (!fs.existsSync(startPath)) {
			return output;
		}

		const files = fs.readdirSync(startPath);
		for (let i = 0; i < files.length; i++) {
			const filename = path.join(startPath, files[i]);
			const stat = fs.lstatSync(filename);
			if (stat.isDirectory() && !filename.includes('node_modules')) {
				output = output.concat(module.exports.searchFiles(filename, filter, pathMask));
			}
			else if ((!pathMask || startPath.indexOf('/' + pathMask + '/') >= 0 || startPath.endsWith(pathMask)) 
			&& (!filter || (Array.isArray(filter) && filter.filter(f => filename.indexOf(f) >= 0).length)  || filename.indexOf(filter) >= 0)) {
				output.push(filename);
			};
		};
		return output;
	},

	fileToStr: function (path) {
		const file = fs.readFileSync(path, "utf8");
		return file;
	},

	strToFile: function (path, content) {
		module.exports.createDirAlongThePath(path);
		if (fs.existsSync(path)) {
			fs.unlinkSync(path);
		}
		fs.writeFileSync(path, content);
	},

	createDirAlongThePath: function (filePath) {
		const dirname = path.dirname(filePath);
		if (fs.existsSync(dirname)) {
			return true;
		}
		module.exports.createDirAlongThePath(dirname);
		fs.mkdirSync(dirname);
	}
}
