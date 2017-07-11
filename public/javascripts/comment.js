$(".icon").click(function(e){
	$('textarea').focus()
	var target = $(this)
	var commentId = target.data('cid')
	var commentFromId = target.data('uid')


	if ($('#commentId').length> 0) {
		$('#commentId').val(commentId)
	}
	else{
		$('<input>').attr({
			type: 'hidden',
			id: 'commentId',
			name: 'commentId',
			value: commentId,
		}).appendTo('#commentFrom')
	}

	if ($('#commentFromId').length> 0) {
		$('#commentFromId').val(commentFromId)
	}
	else{
		$('<input>').attr({
			type: 'hidden',
			name: 'commentFromId',
			id: 'commentFromId',
			value: commentFromId,
		}).appendTo('#commentFrom')
	}
})