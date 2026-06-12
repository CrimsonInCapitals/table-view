	const getOpentoClose=(text,open='{',close='}',cut=0)=>{
		let descend = 0
		let ascend = 0
		let textArray = text.split('')
		let indexOfClose = undefined
		for(let i = 0;i<textArray.length;i++){
			if(textArray[i] == open)descend=descend+1
			if(textArray[i] == close)ascend=ascend+1
			if(descend>=1 && ascend==descend){indexOfClose=i+1;i=textArray.length}
		}
		return text.substring(0+cut,indexOfClose-cut)
	}

	const findClass=(document,name='C')=>{
		if(document.getText().includes('class') == false){vscode.window.showErrorMessage('Class must be within document for Class mode');return;}
		let classes = document.getText().split('class '+name)[1]
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
	
	const disectfromclass=(document,C,classInUse)=>{
		let array = C.substring(C.indexOf('(')+1,C.lastIndexOf(')')).split(',')
		let obj ={}
		classInUse.items.map((item,index)=>{
			if(array.length>=index){
				if(array[index] == '')obj[item]=undefined
				else obj[item]=array[index]
			}
		})
		return obj
	}

	const DefineTable = (document,Starts,startID,endID)=>{
		const Tables =[]
		for(let section = 1;section<Starts.length;section++){
			let range = Starts[section].split(endID)[0]
			let row = range.split('\r\n')
			let classInUse=undefined
			for(let i = 1;i<row.length;i++){
				if(row[i].includes('=')){
					let nv=row[i].split('=')
					nv[0]=nv[0].split('const')[1].trim()
					if(classInUse == undefined){classInUse=findClass(document,nv[1].split('new')[1].split('(')[0].trim())}
					if(nv[1].trim().startsWith('new')){nv[1] = disectfromclass(document,nv[1],classInUse)}
					let obj = {
						name:nv[0],
						defined:nv[1]
					}
					Tables.push(obj)
				}
			}
		}
		return(Tables)
	}

	const Idenitfy =(document)=>{
		const editor = vscode.window.activeTextEditor;
        if (!editor && document==undefined) {
            vscode.window.showInformationMessage('No active editor found.');
            return;
        }
		document = document==undefined?editor.document:document
        const text = document.getText();
        const startID = '//Table View Start';
		const endID = '//Table View End'
		const Starts = text.split(startID)
		const Ends = text.split(endID)
        if (Starts.length >=2) {
			if(Starts.length > Ends.length){vscode.window.showErrorMessage("A table isn't terminated correctly");return;}
			if(Starts.length < Ends.length){vscode.window.showErrorMessage("a table isn't opened correctly");return;}
            vscode.window.showInformationMessage("Found Table in "+ document.fileName.split("\\").pop());
			console.log(DefineTable(document,Starts,startID,endID))
		}

	}
	const openFileListener = vscode.workspace.onDidOpenTextDocument((document)=>{
		Idenitfy(document)
	})

	const create = vscode.commands.registerCommand('tableview.create',function(){
		vscode.window.showInformationMessage('Table View Started')
		Idenitfy()
	})
	context.subscriptions.push(openFileListener)
	context.subscriptions.push(create)