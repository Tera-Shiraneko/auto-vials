const VIAL_ID = 182433;				// Vial of Elinu's Tears ID.
const ACTION_DELAY = 1000;			// Delay between different actions in milliseconds.
const CHAR_SELECT_DELAY = 10000;	// Delay between retrieving the character list and selecting the character in milliseconds.

module.exports = function Autovials(mod) {
	
	let enabled = false,
		cooldown = false,
		gameId = null,
		playerId = null,
		itemId = null,
		itemAmount = null,
		chars = null,
		charsUsed = [],
		returnToChar = null,
		cdTimer = null,
		charSelectTimer = null
		
		
	mod.hook('S_LOGIN', 10, (event) => {
		({gameId, playerId} = event);
	});
	
	mod.hook('S_INVEN', 16, (event) => {
		let invenList = event.items;
		
		for(let i = 0; i < invenList.length; i++) {
			if(invenList[i].id == VIAL_ID) {
				itemId = invenList[i].dbid;
				itemAmount = invenList[i].amount;
				break;
			}
		}
	});
	
	mod.hook('S_START_COOLTIME_ITEM', 1, (event) => {
		if(event.item == VIAL_ID) {
			cooldown = true;
			cdTimer = setTimeout(function() { cooldown = false }, event.cooldown * 1000);
		}
	});
	
	mod.hook('S_RETURN_TO_LOBBY', 'raw', () => {
		cooldown = false;
		itemId = null;
		itemAmount = null;
		clearTimeout(cdTimer);
	});
	
	mod.hook('C_SELECT_USER', 'raw', () => {
		if(enabled || returnToChar) {
			return false;
		}
	});
	
	mod.hook('C_CANCEL_RETURN_TO_LOBBY', 'raw', () => {
		if(!enabled && returnToChar) {
			returnToChar = null;
			mod.command.message('Interrupted Return To The Starting Character.');
		}
	});
	
	mod.hook('C_LOAD_TOPO_FIN', 'raw', () => {
		if(enabled) {
			setTimeout(useVial, ACTION_DELAY);
		}
	});
	
	mod.hook('S_GET_USER_LIST', 15, (event) => {
		if(!charSelectTimer) {
			chars = event.characters;
			
			if(enabled) {
				for(let i = 0; i < chars.length; i++) {
					if(charsUsed.indexOf(chars[i].id) == -1) {
						let charid = chars[i].id;
						
						charSelectTimer = setTimeout(function() {
							mod.send('C_SELECT_USER', 1, {
								id: charid,
								unk: 0
							});
							charSelectTimer = null;
						}, CHAR_SELECT_DELAY);
						
						mod.log(`Next Character Selected ${chars[i].name}.`);
						break;
					}
				}
			} else if(returnToChar) {
				charSelectTimer = setTimeout(function() {
					mod.send('C_SELECT_USER', 1, {
						id: returnToChar,
						unk: 0
					});
					charSelectTimer = null;
					returnToChar = null;
				}, CHAR_SELECT_DELAY);
				mod.log(`Returning To The Starting Character.`);
			}
		}
	});
	
	mod.command.add('autovials', () => {
		if(!enabled) {
			enabled = true;
			returnToChar = playerId;
			mod.command.message('Auto Vials Enabled.');
			mod.log(`Auto Vials Enabled.`);
			useVial();
		} else {
			disableAutoVial();
			returnToChar = null;
		}
	});
	
	function useVial() {
		if(!cooldown && itemAmount > 0) {
			mod.send('C_USE_ITEM', 3, {
				gameId,
				id: VIAL_ID,
				dbid: itemId,
				amount: 1
			});
			mod.command.message('Vial Of Elinus Tears Used.');
		}
		charsUsed.push(playerId);
		
		if(chars.length > charsUsed.length) {
			mod.command.message('Switching Characters.');
			setTimeout(returnToLobby, ACTION_DELAY);
		} else {
			disableAutoVial();
			setTimeout(returnToLobby, ACTION_DELAY);
			mod.command.message('Returning To The Starting Character.');
		}
	}
	
	function returnToLobby() {
		mod.send('C_RETURN_TO_LOBBY', 1);
	}
	
	function disableAutoVial() {
		enabled = false;
		charsUsed = [];
		mod.command.message('Auto Vials Disabled.');
		mod.log(`Auto Vials Disabled.`);
	}
}