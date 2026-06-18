

// Script run within the webview itself.
(function () {





	const defstrings = [
		'//Table View Start',
		'// This document was build using Table View, learn more at: https://crimsonincapitals.github.io/',
		'//Table View End'
	]
	
	class def{

		constructor(a,b){
			this.get = (vname='example')=>{
				if(b!==undefined)return ' '+a.trim()+' '+vname.trim()+' '+b.trim()+' '
				else return ' '+a.trim()+' '
			}
			this.named = b===undefined ? false : true
			this.deconstruct = (start='export const Name = ')=>{
				if(b===undefined)return undefined
				start = start.trim()
				let name = start.startsWith(a.trim())? start.slice(a.trim().length).trim() : start
				if(b!==undefined){name = name.endsWith(b.trim())? name.slice(0,name.length-b.trim().length).trim() : name}
				return name
			}
			this.identifies = a==''&& b!==undefined ?b:a
		}
	}
	class TableType{
		constructor(name,askName,display,before,after,front,back){
			this.before = (vname)=>defstrings[0].trim()+' type='+name+' '+defstrings[1].trim()+'\n'
			this.newBefore = (vname)=>this.before(vname)+before.get(vname)
			this.front=(vname)=>front.get(vname).trim()+' '
			this.forntIdentifier = front.identifies
			this.deconstructFront=(start)=>front.deconstruct(start)
			this.deconstructBefore=(start)=>before.deconstruct(start)
			this.namedRows = front.named
			this.display=display
			this.back = back+'\n'
			this.after=defstrings[2].trim()
			this.newAfter=after+'\n'+this.after
			this.askName = askName
			this.name=name
		}
	}
	const types=[
		new TableType('ec',false, 'Export Each',		new def(''),					'',	new def('export const','='),''),
		new TableType('ob',true, 'Export All: Object',	new def('export const','= {'),	'}',new def('',':'),			','),
		new TableType('ar',true, 'Export All: Array',	new def('export const','= ['),	']',new def(''),				',')
	]
	// Get a reference to the VS Code webview api.
	// We use this API to post messages back to our extension.

	// @ts-ignore

	function postMessage(type,display){
		vscode.postMessage({
			type: 'message',
			text:display,
			messagetype:type
		});
	}

	const PAIRS = {
		')': '(',
		']': '[',
		'}': '{',
		'>': '<', // Often used in HTML/XML
		'"': '"', // Quotes are symmetrical
		"'": "'",
		'`': '`'
	};
	const OPENERS = new Set(Object.values(PAIRS));
	const vscode = acquireVsCodeApi();
	const body = document.querySelector('body#root')

	const getOpentoClose=(text,open='{',close='}',cut=0)=>{
		let descend = 0
		let ascend = 0
		let textArray = text.split('')
		let indexOfClose = text.length
		for(let i = 0;i<textArray.length;i++){
			if(textArray[i] == open)descend=descend+1
			if(textArray[i] == close)ascend=ascend+1
			if(descend>=1 && ascend==descend){indexOfClose=i+1;i=textArray.length}
		}
		return text.substring(0+cut,indexOfClose-cut)
	}
	const getAllClasses=(text)=>{
		if(text.includes('class') == false){postMessage('error','Class must be within document for Class mode');
			return;}
		let [...classes] = text.split('class ').slice(1)
		let classArray = []
		for(let C of classes){
			let name = C.split('{')[0].trim()
			classArray.push(name)
		}
		return classArray
	}
	const safeSplit=(text,char)=>{
		let array =[]
		let currentSection = ''
		let opens=[]
		for(let character of text){
				if(opens.length<=0 && character==char){
				array.push(currentSection)
				currentSection=''
			}else{
				let lastopen = opens.length<=0?false:opens[opens.length-1]
				if(PAIRS[character]==lastopen)opens.pop()
				else if(OPENERS.has(character) && !(PAIRS[lastopen]==lastopen))opens.push(character)
				currentSection=currentSection.toString()+character.toString()
			}
		}
		if(currentSection!=='')array.push(currentSection)//adds last section to array if it doesnt have a comma after it
		return array
	}
	const findClass=(text,name='C')=>{
		if(text.includes('class') == false){postMessage('error','Class must be within document for Class mode');
		return;}
		if(name.startsWith('new'))name=name.slice(3).trim()
		let classes = text.split(' ').join('').split('class'+name+'{')[1]
		let constructor = getOpentoClose(classes.split('constructor')[1],'(',')',1)
		let names =[]
		let types =[]
		let defaults = []
		safeSplit(constructor,',').map(item=>{
			let name = undefined
			let type = undefined
			let def = undefined
			let equalsplit = safeSplit(item,'=')
			if(equalsplit.length>1){
				name = equalsplit[0]
				def = equalsplit[1]
			}else name = item
			let colonsplit = safeSplit(name,':')
			if(colonsplit.length>1){
				name = colonsplit[0]
				type= colonsplit[1]
			}
			names.push(name)
			types.push(type)
			defaults.push(def)
		})
		return {name:name,items:names,defaults:defaults,types:types}
	}

	const disectfromclass=(C,classInUse)=>{
		let array = safeSplit(C.substring(C.indexOf('(')+1,C.lastIndexOf(')')).split(''),',')
		let obj = classInUse.items.map((item,index)=>this[item]=array[index])
		return [obj,array]
	}
	class RowObj{
		constructor(name=undefined,defined={},array=[],position='new',absolutePosition='new',text=''){
			this.name =name
			this.defined=defined
			this.array=array
			this.position=position
			this.absolutePosition=absolutePosition
			this.text=text
		}
	}
	const IdentifyType=(line)=>{
		let typestring = line.split('type=')[1].split('//')[0].trim()
		if(types==undefined)return undefined
		let ptypes = types.filter(t=>t.name==typestring)
		return ptypes.length>=1?ptypes[0]:types[0]
	}
	const DefineTables = (lines,TableLocations,text)=>{
		const Tables =[]
		for(let tableI = 0;tableI<TableLocations.length;tableI++){
			let rows = lines.slice(TableLocations[tableI][0],TableLocations[tableI][1])
			let tableType = IdentifyType(rows[0])
			if(tableType == undefined){postMessage('error','Table type is not defined, please define a table type in the first line of the table');return}
			let name = undefined
			if(tableType.askName){
				name = tableType.deconstructBefore(rows[1])
			}
			let table = []
			let classInUse=undefined
			for(let i = 1;i<rows.length;i++){
				if(rows[i].includes('new') && !rows[i].startsWith('//')){
					let set = rows[i]
					let name =undefined
					if(tableType.namedRows){
						let split=rows[i].split('new')
						let [front,...rest] = split
						set = 'new '+rest.join('new')
						name = tableType.deconstructFront(front)
					}
					if(classInUse == undefined){classInUse=findClass(text,set.split('(')[0].trim())}
					if(set.trim().startsWith('new')){set = disectfromclass(set,classInUse)}
					let obj = new RowObj(
						name,
						set[0],
						set[1],
						i,
						i+TableLocations[tableI][0],
						rows[i]
					)
					table.push(obj)				}
				else if(rows[i].includes('=')){
					
				}
			}
			if(table.length<=0){
				let line = ((TableLocations[tableI][1]-TableLocations[tableI][0])/2)+TableLocations[tableI][0]
				Tables.push({table:undefined,toAdd:line,tableType:tableType,name:name})
			}else Tables.push({table:table,classInUse:classInUse,tableType:tableType,name:name})
		}

		return(Tables)
	}

	const Idenitfy =(text)=>{
		let lines = text.split('\r\n')
		const startID = '//Table View Start';
		const endID = '//Table View End'
		let TableLocations = []
		for(let i=0;i<lines.length;i++){
			if(lines[i].startsWith(startID)){
				let foundend=false
				for(let h=i;h<lines.length;h++){
					if(lines[h].startsWith(startID) && h!==i){
						postMessage('error',"A table isn't terminated correctly")
						h=lines.length
					}
					else if(lines[h].startsWith(endID)){
						foundend=true
						TableLocations.push([i,h])
						h=lines.length
					}
				}
				if(!foundend)postMessage('error',"A table isn't terminated correctly")
			}
		}
		if (TableLocations.length >=1) {
			postMessage('info',"Found Table in file");
			return DefineTables(lines,TableLocations,text)
		}
		return false
	}

	function BuildElement(type='div',className,location,content=undefined){
		let element = document.createElement(type)
		element.className = className
		if(content!==undefined)element.textContent=content
		location.appendChild(element)
		return element
	}
	function BuildNumber(location,number='#',className=''){
		let num = BuildElement('td','number '+className,location)
		BuildElement('div','numdiv '+className,num,number)
		return num
	}
	function Highlight(className,direction=true,table){
		let tableE = document.getElementById(table)
		let col = tableE.getElementsByClassName(className)
		for(let element of col||[]){
			direction? element.classList.add('highlight'):element.classList.remove('highlight')
		}
	}
	function renameLine(row,element,classInUse){
		let text = row.text.split(row.name)[0].trim()+' '+element.value.replace(/\s+/g, "")+' = new '+classInUse.name+' ('+row.array.toString()+')'
		element.value=element.value.replace(/\s+/g, "")
		return text
	}
	function updateLine(row,element,tableObj,slot){
		let text = tableObj.tableType.front(row.name).trim()+' new '+tableObj.classInUse.name+' ('
		let newSlot = element.value
		if(newSlot.endsWith(',')||newSlot.startsWith(',')){
			newSlot = newSlot.replace(/,\s*$/, "").replace(/^,/, "")
			postMessage('error','Commas are used todelimit table enteries. Commas can be used withing quotes, arrays or objects')
		}
		for(let i=0;i<tableObj.classInUse.items.length;i++){
			let place = row.array[i]==undefined?'""':row.array[i]
			if(i<slot){text=text+place+','}
			else if(i==slot){text=text+newSlot+','}
			else{text=text+place+','}
		}
		text = text.trim().replace(/("",)+$/g, "")
		text = text.replace(/,+$/, "")
		text = text+')'+tableObj.tableType.back
		text = text.replace(/(\r?\n){2,}/g, "\n")
		return text
	}
	function createLine(tableObj,name='Placeholder',element,slot=undefined){
		let text = tableObj.tableType.front(name).trim()+' new '+tableObj.classInUse.name.trim()+' ('
		if(slot!==undefined){
			for(let i=0;i<tableObj.classInUse.items.length;i++){
				if(i<slot){text=text+'""'+','}
				else if(i==slot){text=text+element.value+','}
			}
		}
		text = text+')'+tableObj.tableType.back
		return text
	}
	function RowAdd(line,content){
		vscode.postMessage({type:'RowAdd',after:line,content:content})
	}
	function updateRow(line,content){
		vscode.postMessage({type:'RowUpdate',line:line,newLine:content})
	}
	function deleteRow(line){
		vscode.postMessage({type:'RowDelete',line:line})
	}
	function BuildRow(location,tableId,table,i,type='standard'){
		let row = table.table[i]
		if(type === 'new')row=table.table[table.table.length-1]
		let classInUse = table.classInUse
		let tableType = table.tableType
		let rowE = BuildElement('tr','row row'+type,location)
		let numb = BuildNumber(rowE,type=='standard'?i:'+', 'row'+i)
		let supressBlur = false
		if(type!=='new'){
			let deletebutton = BuildElement('div','delete row',numb,'×')
			deletebutton.addEventListener('click',()=>{
				supressBlur=true
				deleteRow(row.absolutePosition)
			})
		}
		
		if(tableType.namedRows){
			let value = row.name==undefined||type=='new'?'Placeholder':row.name
			let name = BuildElement('th','head row'+i,rowE)
			let nameinput = BuildElement('input','head row'+i,name,value)
			let namefunction = (e)=>{
				if(supress)return
				supressBlur = true
				if(type=='standard'){
					updateRow(row.absolutePosition,renameLine(row,e.target,classInUse))
				}else{
					RowAdd(row.absolutePosition,createLine(table,e.target.value))
				}
			}
			if(type=='standard')nameinput.value = value
			nameinput.placeholder = value
			nameinput.addEventListener('blur',(e)=>namefunction(e))
			nameinput.addEventListener('keydown',(e)=>e.key==='Enter'&&namefunction(e))
		}
		for(let c =0;c<classInUse.items.length;c++){
			let defined = row.array[c]==undefined || row.array[c].trim()=='""'||row.array[c].trim()=="" || type =='new'?false:true
			let cell = defined?row.array[c]:''
			let className = defined?'set ':'default '
			let item = BuildElement('td',className+classInUse.items[c]+' row'+i,rowE)
			let input = BuildElement('input',className+classInUse.items[c]+' row'+i,item,cell)
			input.value=cell
			input.placeholder=classInUse.defaults[c]
			let update = e=>{
				Highlight(classInUse.items[c],false,tableId);Highlight('row'+i,false,tableId)
				if(supressBlur)return
				supressBlur = true
				switch(type){
					case 'standard':
						if(e.target.value !==cell)updateRow(row.absolutePosition,updateLine(row,e.target,table,c))
						break;
					case 'new':
						if(e.target.value !=='')RowAdd(row.absolutePosition,createLine(table,'Placeholder',e.target,c))
						break;
				}
			}
			input.addEventListener('keydown',(e)=>e.key === 'Enter'&& update(e))
			input.addEventListener('blur',(e)=>update(e))
			input.addEventListener('focus',()=>{Highlight(classInUse.items[c],true,tableId);Highlight('row'+i,true,tableId)})
		}
	
	}
	function BuildTable(location,tableObj,number){
		let table = tableObj.table
		let classInUse = tableObj.classInUse
		let id = 'table'+number
		let displayTable = BuildElement('table','table',location)
		displayTable.id = id
		let Header = BuildElement('tr','head',displayTable)
		BuildNumber(Header)
		if(tableObj.tableType.namedRows)BuildElement('th','classinuse',Header,'class: '+classInUse.name)
		for(let i=0;i<classInUse.items.length;i++){
			let head = classInUse.items[i]
			let heading = BuildElement('th','head '+head,Header,head)
			if(classInUse.types[i]!==undefined)BuildElement('p','type',heading,classInUse.types[i])
		}
		let counter = 1
			for(let i=0;i<table.length;i++){
			if(table[i].name == 'New'+counter)counter=counter+1
			BuildRow(displayTable,id,tableObj,i)
		}
		BuildRow(
			displayTable,
			id,
			tableObj,
			table[table.length-1].absolutePosition,
			'new')
	}
	function BuildNew(text,table,location){
		let classOptions = getAllClasses(text)
		if(classOptions.length<=0){
			postMessage('error','No classes found in document');
			return
		}
		BuildElement('p','classselect',location,'Select Class:')
		let selector = BuildElement('div','classselector',location)
		let options = BuildElement('select','classoptions',selector)
		for(let c of classOptions){
			let option = BuildElement('option','classoption',options,c)
			option.value=c
		}
		let create = BuildElement('button','create',selector,'Create Table')
		create.addEventListener('click',()=>{
			table.classInUse = findClass(text,options.value)
			RowAdd(table.toAdd,createLine(table,'Placeholder'))
		})
	}

	function updateContent(/** @type {string} */ text){
		const tables = Idenitfy(text)
		body.textContent=''
		for(let i =0; i<tables.length;i++){
			let heading = BuildElement('div','tablehead',body)
			let name = undefined
			if(tables[i].table == undefined){
				name = tables[i].name?tables[i].name:'New Table'
				BuildElement('h2','title',heading,name)
				BuildNew(text,tables[i],heading)
			}else{
			name = tables[i].name?tables[i].name:tables[i].classInUse.name
			BuildElement('h2','title',heading,name+' Table')
			BuildElement('p','count',heading,'count: '+tables[i].table.length)
			BuildElement('p','type',heading,tables[i].tableType.display)
			BuildTable(body,tables[i],i)
			}
		}
	}


	// Handle messages sent from the extension to the webview
	window.addEventListener('message', event => {

		const message = event.data; // The json data that the extension sent
		switch (message.type) {
			case 'update':
				const text = message.text;
				// Update our webview's content
				updateContent(text);

				// Then persist state information.
				// This state is returned in the call to `vscode.getState` below when a webview is reloaded.
				vscode.setState({ text:text,types:types});

				return;
			case 'log':
				console.log(text)
				return
		}
	});

	// Webviews are normally torn down when not visible and re-created when they become visible again.
	// State lets us save information across these re-loads
	const state = vscode.getState();
	if (state) {
		updateContent(state.text);
	}

}())