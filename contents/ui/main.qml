/* This plasmoid runs similarly to a daemon. 
 * When it loads, it checks the wallpapers set for each activity, and sets them as the activity Icon.
 * 
 */

import QtQuick 1.1
import org.kde.plasma.core 0.1 as PlasmaCore

import "plasmapackage:/code/activities.js" as Activities


Item {
	id: dashboard
	width: 1
	height: 1
	property int minimumWidth: 1
	property int minimumHeight: 1
	
	PlasmaCore.DataSource {
		id: activitiesSource
		dataEngine: "org.kde.activities"

		onSourceAdded: {
			connectSource(source);
			
			if(source != 'Status') {
				Activities.getActivityWallpaper(source, data[source]);
			};
		}
		
		onSourceRemoved: {
			disconnectSource(source);
		}
		
		Component.onCompleted: {
			connectedSources = sources;
			
			var i;
			for(i = 0; i < sources.length; i++ ) {
				if(sources[i] != 'Status') {
					Activities.getActivityWallpaper(sources[i], data[sources[i]]);
				};
			};
		}
	}
	
	// Use filebrowser dataengine to monitor for changes in config files. If change detected, reparse all wallpapers.
	PlasmaCore.DataSource {
		id: fileSource
		dataEngine: "filebrowser"

		onDataChanged: {
			
			Activities.configFile = "";
			Activities.activityWallpapers = {};
			
			if(activitiesSource.connectedSources.length) {
				var i;
				for(i = 0; i < activitiesSource.sources.length; i++) {
					if(activitiesSource.sources[i] != 'Status') {
						Activities.getActivityWallpaper(activitiesSource.sources[i], activitiesSource.data[activitiesSource.sources[i]]);
					};
				}
			};

		}
		
		Component.onCompleted: {
			connectSource(Activities.configPath);
		}
	}
    
}