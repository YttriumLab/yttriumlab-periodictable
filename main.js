// note: FileSaver.js is not in use

(function(global, $)
{
	'use strict';
	
	if ($ == null)
	{
		global.alert('! jQuery is not loaded');
		throw new Error('jQuery is required');
	}
	
	var yl = global.yl || {};
	
	yl.Launch = function()
	{
		yl.utils = {};
		
		yl.utils.FromKelvin = function(value, to)
		{
			switch (to.toLowerCase())
			{
				default:
				case 'c':
				case 'celsius':
					return (value - 273.15).toFixed(2);
				case 'f':
				case 'fahrenheit':
					var c = yl.utils.FromKelvin(value, 'c');
					return ((9 / 5) * c + 32).toFixed(2);
			}
		};
		
		yl.utils.CELSIUS_CHAR = '°C';
		yl.utils.FAHRENHEIT_CHAR = '°F';
		
		//-----------------------------------------------------------
		//---- JQUERY OBJECTS ---------------------------------------
		//-----------------------------------------------------------
		
		yl.$elms = {};
		yl.$elms.global = $(global);
		yl.$elms.document = $(global.document);
		yl.$elms.loading = $('#loading');
		yl.$elms.wrapper = $('#wrapper');
		yl.$elms.periodicTable = $('#periodicTable');
		yl.$elms.info = $('#info');
		
		//-----------------------------------------------------------
		//---- DRAW PERIODIC TABLE ----------------------------------
		//-----------------------------------------------------------
		
		yl.periodicTable = {};
		yl.periodicTable.PERIODIC_TABLE = PERIODIC_TABLE;
		yl.periodicTable.PERIODIC_TABLE_ELEMENTS = PERIODIC_TABLE.elements;
		yl.periodicTable.ELEMENTS_NUMBER = yl.periodicTable.PERIODIC_TABLE_ELEMENTS.length;
		yl.periodicTable.WIDTH = 18;
		yl.periodicTable.HEIGHT = 10;
		
		yl.periodicTable.Draw = function()
		{
			var str = '';
			str += '<thead>' + '<tr>';
			str += '<th></th>';
			for (var i = 1; i < yl.periodicTable.WIDTH + 1; ++i) str += '<th data-pos="' + i + ',0">' + i + '</th>';
			str += '</tr>' + '</thead>';
			
			str += '<tbody>';
			for (var y = 1; y < yl.periodicTable.HEIGHT + 1; ++y)
			{
				str += '<tr>';
				str += '<th data-pos="0,' + y + '">' + y + '</th>';
				for (var x = 1; x < yl.periodicTable.WIDTH + 1; ++x)
					str += '<td class="periodicTable_cell" data-pos="' + x + ',' + y + '"></td>';
				str += '</tr>';
			}
			str += '</tbody>';
			
			yl.$elms.periodicTable.html(str);
			
			yl.periodicTable.PERIODIC_TABLE_ELEMENTS.forEach(function(e)
			{
				$('.periodicTable_cell').each(function()
				{
					var pos = $(this).data('pos').split(',');
					var x = Number(pos[0]);
					var y = Number(pos[1]);
					if (e.xpos === x && e.ypos === y)
					{
						str = '';
						str += '<small>' + e.number + '</small>';
						str += e.symbol;
						$(this)
							.html(str)
							.css('background', '#' + e['cpk-hex'])
							.attr({ 'data-element': e.number, title: e.name });
					}
					else if (x === 3 && y === 6)
					{
						str = '<small>57&ndash;71</small>';
						$(this)
							.html(str)
							.css('background', '#70d4ff')
							.attr({ 'data-element': 57, title: 'Lanthanoid' });
					}
					else if (x === 3 && y === 7)
					{
						str = '<small>89&ndash;103</small>';
						$(this)
							.html(str)
							.css('background', '#70abfa')
							.attr({ 'data-element': 89, title: 'Actinoid' });
					}
				});
			});
			
			console.log('drew periodic table');
		};
		
		yl.periodicTable.Draw();
		
		yl.$elms.cells = $('.periodicTable_cell');
		
		//-----------------------------------------------------------
		//---- SEARCH BOX -------------------------------------------
		//-----------------------------------------------------------
		
		yl.search = {};
		
		yl.search.Draw = function()
		{
			var str = '';
			str += '<div id="searchBox">';
			str += '<input id="searchBoxInput" type="text" placeholder="search element ..." />';
			str += '</div>';
			yl.$elms.wrapper.append(str);
		};
		
		yl.search.Draw();
		
		yl.$elms.searchBox = $('#searchBox');
		yl.$elms.searchBoxInput = $('#searchBoxInput');
		yl.$elms.searchBox.hide();
		
		yl.search.FindElement = function(query)
		{
			if (!query) return null;
			query = String(query).trim().toLowerCase();
			if (!query) return null;
			
			var num = Number(query);
			if (!isNaN(num))
			{
				var byNumber = yl.periodicTable.PERIODIC_TABLE_ELEMENTS[num - 1];
				if (byNumber) return byNumber;
			}
			
			var element;
			
			for (var i = 0; i < yl.periodicTable.PERIODIC_TABLE_ELEMENTS.length; ++i)
			{
				element = yl.periodicTable.PERIODIC_TABLE_ELEMENTS[i];
				if (element.name.toLowerCase() === query) return element;
				if (element.symbol.toLowerCase() === query) return element;
			}
			for (var j = 0; j < yl.periodicTable.PERIODIC_TABLE_ELEMENTS.length; ++j)
			{
				element = yl.periodicTable.PERIODIC_TABLE_ELEMENTS[j];
				if (element.name.toLowerCase().indexOf(query) !== -1) return element;
				if (element.symbol.toLowerCase().indexOf(query) !== -1) return element;
			}
			
			return null;
		};
		
		yl.search.Open = function()
		{
			if (yl.$elms.searchBoxInput.is(':visible'))
			{
				yl.$elms.searchBoxInput.focus();
				return;
			}
			
			yl.$elms.searchBox.show();
			yl.$elms.searchBoxInput.val('').focus();
		};
		yl.search.Close = function()
		{
			yl.$elms.searchBox.hide();
			yl.$elms.searchBoxInput.val('');
		};
		
		yl.search.Submit = function()
		{	
			var query = yl.$elms.searchBoxInput.val();
			var element = yl.search.FindElement(query);
			if (!element) return;
			
			$('.periodicTable_cell[data-element="' + element.number + '"]').click();
		};
		
		//-----------------------------------------------------------
		//---- SHOW INFO --------------------------------------------
		//-----------------------------------------------------------
		
		yl.info = {};
		
		yl.info.GetInfo = function(index, beautify)
		{
			// example:
			// 
			// <h2>
			// 	<a target="_blank" title="https://en.wikipedia.org/wiki/Yttrium" href="https://en.wikipedia.org/wiki/Yttrium">Yttrium</a>
			// </h2>
			// <hr />
			// <p>Yttrium is a chemical element with ...</p>
			// <hr />
			// <ul>
			// 	<li>Phase: solid</li>
			// 	<li>Atomic mass: 88.905842</li>
			// 	<li>Melt: 1799 K (1525.85 °C)</li>
			// 	<li>Boil: 3203 K (2929.85 °C)</li>
			// </ul>
			
			var element = yl.periodicTable.PERIODIC_TABLE_ELEMENTS[index - 1];
			if (!element) return '';
			var indent = beautify === true ? '\t' : '';
			var lineFeed = beautify === true ? '\n' : '';
			var str = '';
			str += '<h2>' + lineFeed;
			str += indent + '<a target="_blank" title="' + element.source + '" href="' + element.source + '">';
			str += element.name;
			str += '</a>' + lineFeed;
			str += '</h2>' + lineFeed;
			str += '<hr />' + lineFeed;
			str += '<p>' + element.summary + '</p>' + lineFeed;
			str += '<hr />' + lineFeed;
			str += '<ul>' + lineFeed;
			str += indent + '<li>Phase: ' + element.phase.toLowerCase() + '</li>' + lineFeed;
			str += indent + '<li>Atomic mass: ' + element.atomic_mass + '</li>' + lineFeed;
			str += indent + '<li>Melt: ' + element.melt + ' K (' + yl.utils.FromKelvin(element.melt, 'c') + ' ' + yl.utils.CELSIUS_CHAR + ')</li>' + lineFeed;
			str += indent + '<li>Boil: ' + element.boil + ' K (' + yl.utils.FromKelvin(element.boil, 'c') + ' ' + yl.utils.CELSIUS_CHAR + ')</li>' + lineFeed;
			str += '</ul>';
			return str;
		};
		yl.info.ShowInfo = function()
		{
			yl.$elms.info.html('loading info ...');
			var info = yl.info.GetInfo(this.data('element'));
			if (!info) return;
			yl.$elms.info.html(info);
		};
		
		yl.$elms.cells.on('click', function(e)
		{
			var $this = $(this);
			yl.$elms.cells.removeClass('active');
			$this.addClass('active');
			var pos = $this.data('pos').split(',');
			$('#periodicTable th[data-pos]').removeClass('thActive');
			$('#periodicTable th[data-pos="' + pos[0] + ',0"]').addClass('thActive');
			$('#periodicTable th[data-pos="0,' + pos[1] + '"]').addClass('thActive');
			yl.info.ShowInfo.call($this, e);
		});
		
		(function()
		{
			if (global.location.hash === '')
			{
				$('.periodicTable_cell[data-element="39"]').click();
				console.log(
					'loaded default element info: ' +
					yl.periodicTable.PERIODIC_TABLE_ELEMENTS[38].name.toLowerCase()
				);
				return;
			}
			
			var hash = global.location.hash.replace(/#/g, '').toLowerCase();
			var num = Number(hash);
			if (!isNaN(num) && (1 <= num && num <= yl.periodicTable.ELEMENTS_NUMBER))
			{
				$('.periodicTable_cell[data-element="' + hash + '"]').click();
				console.log(
					'loaded element info from hash: ' +
					yl.periodicTable.PERIODIC_TABLE_ELEMENTS[hash - 1].name.toLowerCase()
				);
				return;
			}
			
			for (var i = 0; i < yl.periodicTable.PERIODIC_TABLE_ELEMENTS.length; ++i)
			{
				var me = yl.periodicTable.PERIODIC_TABLE_ELEMENTS[i];
				if (me.name.toLowerCase() === hash || me.symbol.toLowerCase() === hash)
				{
					$('.periodicTable_cell[data-element="' + me.number + '"]').click();
					console.log('loaded element info from hash: ' + me.name.toLowerCase());
					return;
				}
			}
			
			if (hash === 'lanthanoid')
			{
				$('.periodicTable_cell[data-element="57"]').click();
				console.log('loaded element info from hash: ' + hash);
				return;
			}
			if (hash === 'actinoid')
			{
				$('.periodicTable_cell[data-element="89"]').click();
				console.log('loaded element info from hash: ' + hash);
				return;
			}
			
			else
			{
				console.log([
					'the element could not be read from the url hash (' + hash + ')',
					'the following can be used in the hash:',
					'\t• atomic number (e.g. #39)',
					'\t• element symbol (e.g. #y)',
					'\t• element name (e.g. #yttrium)'
				].join('\n'));
				$('.periodicTable_cell[data-element="39"]').click();
				console.log(
					'loaded default element info: ' +
					yl.periodicTable.PERIODIC_TABLE_ELEMENTS[38].name.toLowerCase()
				);
				return;
			}
		})();
		
		//-----------------------------------------------------------
		//---- EVENT LISTENERS --------------------------------------
		//-----------------------------------------------------------
		
		yl.$elms.global.on('keydown', function(e)
		{
			var element;
			var x, y, pos;
			
			if (e.keyCode === 70)
			{
				e.preventDefault();
				yl.search.Open();
			}
			
			else if ((e.keyCode === 9 && e.shiftKey) || e.keyCode === 37)
			{
				// tab-shift or left
				e.preventDefault();
				element = $('.active').data('element') - 1;
				if (element < 1) element = yl.periodicTable.PERIODIC_TABLE_ELEMENTS.length;
				$('.periodicTable_cell[data-element="' + element + '"]').click();
				return;
			}
			else if (e.keyCode === 9 || e.keyCode === 39)
			{
				// tab or right
				e.preventDefault();
				element = $('.active').data('element') + 1;
				if (element > yl.periodicTable.PERIODIC_TABLE_ELEMENTS.length)
					element = 1;
				$('.periodicTable_cell[data-element="' + element + '"]').click();
			}
			else if (e.keyCode === 38)
			{
				// up
				e.preventDefault();
				pos = $('.active').data('pos').split(',');
				x = pos[0];
				y = pos[1] - 1;
				element = $('.periodicTable_cell[data-element][data-pos="' + x + ',' + y + '"]');
				if (!element.length && pos[0] === '3' && pos[1] === '9') // lanthanum to yttrium
					$('.periodicTable_cell[data-element="39"]').click();
				element.click();
			}
			else if (e.keyCode === 40)
			{
				// down
				e.preventDefault();
				pos = $('.active').data('pos').split(',');
				x = pos[0];
				y = Number(pos[1]) + 1;
				element = $('.periodicTable_cell[data-element][data-pos="' + x + ',' + y + '"]');
				if (!element.length) return;
				element.click();
			}
		});
		
		yl.$elms.searchBoxInput.on('keydown', function(e)
		{
			if (e.keyCode === 13)
			{
				// enter
				e.preventDefault();
				yl.search.Submit();
			}
			else if (e.keyCode === 27)
			{
				// escape
				e.preventDefault();
				yl.search.Close();
			}
		});
		
		//-----------------------------------------------------------
		//---- INIT -------------------------------------------------
		//-----------------------------------------------------------
		
		var periodicTableUrl = 'https://github.com/Bowserinator/Periodic-Table-JSON';
		
		yl.$elms.wrapper.append('<small id="date">As of 2026/08; powered by <a title="Periodic Table JSON" href="' + periodicTableUrl + '" target="_blank">PeriodicTable.json</a></small>');
		
		$('a[target="_blank"]').attr('rel', 'noopener');
		
		yl.$elms.loading.hide().empty();
		yl.$elms.wrapper.show();
		
		console.log('loading complete');
	};
	
	$(yl.Launch);
	
	global.yl = yl;
})(this, typeof jQuery !== 'undefined' ? jQuery : null);
