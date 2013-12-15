// gpResponsiveMenu v0.5.2 - jQuery responsive menu plugin
// (c) 2013 Les Green - GrasshopperPebbles.com
// License: http://www.gnu.org/licenses/

;(function($) {
	$.fn.extend({
        gpResponsiveMenu: function(options) { 
        	opts = $.extend({}, $.gpMenu.defaults, options);
			return this.each(function() {
				new $.gpMenu(this, opts);
			});
        }
    });	

$.gpMenu = function(obj, opts) {
	var $this = $(obj);
	var currentMode = '';
	var currentSecMode = '';
	var openUL = '';
	var openSub = '';
	/*var localNamespace = {};
	localNamespace['doSelect'] = doSelect;
	localNamespace['doSplitView'] = doSplitView;
	localNamespace['doVertical'] = doVertical;
	localNamespace['doVerticalOverlay'] = doVerticalOverlay;
	localNamespace['doInlineOverlay'] = doInlineOverlay;
	localNamespace['doPageOverlay'] = doPageOverlay;*/
	
	$(window).resize(function() {
    	initMenu('primary');
    	if (opts.secondary_nav) {
			initMenu('secondary');
		}
    });
	
	initMenu('primary');
	if (opts.secondary_nav) {
		initMenu('secondary');
	}
	
	function initMenu(menuType) {
		var obj;
		if (menuType == 'primary') {
    		obj = getQueryMode(menuType, opts.media_query_modes);
    	} else {
    		var m = opts.secondary_nav;
    		obj = getQueryMode(menuType, m.media_query_modes);
    	}
    	if (obj.viewType) {
    		var cMode = (menuType == 'primary') ? currentMode : currentSecMode;
		    if (obj.viewType != cMode) {
		    	setCurrentMode(menuType, obj.viewType);
		    	removeMenu(menuType);
		    	if (obj.viewType == 'Select') {
			    	doSelect(obj);
			    } else {
			    	createMenu(obj);
			    }
		    }  
	    } else {
	    	resetMenu(menuType);
	    }
    }; 
    
    function setCurrentMode(menuType, viewType) {
    	if (menuType == 'primary') {
    		currentMode = viewType;
    	} else {
    		currentSecMode = viewType;
    	}
    };
    
    function getQueryMode(menuType, mdq) {
    	var w = $(window).width();
    	var obj = {};
    	$.each(mdq, function(i, itm) {
    		if (itm.min) {
	    		if( w >= itm.min && w <= itm.max ) {
	    			obj = getNavObject(obj, itm, menuType);
	    			return false;
	    		}
    		} else {
    			if (w <= itm.max) {
    				obj = getNavObject(obj, itm, menuType);
    				return false;
    			}
    		} 
	    });
	    return obj;
    };
    
    function getNavObject(obj, itm, menuType) {
    	//obj.fn = 'do'+itm.mode;
    	obj.viewType = itm.mode;
    	obj.menuType = menuType;
    	var op = (menuType == 'primary') ? opts : opts.secondary_nav;
    	
    	obj.nav_parent = (itm.nav_parent) ? itm.nav_parent : op.nav_parent;
    	if (itm.nav_toggle_parent) {
    		obj.nav_toggle_parent = itm.nav_toggle_parent;
    	} else if (op.nav_toggle_parent) {
    		obj.nav_toggle_parent = op.nav_toggle_parent;
    	} else {
    		obj.nav_toggle_parent = obj.nav_parent;
    	}
    	if (itm.nav_position) {
    		obj.nav_position = itm.nav_position;
    	} else if (op.nav_position) {
    		obj.nav_position = op.nav_position;
    	}
    	if (itm.nav_toggle_position) {
    		obj.nav_toggle_position = itm.nav_toggle_position;
    	} else if (op.nav_toggle_position) {
    		obj.nav_toggle_position = op.nav_toggle_position;
    	}
    	obj.menu_select_text = (op.menu_select_text) ? op.menu_select_text : opts.menu_select_text;
    	if (op.menu_structure) {
    		obj.menu_structure = op.menu_structure;
    	}
    	if (op.nav_cntnr_class) {
    		obj.nav_cntnr_class = op.nav_cntnr_class;
    	}
    	obj.active_class = (op.active_class) ? op.active_class : opts.active_class;
    	if (op.page_wrapper) {
    		obj.page_wrapper = op.page_wrapper;
    	}
    	if (op.show_close_btn) {
    		obj.show_close_btn = op.show_close_btn;
    	}
    	obj.parent_menu_prefix = (op.parent_menu_prefix) ? op.parent_menu_prefix : opts.parent_menu_prefix;
    	if (op.nav_toggle_class) {
    		obj.nav_toggle_class = op.nav_toggle_class;
    	}
    	if (op.nav_toggle_icon_class) {
    		obj.nav_toggle_icon_class = op.nav_toggle_icon_class;
    	}
    	if (op.nav_toggle_wrapper_class) {
    		obj.nav_toggle_wrapper_class = op.nav_toggle_wrapper_class;
    	}
    	
    	if (op.nav_toggle_text) {
    		obj.nav_toggle_text = op.nav_toggle_text;
    	}
    	obj.show_nav_toggle_caret = op.show_nav_toggle_caret;
    	obj.show_nav_caret = op.show_nav_caret;
    	return obj;
    };
    
    function doSelect(obj) {
    	toggleDefaultMenu(obj.menuType, false);
    	var sel = $('<select></select>').addClass('gp-responsive-select');
    	var cls = (obj.menuType == 'primary') ? 'gp-select-primary' : 'gp-select-secondary';
    	$(sel).addClass(cls);
    	$('<option value="">'+obj.menu_select_text+'</option>').appendTo($(sel)); 
    	
    	var chld = getMenuChildren(obj);
    	if (obj.menu_structure) {
    		getSelectItemsFromTemplate(sel, chld, obj, 0);
    	} else {
    		getSelectItems(sel, chld, 0);
    	}  
    	var tf = positionNavAndCntrl(obj, sel);
    	$(sel).on('change', function() {
    		if ($(this).selectedIndex != 0) {
	    		if ($(this).data('target')) {
	    			window.open($(this).val(), 'new_window');
	    		}
	    		if (isNaN($(this).val())) {
	    			document.location.href = $(this).val();
	    		}
    		}
    	});
    };
    
    function getSelectItems(cntnr, mnu, level) {
    	var chld, sub, tg, o;
    	$.each(mnu, function(i, itm) {
    		chld = $(itm).children();
    		$.each(chld, function(j, el){
    			tg = $(el).get(0).tagName;
    			if (tg == 'A') {
    				o = $('<option value="'+$(el).attr('href')+'">'+addDashes(level)+$(el).text()+'</option>').appendTo($(cntnr));
    				if ($(el).attr('target')) {
    					$(o).data('url_target', $(el).attr('target'));
    				}
    			} else if (tg == 'UL') {
    				sub = $(el).children('li');
    				getSelectItems(cntnr, sub, level+1);
    			}	
    		});
    	});
    };
    
    function getSelectItemsFromTemplate(cntnr, mnu, obj, level) {
    	var tg;
    	var menu_tmp = obj.menu_structure;
		$.each(mnu, function(i, itm) {
			tg = $(itm).get(0).tagName;
			if (tg == menu_tmp.menu_caption_tag) {
				$('<option value="'+i+'">'+addDashes(level)+$(itm).text()+'</option>').appendTo($(cntnr));
				getSelectItems( cntnr, $(itm).next(menu_tmp.menu_item_parent_tag).children(menu_tmp.menu_item_tag), level+1);
			}
		});
	};
    
    function addDashes(level) {
    	var dash = ' ';
    	for (i=0; i<level; i++) {
    		dash +='-';
    	}
    	return dash+' ';
    };
       
    function createMenu(obj) {
    	toggleDefaultMenu(obj.menuType, false);
    	var ul;
    	var nav = $('<div class="'+obj.nav_cntnr_class+'" role="navigation">');
    	$(nav).addClass('gp-nav-'+obj.menuType);
    	var tf = positionNavAndCntrl(obj, nav);
    	var chld = getMenuChildren(obj);
    	if (obj.menu_structure) {
    		ul = getMenuItemsFromTemplate( chld, obj, 0);
    	} else {
    		ul = getMenuItems( chld, 0);
    	}  	
    	$(nav).append($(ul));
    	var tf = setParentCaption(nav, obj);
    	var tf = setSubMenuClick(obj);
    };
     
    function getMenuItems(mnu, level) {
		var li, chld, sub, tg;
		var ul = $('<ul></ul>');
		$.each(mnu, function(i, itm) {
			li = $('<li></li>').addClass('level-'+level);
			if (i == 0) {
				$(li).addClass('first');
			}
			chld = $(itm).children();
    		$.each(chld, function(j, el){
    			tg = $(el).get(0).tagName;
    			if (tg == 'A') {
					$(li).append($('<a></a>').attr({'href': $(el).attr('href'), 'title': $(el).attr('title')}).text($(el).text()));
    			} else if (tg == 'UL') {
    				sub = getMenuItems($(el).children('li'), level+1);
    				$(li).append($(sub));
    			}	
    		});
    		$(li).appendTo($(ul));
		});
		return $(ul);
	};
	
	function getMenuItemsFromTemplate(mnu, obj, level) {
    	//{"menu_structure": {"item_tag": 'aside', "item_caption_tag": "h3", "menu_item_parent_tag": "ul", "menu_item_tag": 'Li'}}
    	var li, tg, u, divUl;
    	var menu_tmp = opts.menu_structure;
    	var vt = obj.viewType;
		var ul = (vt == 'PageOverlay') ? $('<div></div') : $('<ul></ul>');
		$.each(mnu, function(i, itm) {
			tg = $(itm).get(0).tagName;
			if (tg == menu_tmp.menu_caption_tag) {
				if (vt == 'PageOverlay') divUl = $('<ul></ul>').appendTo($(ul));
				li = $('<li></li>').addClass('level-'+level);
				if (i == 0) {
					$(li).addClass('first');
				}
				$(li).append($('<a></a>').attr('href', '#').text($(itm).text()));
				u = getMenuItems( $(itm).next(menu_tmp.menu_item_parent_tag).children(menu_tmp.menu_item_tag), level+1);
				$(u).appendTo($(li));
			}
			if (vt == 'PageOverlay') {
				$(li).appendTo($(divUl));
			} else {
	    		$(li).appendTo($(ul));
	    	}
		});
		return $(ul);
	};
	
	function positionNavAndCntrl(obj, nav) {
		var noToggle = ["InlineOverlay", "Select"];
		if (noToggle.indexOf(obj.viewType) == -1) {
			var cntrl = getMenuControl(obj);
			if (obj.nav_toggle_position == 'last') {
				$(obj.nav_toggle_parent).append($(cntrl));
			} else {
				$(obj.nav_toggle_parent).prepend($(cntrl));
			}
		}
		if (obj.viewType == 'SplitView') {
			if (obj.page_wrapper == 'body') {
				$('body').wrapInner('<div class="gp-responsive-page-wrapper" />');
				$('body').prepend($(nav));
			} else {
				$(obj.page_wrapper).prepend($(nav));
			}
			if (obj.show_close_btn) {
				var a = $('<a></a>').addClass('gp-responsive-nav-close').prependTo($('.'+obj.nav_cntnr_class));
				setMenuControlClick(a, obj);
			}
		} else {
			if (obj.nav_position == 'last') {
				$(obj.nav_parent).append($(nav));
			} else {
				$(obj.nav_parent).prepend($(nav));
			}
		}
		return true;
	};
	
	function setParentCaption(nav, obj) {
		var a, ul;
    	var li = $(nav).find('li').has('ul');
    	//$(nav).find('li').has('ul').addClass('gp-responsive-has-sub');
    	$.each($(li), function(i, itm){
    		$(this).addClass('gp-responsive-has-sub');
    		a = $(this).children('a')[0];
    		ul = $(this).children('ul')[0];
    		//if ($(a).attr('href'))
    		if ($(a).attr('href') == '#') {
    			$(a).addClass('gp-category-title');
    		} else {
	    		$(ul).prepend($('<li></li>').addClass('level-'+$(ul).index()).append($(a).clone(true).text(obj.parent_menu_prefix + ' '+ $(a).text())));
	    		if ($(a).parent('li').hasClass('level-0')) {
	    			$(a).attr('href', '#').addClass('gp-category-title');
	    		} else {
	    			$(a).attr('href', '#').addClass('gp-sub-category-title');
	    		}
    		}
    		if (obj.viewType != 'PageOverlay') {
    			if (obj.show_nav_caret) {
    				$(a).append('<b class="gp-nav-caret" />');
    			}
    		}
    	});
		return true;
	};
    
    function getMenuControl(obj) {
    	var viewType = obj.viewType;
    	var a = $('<a></a>').addClass(obj.nav_toggle_class);
    	if (obj.nav_toggle_icon_class) {
    		$(a).attr('title', obj.nav_toggle_text).addClass(obj.nav_toggle_icon_class);
    	} else {
    		$(a).text(obj.nav_toggle_text);
    		if (obj.show_nav_toggle_caret) {
    			$(a).append('<b class="gp-toggle-caret" />');
    		}
    	}
    	setMenuControlClick(a, obj);
    	if (obj.nav_toggle_wrapper_class) {
    		return $('<div></div>').addClass(obj.nav_toggle_wrapper_class+ ' gp-toggle-'+obj.menuType).append($(a));	
    	} else {
    		return $(a).addClass('gp-toggle-'+obj.menuType);
    	}
    	
    	//return $('<li></li>').attr('id', 'gp-menu-control-cntnr').append($('<a></a>').addClass(opts.menu_control).text(opts.menu_control_text));
    };
    
    function setMenuControlClick(a, obj) {
    	var viewType = obj.viewType;
    	
    	$(a).click(function(e) {
    		$(this).toggleClass(obj.active_class);
    		$('.'+obj.nav_cntnr_class).toggle();
    		if (viewType == 'SplitView') {
	    		$('body').toggleClass(obj.active_class);
    		} 
  			e.preventDefault();
    	});
    };
    
    function setSubMenuClick(obj) {
		$('.'+obj.nav_cntnr_class + ' .gp-responsive-has-sub a').click(function(e) {
			var h = $(this).attr('href');
			if (h == '#') {
				// InlineOverlay is used to convert sidebar menu into top menu
				$(this).toggleClass(obj.active_class);
				if (obj.viewType == 'InlineOverlay') {
		    		var ln = $(this).parents('ul').length;
		    		if (ln == 1) {
		    			$(openUL).hide();
		    			$(openUL).find('ul').hide();
		    		} else {
		    			$(openSub).hide();
		    		}
		    		var u = $(this).parent().children('ul');
		    		if (ln == 1) {
		    			if (!$(u).is(openUL)) {
		    				$(u).show();
		    			}
		    			openUL = u;
		    		} else {
		    			if (!$(u).is(openSub)) {
		    				$(u).show();
		    			}
		    			openSub = u;
		    		}
		    	} else {
		    		$(this).parent().children('ul').toggle();
		    	}
	    		e.preventDefault();
	    	}
    	});
    	return true;
	};
    
    function getMenuChildren(obj) {
    	var chld;
    	var m = opts.secondary_nav;
    	var el = (obj.menuType == 'primary') ? $this : $(m.menu_container);
    	if (obj.menu_structure) {
    		var menu_tmp = obj.menu_structure;
    		chld = (menu_tmp.menu_tag == 'self') ? $(el).children() : $(el).children(menu_tmp.menu_tag).children();
    	} else {
    		chld = $(el).children('li');
    	}
    	return chld;
    };
    
    function removeMenu(menuType) {
		$('.gp-toggle-'+menuType).remove();
    	$('.gp-nav-'+menuType).remove();
    	$('.gp-select-'+menuType).remove();
	};
	
	function resetMenu(menuType) {
		if (menuType == 'primary') {
	    	currentMode = '';
	    	//$this.children().show();
    	} else {
    		currentSecMode = '';
    	}
    	removeMenu(menuType); 
    	toggleDefaultMenu(menuType, true);
    };
    
    function toggleDefaultMenu(menuType, show) {
    	var m;
    	if (menuType == 'primary') {
    		//$this.children().toggle();
    		m = (opts.nav_container_parent) ? opts.nav_container_parent : $this.children();
    	} else {
    		m = opts.secondary_nav;
    		m = m.menu_container;	
    	}
		if (show) {
			$(m).show();
		} else {    			
			$(m).hide();	
		}
    };
   
};

$.gpMenu.defaults = {
	nav_container_parent: '', // the parent of the existing menu
	menu_select_text: 'MENU', 
	nav_toggle_text: 'MENU',
	nav_toggle_icon_class: '',
	nav_toggle_class: 'gp-responsive-nav-toggle',
	nav_toggle_parent: '',
	nav_toggle_wrapper_class: 'gp-responsive-toggle-wrapper',
	nav_toggle_position: 'last', //first
	show_nav_toggle_caret: true,
	show_nav_caret: true,
	nav_parent: '',
	nav_position: 'last', //first
	nav_cntnr_class: 'gp-responsive-nav-cntnr',
	media_query_modes: '',
	menu_structure: '',
	page_wrapper: '.wrapper',
	parent_menu_prefix: 'All ',
	active_class: 'active',
	show_close_btn: false,
	secondary_nav: ''
};

})(jQuery);		   