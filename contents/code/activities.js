// get activity wallpaper
var configPath = plasmoid.userDataPath("config", "plasma-desktop-appletsrc"),
	configFile,
	entry,
	i,
	activityWallpapers = {},
	defaultWallpaper = plasmoid.file("images", "defaultWallpaper.png");

function getActivityWallpaper(source, model) {
	var wallpaper = "";
	
	if (!configFile) {
		
		var urlJob = plasmoid.getUrl(configPath);
		
		urlJob.data.connect(function(job, data) {
			// connect triggers twice
			// if data is empty, the request has finished
			if(data.length) {
				// parse config file
				configFile = bin2String(data);
				
				parseConfigFile(source, model);
			}
		});
		
	} else {
		parseConfigFile(source, model);
	}

}

function parseConfigFile(source, entry) {
	
	if(entry.Name) {
		
		if(activityWallpapers[source]) {
			
			setWallpaperIcon(source, activityWallpapers[source]);
			
		} else {
		
			if(entry.State == 'Running') {
				
				// parse from appletsrc
				if(configFile.indexOf('activityId=' + source) !== -1) {
					
					var wallpaper = configFile.split('activityId=' + source)[1].split('[Wallpaper][image]')[1].split('\n\n')[0].split('wallpaper=')[1].split('\n')[0];
					
					//var userswallpapers = configFile.split('activityId=' + source)[1].split('[Wallpaper][image]')[1].split('\n\n')[0].split('userswallpapers=')[1].split('\n')[0];
					
					setWallpaper(source, wallpaper);
					
				} else {
					
					// if no configs are found
					activityWallpapers[source] = defaultWallpaper;
					
				}
				
				setWallpaperIcon(source, activityWallpapers[source]);
				
			} else {
			
				// get config file
				var activityConfigPath = plasmoid.userDataPath("data", "plasma-desktop/activities/" + source),
					activityUrlJob = plasmoid.getUrl(activityConfigPath);
			
				// set default wallpaper in case request goes wrong
				setWallpaper(source, '', '');
				setWallpaperIcon(source, activityWallpapers[source]);
				
				activityUrlJob.data.connect(function(job, data) {
					
					// connect triggers twice
					// if data is empty, the request has finished
					if(data.length) {
						
						// parse config file
						var configFile = bin2String(data),
							wallpaper = configFile.split('wallpaper=')[1].split('\n')[0];
							
							//userswallpapers = configFile.split('userswallpapers=')[1].split('\n')[0];
							
						setWallpaper(source, wallpaper);
						
						setWallpaperIcon(source, activityWallpapers[source]);
						
					}
					
				});
				
			}
			
		};
	};

}

function setWallpaper(source, wallpaper) {
	/*if(userswallpapers) {
		activityWallpapers[source] = userswallpapers;
	} else*/
	
	if(wallpaper) {
		
		// if file has extension, use as provided
		if(wallpaper.charAt(wallpaper.length - 4) == '.') {
			activityWallpapers[source] = wallpaper;
		} else {
			activityWallpapers[source] = wallpaper + 'contents/screenshot.png';
		}
		
	} else {
		
		activityWallpapers[source] = defaultWallpaper;
	}
}

// binnary array to string
function bin2String(array) {
	var result = "";
	for (var i = 0; i < array.length; i++) {
		result += String.fromCharCode(parseInt(array[i]));
	}
	return result;
}

// set wallpaper as icon
function setWallpaperIcon(source, wallpaper) {
	
	// save new model name
	var operation = activitiesSource.serviceForSource(source).operationDescription('setIcon');
	operation.Icon = wallpaper;
	
	activitiesSource.serviceForSource(source).startOperationCall(operation);
	
}