
# Making an Accelerator

## Defines

### Profile (TAcceleratorProfile)

An object that has necessary fields that describe an accelerator.

### Factory (TAcceleratorFactory)

Something able to create an Accelerator Instance when user makes a selection.

### Accelerator Instance (TAccelerator)

Created by an Factory object when user makes a selection.

An accelerator is an instance of selection-based service.

## Life cycle

### When user makes a selection

```flow
st=>start:      User makes a selection
op1=>operation: System extracts content
op2=>operation: Factory.create() creates an instance from the content
if1=>condition: instance is not null?
op3=>operation: System makes a button (and a view) for the instance
op4=>operation: System calls the instance's bind() function
ed1=>end:       End

st->op1->op2->if1
if1(yes)->op3->op4->ed1
if1(no)->ed1
```

### When content get unselected

The box will be hidden. The view and button that assigned to the accelerator instance, will be removed from the box.

The best practice is that not creating more reference to the button or view. Once their content get updated, everything shall be static. Otherwise, GC and memory might have a bad day.
