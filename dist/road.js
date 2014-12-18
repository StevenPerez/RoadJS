var road = function road()
{
	var data = [];		// Object container of the information
	var idCounter = 0;	// Avoid CID duplicates
	
	// Generate Cache ID at the moment to Add or Set new data
	function genID()	
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
	
	// Update the Destination property's values base on the Source
	// when key properties match
	function updateProperties(Source, Destination)
	{
		try {
			
			for (var key in Source) {

				if(Destination.hasOwnProperty(key)){
					Destination[key] = Source[key];
				}
				
			}
		}
		catch (err)
		{ throw err; }
			
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
					throw 'Missing object to be included';
				
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
					throw 'Missing cid or No data in memory';
				
				// Get the index of the item to delete
				var removeIndex = data.map(function(data) { return data.cid; }).indexOf(cid);
				
				// If an object was found
				if (removeIndex >= 0) 
					data.splice(removeIndex, 1);
				else
					return null;
			}
			catch(err)
			{ throw err; }
		},
		
		update: function update(obj, cid, fun) {
			try {
				// Validations
				if (!obj)
					throw 'Missing object';
								
				if (cid)
				{
					if (typeof(cid) == 'number')
						throw 'cid value should be String';
				}
				
				var length = 0;
				// If the object was passed
				if (obj) 
					length = obj.length || 1;
				else
				// If object was not passed
					throw 'Missing object to be included';
				
				// If it is an Array of Objects to be updated
				if (length > 1)
				{
					// Loop and add the properties to each Object
					for (var i = 0; i < length; i++)
					{
						if (!obj[i].cid)
							throw 'For array updates it is required the cid property on each object.';
						// Get the object from Data by cid
						var objData = this.getByCID(obj[i].cid, false);
						
						// Validate if item was found
						if (objData == undefined)
							throw 'No item found for cid ' + cid.toString();
						
						// Update the properties between Source and Destination
						updateProperties(obj[i], objData);
						objData.status = 'changed';
					}
				}
				else
				// If it is just one Object
				{
					if (!obj.cid && !cid)
						throw 'Missing cid';
				
					if (!cid && obj.cid)
						cid = cid.toString() || obj.cid.toString();
					
					// Get the object from Data by cid
					var objData = this.getByCID(cid.toString(), false);
					
					// Validate if item was found
					if (objData == undefined)
						throw 'No item found for cid ' + cid.toString();
					
					// Update the properties between Source and Destination
					updateProperties(obj, objData);
					
					// Change Status and reinforce the cid item
					objData.cid = cid.toString();
					objData.status = 'changed';
				}
				
			}
			catch (err)
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
		
		getByCID: function getByCID(cid, isClone) {
			try
			{	
				// If it is undefined then create a Clone of the
				// returned object
				if (isClone == undefined) { isClone = true; }
				
				// Validate cid
				if (!cid)
					throw 'Missing cid';
				
				// If it is necessary to return a new object
				if (isClone)
				{
					return Object.create(Enumerable.From(data).Where(
													function (x) { 
														return x.cid.toString() == cid.toString() 
													})
											.Select()
											.ToArray()[0]);
				}
				else
				// If not, then work with the object linked
				{
					return Enumerable.From(data).Where(
													function (x) { 
														return x.cid.toString() == cid.toString() 
													})
											.Select()
											.ToArray()[0];
				}
				
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

var a = road();
a.add({ name: 'Steven', age: 20});
a.add({ name: 'Mochi', age: 21});
a.add({ name: 'Marta', age: 22});