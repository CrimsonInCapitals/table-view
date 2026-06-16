// @ts-check

// Script run within the webview itself.
(function () {

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

	const findClass=(text,name='C')=>{
		if(text.includes('class') == false){postMessage('error','Class must be within document for Class mode');
		return;}
		let classes = text.split(' ').join('').split('class'+name+'{')[1]
		let constructor = getOpentoClose(classes.split('constructor')[1],'(',')',1)
		let names =[]
		let defaults = []
		constructor.split(',').map(item=>{
			let split = item.split('=')
			names.push(split[0].trim())
			defaults.push(split[1]?split[1]:'any')
		})
		return {name:name,items:names,defaults:defaults}
	}

	const disectfromclass=(C,classInUse)=>{
		let array =[]
		let currentSection = ''
		let opens=[]
		for(let character of C.substring(C.indexOf('(')+1,C.lastIndexOf(')')).split('')){
			if(opens.length<=0 && character==','){
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
		let obj = classInUse.items.map((item,index)=>this[item]=array[index])
		return [obj,array]
	}

	const DefineTables = (lines,TableLocations,text)=>{
		const Tables =[]
		for(let tableI = 0;tableI<TableLocations.length;tableI++){
			let rows = lines.slice(TableLocations[tableI][0],TableLocations[tableI][1])
			let table = []
			let classInUse=undefined
			for(let i = 0;i<rows.length;i++){
				if(rows[i].startsWith('//')){}
				else if(rows[i].includes('=')){
					let nv=rows[i].split('=')
					nv[0]=nv[0].split('const')[1].trim()
					if(classInUse == undefined){classInUse=findClass(text,nv[1].split('new')[1].split('(')[0].trim())}
					if(nv[1].trim().startsWith('new')){nv[1] = disectfromclass(nv[1],classInUse)}
					let obj = {
						name:nv[0],
						defined:nv[1][0],
						array:nv[1][1],
						position:i,
						absolutePosition:i+TableLocations[tableI][0],
						text:rows[i]
					}
					table.push(obj)
				}
			}
			Tables.push({table:table,classInUse:classInUse})
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
					if(lines[h].startsWith(endID)){
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
	function BuildNumber(location,number='#'){
		let num = BuildElement('td','number',location)
		BuildElement('div','numdiv',num,number)
	}
	function Highlight(className,direction=true,table){
		let tableE = document.getElementById(table)
		let col = tableE.getElementsByClassName(className)
		for(let element of col||[]){
			direction? element.classList.add('highlight'):element.classList.remove('highlight')
		}
	}
	function renameLine(row,element,classInUse){
		let text = row.text.split(row.name)[0].trim()+' '+element.value.replace(/\s+/g, "")+' = new '+classInUse.name+'('+row.array.toString()+')'
		element.value=element.value.replace(/\s+/g, "")
		return text
	}
	function calcNewLine(row,element,classInUse,slot){
		let text = row.text.split(row.name)[0].trim()+' '+row.name+' = new '+classInUse.name+'('
		console.log(element)
		let newSlot = element.value
		if(newSlot.endsWith(',')||newSlot.startsWith(',')){
			newSlot = newSlot.replace(/,\s*$/, "").replace(/^,/, "")
			postMessage('error','Commas are used todelimit table enteries. Commas can be used withing quotes, arrays or objects')
		}
		for(let i=0;i<row.array.length;i++){
			if(i==slot){text=text+newSlot+','}
			else text=text+row.array[i]+','
		}
		text = text+(')')
		return text
	}
	function updateRow(line,content){
		vscode.postMessage({type:'rowchange',line:line,newLine:content})
	}
	function BuildTable(location,table,classInUse,number){
		let id = 'table'+number
		let displayTable = BuildElement('table','table',location)
		displayTable.id = id
		let Header = BuildElement('tr','head',displayTable)
		BuildNumber(Header)
		Header.appendChild(document.createElement('th'))
		for(let head of classInUse.items)BuildElement('th',head,Header,head)
		for(let i=0;i<table.length;i++){
			let row = table[i]
			let rowE = BuildElement('tr','row',displayTable)
			BuildNumber(rowE,i)
			let name = BuildElement('th','head '+row.name,rowE)
			let nameinput = BuildElement('input','head '+row.name,name,row.name)
			nameinput.value = row.name
			nameinput.addEventListener('blur',(e)=>updateRow(row.absolutePosition,renameLine(row,e.target,classInUse)))
			nameinput.addEventListener('keydown',(e)=>e.key==='Enter'&&updateRow(row.absolutePosition,renameLine(row,e.target,classInUse)))
			for(let c =0;c<classInUse.items.length;c++){
				let defined = row.array[c]==undefined || row.array[c].trim()=='""'||row.array[c].trim()==""?false:true
				let cell = defined?row.array[c]:''
				let className = defined?'set ':'default '
				let item = BuildElement('td',className+classInUse.items[c]+' '+row.name,rowE)
				let input = BuildElement('input',className+classInUse.items[c]+' '+row.name,item,cell)
				input.value=cell
				input.placeholder=classInUse.defaults[c]
				input.addEventListener('keydown',(e)=>{
					if(e.key === 'Enter'){
						if(e.target.value !==cell)updateRow(row.absolutePosition,calcNewLine(row,e.target,classInUse,c))
					}
				})
				input.addEventListener('blur',(e)=>{
					Highlight(classInUse.items[c],false,id);
					Highlight(row.name,false,id)
					if(e.target.value !==cell)updateRow(row.absolutePosition,calcNewLine(row,e.target,classInUse,c))
				})
				input.addEventListener('focus',()=>{Highlight(classInUse.items[c],true,id);Highlight(row.name,true,id)})

			}
		}
	}

	function updateContent(/** @type {string} */ text){
		const tables = Idenitfy(text)
		body.textContent=''
		for(let i =0; i<tables.length;i++){
			let heading = BuildElement('div','tablehead',body)
			BuildElement('h2','title',heading,tables[i].classInUse.name+' Table')
			BuildElement('p','count',heading,tables[i].table.length)
			BuildTable(body,tables[i].table,tables[i].classInUse,i)
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
				vscode.setState({ text });

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