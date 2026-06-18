# Table View 
### Custom Editor for Class based variable creation

### Works with
currently this extenion supports .js .jsx and .ts files


## Get Started
To convert rows of variables defined based on a class:

![standard jsx file](/documentation/before.png)


1) Select all the rows that you want to be part of the Table
2) Right click and select 'Create Table at Selection'
3) You will be prompted if you want to switch to Table View

![file open with table view](/documentation/after.png)

If you don't already have content in the selected area you will be prompted to select a table type. Currently there are three types:
- Export Each - each row is exported as a consts
- Export All: Array - the table is exported as a single array
- Exports All: Object - the table is exported as a single object

When you open table view with a table that has no content you will be greeted with a select class box, the class must exist within the file to be an option. Clicking create will add a new blank item to your table. A table cannot have a class is it doesnt have any rows.

![Select Class Prompt](/documentation/CreateTable.png)


### Delete 
when hovering over a row you can see the delete button on the left to delete that row. When clicked vscode will promt you to confirm before deliting the row

![Delete Row Button](/documentation/DeleteRow.png)

### Add
At the bottom of tables the dashed row identifies the region to add a new row. Add values to add a new row.

![Add Row placeholder row](/documentation/AddRow.png)

### Table Name
For Array and Object based tables the name of the array or object determin the name the appears at the top of the table, for Export Each tables the name is the class name.

### Assigned Types
Assigned types in the constructor will be displayed on the right of the column header

![Col type string](/documentation/ColType.png)

### Table Type Differences
The Array type is the only type without a name row

### Manual setup
paste '//Table View Start // This document was build using Table View, learn more at: https://crimsonincapitals.github.io/' above the start of your list of section and '//Table View End' at the end 

When a file is opened with the markers it will be replaced by table view



### PSA: the class must be within the file

## Development plans
In order of priority
- ✅ adding the ability to convert selected sections with a command to make adding table easier
- ✅ adding different table types
- ✅ adding 'add', 'delete' buttons 
- 'duplicate' row functions
- adding validation to variable names
- resize collumn widths
- mulit cell copying and pasting 