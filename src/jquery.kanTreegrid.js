/*!
 jquery.kanTreegrid.js v1.0.0 | https://github.com/waterbeside/jquery.kanTreegrid.js (2017-06-02)
 Copyright (c) 簡(Kan) <waterbeside@126.com>
*/
;(function($) {
	"use strict";
	var methods = {
		defaults : {
			idField:'id'
			,treeField: 'title'
			,animate:true
			,cache:false
			//,height:'auto'
			,method:'get'
			,deepStep:15
			,columns:[[
				{field:'id',title:'ID',width:'8%'}
				,{field:'title',title:'名稱'}
			]]
		},

		init:function(params){
			var options = $.extend({}, methods.defaults, params);
			methods.target = this;
			return this.each(function () {
				//console.log(this.options)
				//console.log(this.options.columns[0])
				var $this = $(this);
				$this.kanTreegrid('setTreeContainer',$(this));
				$this.data('findCache',null);
				$this.kanTreegrid('setSettings',options);
				var html_thead = $(this).kanTreegrid('_domThead');
				$(this).html(html_thead);
				$(this).append($(this).kanTreegrid('_domTbodyWrap'));
				if(options.url){
					$(this).kanTreegrid('load',options.params);
				}else if(options.datas){
					$(this).kanTreegrid('loadData',options.datas);
				}

			});
		},


		load:function(params){
			var $this = $(this);
			var options = $this.kanTreegrid('getSetting');
			$.ajax({
				type: options.method,
				dataType: "json",
				cache:options.cache,
				async:false,
				data:params,
				url:options.url,
				beforeSend:function(){
					if(options.onBeforeLoad){
						options.onBeforeLoad(options);
					}
				},
				success:function(datas){
					$this.children('tbody').html('');
					$this.kanTreegrid('loadData',datas);

				}
			});
		},

		reload:function(params){
			var $this = $(this);
			var options = $this.kanTreegrid('getSetting');
			var dataParams  = typeof options.params === "undefined" ? params : $.extend({}, options.params, params);
			$(this).kanTreegrid('load',dataParams);
		},


		loadData:function(datas){
			var $this = $(this);
			var options = $this.kanTreegrid('getSetting');
			$this.kanTreegrid('setData',datas);
			$this.kanTreegrid('_domTbody',{'datas':datas,'deep':0});

			var $tbody = $this.children('tbody');
			var $tr = $tbody.children('tr');
			$tr.each(function(){
				var $row = $(this);
				var itemId = $row.attr('data-id');

				$(this).find('.J-treeBtn').click(function(e){
					e.preventDefault();
					e.stopPropagation();
					//var $children =$tbody.children('tr[data-pid='+itemId+']');
					//var $fa = $(this).children(".fa") ;
					if($row.hasClass('tree-collapsable')){
						$this.kanTreegrid('collapse',itemId);
					}else{
						$this.kanTreegrid('expand',itemId);
					}

				});
				$(this).click(function(){
					var thisid = $(this).attr('data-id');
					$this.kanTreegrid('select',thisid);
					//console.log($this.kanTreegrid('find',thisid));
					if(typeof options.onClickRow ==="function"){
						options.onClickRow($this.kanTreegrid('getSelectedData'));
					}

				});
			});
			if(typeof options.onLoadSuccess ==="function"){
				options.onLoadSuccess(datas);
			}
			//methods.response = {}
			//if(methods.options.callback){ methods.options.callback(this.response); }else{ return(methods.response); }
		},

		//取得设置
        getSetting: function(name) {
            if (!$(this).kanTreegrid('getTreeContainer')) {
                return null;
            }
            if(typeof name ==='undefined'){
            	return $(this).kanTreegrid('getTreeContainer').data('settings');
            }else{
            	return $(this).kanTreegrid('getTreeContainer').data('settings')[name];
            }
        },
		//添加设置
        setSettings: function(settings) {
            $(this).kanTreegrid('getTreeContainer').data('settings', settings);
        },
        //取得数据主体
        getTreeContainer: function() {
            return $(this).data('kanTreegrid');
        },
        //设置数据主体
        setTreeContainer: function(container) {
            return $(this).data('kanTreegrid', container);
        },

        //设置加载的树数据
        setData: function(datas) {
            $(this).kanTreegrid('getTreeContainer').data('datas', datas);
        },
        //取得所有树数据
        getData: function() {
            return $(this).kanTreegrid('getTreeContainer').data('datas');
        },

		//设置选择的节点
        setSelected: function(obj) {
            $(this).kanTreegrid('getTreeContainer').data('selected', obj);
        },
        //取得节点
        getSelected: function() {
            return $(this).kanTreegrid('getTreeContainer').data('selected');
        },


		//選擇節點
		select:function(id){
			var options = $(this).kanTreegrid('getSetting');
			if(!id){
				return false;
			}
			id = parseInt(id);
			//console.log(id)
			var $row  = $(this).children('tbody').children('tr[data-id='+id+']');
			$row.addClass('J-datagrid-row-selected').siblings('tr').removeClass('J-datagrid-row-selected');
			var datas = $(this).kanTreegrid('find',id);
			$(this).kanTreegrid('setSelectedData',datas);
			//console.log($(this).kanTreegrid('getSelectedData'));
			$(this).kanTreegrid('setSelected',$row);
			if(typeof options.onSelect ==="function"){
				options.onSelect($(this).kanTreegrid('getSelectedData'));
			}
			return $row;
		},
		//取消選擇節點
		unselect:function(id){
			if(typeof id ==="undefined"){
				$(this).children('tbody').children('tr').removeClass('J-datagrid-row-selected');
			}else{
				$(this).children('tbody').children('tr[data-id='+id+']').removeClass('J-datagrid-row-selected');
			}
			$(this).kanTreegrid('setSelected',null);
		},

		//设置已选节点的数据
		setSelectedData:function(datas){
			$(this).kanTreegrid('getTreeContainer').data('selectedDatas', datas);
		},
		//取得已选节点的数据
		getSelectedData:function(){
			return $(this).kanTreegrid('getTreeContainer').data('selectedDatas');
		},


		//取節點對像数据
		find:function(id){
			var datas = $(this).kanTreegrid('getData');
			return $(this).kanTreegrid('_find',id,datas);
		},
		_find:function(selectid,datas,deep){

			var $this = $(this);
			var $row  = $(this).children('tbody').children('tr[data-id='+selectid+']');
			deep =  deep || 0;
			$(datas).each(function(index,item){
				if(parseInt(item[$this.kanTreegrid('getSetting','idField')])===parseInt(selectid)){
					item.$node = $row;
					$this.data('findCache',item);
				}else{
					if(item.children && item.children.length>0){
						var deep_n = deep+1;
						$this.data('findCache',$this.kanTreegrid('_find',selectid,item.children,deep_n));
					}
				}
			});
			return $this.data('findCache');
		},

		_domThead:function(){

			var colsArray = $(this).kanTreegrid('getSetting','columns');
			var cols = colsArray[0];
			var html_thead = '<thead><tr>';
			for(var i=0;i<cols.length;i++){
				html_thead += '<th '+(cols[i].width ? 'width='+cols[i].width :'')+'>'+cols[i].title+'</th>';
			}
			html_thead +="</tr></thead>" ;
			return html_thead;
		},
		_domTbodyWrap:function(){
			return '<tbody></tbody>';
		},
		_domTbody:function(param){

			var deep = typeof param.deep ==="undefined" ? 0 : param.deep ;
			var $this = $(this);
			var colsArray = $this.kanTreegrid('getSetting','columns');
			var cols = colsArray[0];
			var datas = param.datas;
			var $tbody = $this.children('tbody');
			$(datas).each(function(index,item){

				//console.log(deep+","+item['catname'])
				var collapsable = item.children.length>0 ? 'class="tree-collapsable"' : '';
				var html_td = '<tr '+collapsable+' data-id="'+item[$this.kanTreegrid('getSetting','idField')]+'" data-pid="'+item.parentid+'">';
				for(var i=0;i<cols.length;i++){
					var cellHtml = cols[i].formatter ? cols[i].formatter(item[cols[i].field],item) : item[cols[i].field];
					if(cols[i].field===$this.kanTreegrid('getSetting','treeField')){

						var icon = item.children.length>0 ? '<span class="J-treeBtn"><i class="fa fa-folder-open"></i></span>' : '<i class="fa fa-file-text-o"></i>';
						html_td += '<td class="treeField" field="'+cols[i].field+'"><div class="cellwrap" style="padding-left:'+ deep*$this.kanTreegrid('getSetting','deepStep') +'px">'+icon+'&nbsp;<span class="cell">'+cellHtml+'</span></div></td>';
					}else{
						html_td += '<td field="'+cols[i].field+'"><div class="cellwrap"><span class="cell">'+cellHtml+'</span></div></td>';
					}

				}
				html_td +="</tr>";
				$tbody.append(html_td);
				if(item.children.length>0){
					var deep_n = deep+1;
					var paramChildren = {'datas':item.children,'deep':deep_n};
					$this.kanTreegrid('_domTbody',paramChildren);
				}
			});
		},

		collapseAll:function(){
			var $this = this;
			var $tr = $this.children('tbody').children('tr.tree-collapsable');
			$tr.each(function(){
				var id = $(this).data('id');
				$this.kanTreegrid('collapse',id);
			});
		},
		collapse:function(pid){
			var $this = this;
			var $row = $(this).children('tbody').children('tr[data-id='+pid+']');
			var $children =$(this).children('tbody').children('tr[data-pid='+pid+']');
			if($row.hasClass('tree-collapsable')){
				$row.removeClass('tree-collapsable').addClass('tree-expandable');
				$row.find('.J-treeBtn .fa').removeClass('fa-folder-open').addClass('fa-folder');
				$children.each(function(index){
					var $this_c = $(this);
					if($this.kanTreegrid('getSetting','animate')){
						setTimeout(function(){$this_c.hide();},index*50);
					}else{
						$this_c.hide();
					}
					$(this).attr('data-show','0');

					var id = $(this).data('id');
					$this.kanTreegrid('_collapse',id);
				});
			}

		},
		_collapse:function(pid){
			var $this = this;
			var $row = $(this).children('tbody').children('tr[data-id='+pid+']');
			var $children =$(this).children('tbody').children('tr[data-pid='+pid+']');
			if($children.length>0){
				$children.each(function(index){
					var $this_c = $(this);
					if($row.hasClass('tree-collapsable')){
						$(this).attr('data-show','1');
					}
					if($row.hasClass('tree-expandable')){
						$(this).attr('data-show','0');
					}

					if($this.kanTreegrid('getSetting','animate')){
						setTimeout(function(){$this_c.hide();},index*50);
					}else{
						$this_c.hide();
					}
					//if($(this).hasClass('tree-expandable')||$(this).hasClass('tree-collapsable')){
						var id = $(this).data('id');
						$this.kanTreegrid('_collapse',id);
					//}

				});
			}

		},
		expandAll:function(){
			var $this = this;
			var $tr = $this.children('tbody').children('tr.tree-expandable');
			$tr.each(function(){
				var id = $(this).data('id');
				$this.kanTreegrid('expand',id);
			});
		},
		expand:function(pid){
			var $this = this;
			var $row = $(this).children('tbody').children('tr[data-id='+pid+']');
			var $children =$(this).children('tbody').children('tr[data-pid='+pid+']');
			if($row.hasClass('tree-expandable')){
				$row.removeClass('tree-expandable').addClass('tree-collapsable');
				$row.find('.J-treeBtn .fa').addClass('fa-folder-open').removeClass('fa-folder');
				$children.each(function(index){
					var $this_c = $(this);
					var id = $(this).data('id');
					$(this).attr('data-show','1');
					if($this.kanTreegrid('getSetting','animate')){
						setTimeout(function(){$this_c.show();},index*50);
					}else{
						$this_c.show();
					}

					$this.kanTreegrid('_expand',id);
				});

			}

		},
		_expand:function(pid){
			var $this = this;
			var $children =$(this).children('tbody').children('tr[data-pid='+pid+']');
			$children.each(function(index){
				var $this_c = $(this);
				if($(this).attr('data-show')==='1'){
					if($(this).hasClass('tree-collapsable')){
						var id = $(this).data('id');
						$this.kanTreegrid('_expand',id);
					}
					if($this.kanTreegrid('getSetting','animate')){
						setTimeout(function(){$this_c.show();},index*50);
					}else{
						$this_c.show();
					}
				}
			});
		}

	};

	$.fn.kanTreegrid = function (method) {

        // 方法调用
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method' + method + 'does not exist on jQuery.kanTreegrid 。<br/> 方法'+method+'不存在於jQuery.kanTreegrid也！');
        }

    };

})(jQuery);
