var road = function road()
{
	var data = [];		// Object container of the information
	var idCounter = 0;	// Avoid CID duplicates
	
	function genID()	// Generate Cache ID at the moment to Add or Set new data
	{
		try
		{
			var now = new Date();

			var components = [
				now.getFullYear(),
				(now.getMonth() + 1) < 9 ? '0' + now.getMonth().toString() : now.getMonth().toString(),
				(now.getDate() < 9) ? '0' + now.getDate().toString() : now.getDate().toString(),
				now.getHours(),
				now.getMinutes(),
				now.getSeconds(),
				now.getMilliseconds()
			];

			return components.join("");
		}
		catch(err)
		{
			return '';
		}
	}
		
	return {
		
		add: function add(obj, fun) {
			try {
				// Initialize
				fun = fun || {};
				fun.send_back = fun.send_back || false;
				
				var length = 0;
				// If the object was passed
				if (obj) 
					length = obj.length || 1;
				else
				// If object was not passed
					return null;
				
				// If it is an Array of Objects
				if (length > 1)
				{
					// Loop and add the properties to each Object
					for (var i = 0; i < length; i++)
					{
						obj[i].cid 		= genID() + i.toString(); // Avoid duplicity adding the counter
						obj[i].status 	= 'new';
						
						// Add the Object
						data.push(obj[i]);	
					}
				}
				else
				// If it is just one Object
				{
					obj.cid 		= genID() + idCounter.toString();
					obj.status 		= 'new';
						
					data.push(obj);
					
					idCounter++;
					idCounter = (idCounter > 99) ? 0 : idCounter;

				}
					
				// Call OK Event function
				if (fun.ok)
					fun.ok.call();
				
				// Return Object
				if (fun.sendBack)
					return obj;
			}
			catch (err)
			{
				// Call BAD Event function
				if (fun.bad)
					fun.bad.call();
				
				throw err; 
			}
		},
		
		remove: function remove(cid) {
			try
			{
				// Check if a cid was not passed
				if (!cid || this.length() == 0)
					return null;
				
				var currentData = data;
				var removeIndex = data.map(function(currentData) { return currentData.cid; }).indexOf(cid);
				
				// If an object was found
				if (removeIndex >= 0) 
					data.splice(removeIndex, 1);
				else
					return null;
			}
			catch(err)
			{ throw err; }
		},
				
		setData: function setData(newData) {
			try
			{
				data = [];
				data = this.add(newData, { sendBack: true});
			}
			catch(err)
			{ throw err; }
		},
		
		getAll: function getAll() {
			try {
				return data;
			}
			catch (err)
			{ throw err; }
		},
		
		getByCID: function getByCID(cid) {
			try
			{
				if (!cid)
					return null;
				
				return Enumerable.From(data).Where(
													function (x) { 
														return x.cid.toString() == cid.toString() 
													})
											.Select()
											.ToArray()[0];
			}
			catch(err) { return err; }
		},
		
		length: function length() {
			try {
				return data.length;
			}
			catch (err)
			{ throw err; }
		}
		
	};
	
};