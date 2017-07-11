$(".del").click(function(e){
	e.stopPropagation()
	e.preventDefault()

	var id = $(this).data('id')
	var type = $(this).data('type')
	var $tr = $(".item-id-" + id)
	var del = confirm("确认要删除？")
	if(del){
		$.ajax('/admin/' + type + '/'+id,{
			type: 'delete',
			success: function(data){
				console.log(data)
				$tr.remove()
			},
			error: function(){
				console.log('delete fail')
			}
		})
	}	
})