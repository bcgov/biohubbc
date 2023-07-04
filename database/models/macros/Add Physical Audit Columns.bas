'#Language "WWB-COM"

Sub Main

  Dim MyDiagram As Diagram
  Dim MyModel As Model
  Dim MyEntity As Entity
  Dim MyAttribute As AttributeObj
  Dim MyDefaults As Default
  Dim MyTimestampNowDefaultId As Variant
  Dim MyUserDefaultId As Variant
  Dim MyRevisionCountDefaultId As Variant

    Set MyDiagram = DiagramManager.ActiveDiagram
    Set MyModel = MyDiagram.ActiveModel

    If Not MyModel.Logical Then
	  If MsgBox("This macro will add audit columns to all objects in the currently selected Physical model.", vbOkCancel) = vbOK Then
		For Each MyDefaults In MyDiagram.Dictionary.Defaults
			If MyDefaults.Name = "timestamp now" Then
				Set MyTimestampNowDefaultId = MyDefaults.ID
			ElseIf MyDefaults.Name = "user" Then
				Set MyUserDefaultId = MyDefaults.ID
			ElseIf MyDefaults.Name = "revision count" Then
				Set MyRevisionCountDefaultId = MyDefaults.ID
			End If
		Next
  	    For Each MyEntity In MyModel.Entities
		  Set MyAttribute = MyEntity.Attributes.Add("create_date", False)
		  MyAttribute.Datatype = "TIMESTAMP"
		  MyAttribute.Definition = "The datetime the record was created."
		  MyAttribute.NullOption = "NOT NULL"
		  MyAttribute.DefaultId = MyTimestampNowDefaultId

		  Set MyAttribute = MyEntity.Attributes.Add("create_user", False)
		  MyAttribute.Datatype = "VARCHAR"
		  MyAttribute.DataLength = 63
		  MyAttribute.Definition = "The user who created the record."
		  MyAttribute.NullOption = "NOT NULL"
		  MyAttribute.DefaultId = MyUserDefaultId

		  Set MyAttribute = MyEntity.Attributes.Add("update_date", False)
		  MyAttribute.Datatype = "TIMESTAMP"
		  MyAttribute.Definition = "The datetime the record was updated."
		  MyAttribute.NullOption = "NULL"

		  Set MyAttribute = MyEntity.Attributes.Add("update_user", False)
		  MyAttribute.Datatype = "VARCHAR"
		  MyAttribute.DataLength = 63
		  MyAttribute.Definition = "The user who updated the record."
		  MyAttribute.NullOption = "NULL"

		  Set MyAttribute = MyEntity.Attributes.Add("revision_count", False)
		  MyAttribute.Datatype = "INTEGER"
		  MyAttribute.Definition = "Revision count used for concurrency control."
		  MyAttribute.NullOption = "NOT NULL"
		  MyAttribute.DefaultId = MyRevisionCountDefaultId
       Next

	    MsgBox "Work complete."
	  End If
	Else
		MsgBox "This macro is designed to run in the Physical model. Please switch to Physical model first."
  	End If

End Sub
