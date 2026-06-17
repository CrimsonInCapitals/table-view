export const defstrings = [
	'//Table View Start',
	'// This document was build using Table View, learn more at: https://crimsonincapitals.github.io/',
	'//Table View End'
]

class def{
	get: any
	identifies: string
	named: boolean
	deconstruct: any
	constructor(a:string,b: string|undefined=undefined){
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
	before
	front
	newBefore
	newAfter
	askName:boolean
	namedRows:boolean
	display:string
	back:string
	after:string
	forntIdentifier:string
	name:string
	deconstructFront: (start: string) => string
	constructor(name: string='',askName:boolean,display: string,before: def,after: string,front: def,back: string){
		this.before = (vname: string)=>defstrings[0].trim()+' type='+name+' '+defstrings[1].trim()+'\n'
		this.newBefore = (vname: string)=>this.before(vname)+before.get(vname)
		this.front=(vname: string)=>front.get(vname).trim()+' '
		this.forntIdentifier = front.identifies
		this.deconstructFront=(start: string)=>front.deconstruct(start)
		this.namedRows = front.named
		this.display=display
		this.back = back+'\n'
		this.after=defstrings[2].trim()
		this.newAfter=after+'\n'+this.after
		this.askName = askName
		this.name=name
	}
}
export const types=[
	new TableType('ec',false, 'Export Each',		new def(''),					'',	new def('export const','='),''),
	new TableType('ob',true, 'Export All: Object',	new def('export const','= {'),	'}',new def('	',':'),			','),
	new TableType('ar',true, 'Export All: Array',	new def('export const','= ['),	']',new def('	'),				',')
]