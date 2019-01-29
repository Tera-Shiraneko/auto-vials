
const SettingsUI = require('tera-mod-ui').Settings;

module.exports = function Autovials(mod) {

    if (mod.proxyAuthor !== 'caali' || !global.TeraProxy) {
        mod.warn('You are trying to use this module on an unsupported legacy version of tera-proxy.');
        mod.warn('The module may not work as expected, and even if it works for now, it may break at any point in the future!');
        mod.warn('It is highly recommended that you download the latest official version from the #proxy channel in http://tiny.cc/caalis-tera-proxy');
    }

    let chars = null,
        itemid = null,
        charsused = [],
        cooldown = false,
        itemamount = null,
        returntochar = null,
        cooldowntimer = null,
        charselecttimer = null;

    mod.command.add('autovialsconfig', () => {
        if (ui) {
            ui.show();
        }
    });

    mod.command.add('autovials', () => {
        if (!mod.settings.enabled) {
            mod.settings.enabled = true;
            returntochar = mod.game.me.playerId;
            mod.command.message('Autovials is now enabled.');
            mod.log(`Autovials is now enabled.`);
            vialusage();
        } else {
            disablemodule();
            returntochar = null;
        }
    });

    mod.command.add('autovialsid', (id) => {
        mod.settings.elinuid = Number.parseInt((id.replace(/\D+/g, '')), 10);
        if (mod.settings.elinuid === 0) {
            mod.command.message('Please enter an valid item id.');
            return;
        }
        mod.command.message(`Vial of elinus tears id set to ${mod.settings.elinuid}.`);
    });

    mod.command.add('autovialsactiondelay', (id) => {
        mod.settings.actiondelay = Number.parseInt((id.replace(/\D+/g, '')), 10);
        if (mod.settings.actiondelay < 1000) {
            mod.settings.actiondelay = 1000;
            mod.command.message('Default settings applied please enter an valid delay number.');
        }
        mod.command.message(`Delay between actions set to ${mod.settings.actiondelay/1000}s.`);
    });

    mod.command.add('autovialschardelay', (id) => {
        mod.settings.charselectdelay = Number.parseInt((id.replace(/\D+/g, '')), 10);
        if (mod.settings.charselectdelay < 15000) {
            mod.settings.charselectdelay = 15000;
            mod.command.message('Default settings applied please enter an valid delay number.');
        }
        mod.command.message(`Delay between switching characters set to ${mod.settings.charselectdelay/1000}s.`);
    });

    mod.hook('S_INVEN', 17, (event) => {
        let invenlist = event.items;

        for (let i = 0; i < invenlist.length; i++) {
            if (invenlist[i].id == mod.settings.elinuid) {
                itemid = invenlist[i].dbid;
                itemamount = invenlist[i].amount;
                break;
            }
        }
    });

    mod.hook('S_START_COOLTIME_ITEM', 1, (event) => {
        if (event.item == mod.settings.elinuid) {
            cooldown = true;
            cooldowntimer = setTimeout(function() {
                cooldown = false
            }, event.cooldown * 1000);
        }
    });

    mod.hook('S_RETURN_TO_LOBBY', 'raw', () => {
        cooldown = false;
        itemid = null;
        itemamount = null;
        clearTimeout(cooldowntimer);
    });

    mod.hook('C_SELECT_USER', 'raw', () => {
        if (mod.settings.enabled || returntochar) {
            return false;
        }
    });

    mod.hook('C_CANCEL_RETURN_TO_LOBBY', 'raw', () => {
        if (!mod.settings.enabled && returntochar) {
            returntochar = null;
            mod.command.message('Interrupting return to the starting character.');
        }
    });

    mod.hook('C_LOAD_TOPO_FIN', 'raw', () => {
        if (mod.settings.enabled) {
            setTimeout(vialusage, mod.settings.actiondelay);
        }
    });

    mod.hook('S_GET_USER_LIST', 15, (event) => {
        if (!charselecttimer) {
            chars = event.characters;

            if (mod.settings.enabled) {
                for (let i = 0; i < chars.length; i++) {
                    if (charsused.indexOf(chars[i].id) == -1) {
                        let charid = chars[i].id;

                        charselecttimer = setTimeout(function() {
                            mod.send('C_SELECT_USER', 1, {
                                id: charid,
                                unk: 0
                            });
                            charselecttimer = null;
                        }, mod.settings.charselectdelay);

                        mod.log(`Next character selected is ${chars[i].name}.`);
                        break;
                    }
                }
            } else if (returntochar) {
                charselecttimer = setTimeout(function() {
                    mod.send('C_SELECT_USER', 1, {
                        id: returntochar,
                        unk: 0
                    });
                    charselecttimer = null;
                    returntochar = null;
                }, mod.settings.charselectdelay);
                mod.log(`Returning to the starting character.`);
            }
        }
    });

    function vialusage() {
        if (mod.settings.elinuid === 0) {
            mod.settings.elinuid = 182433;
            mod.command.message('Default item id applied please enter an valid item id next time.');
        }
        if (!cooldown && itemamount > 0) {
            mod.send('C_USE_ITEM', 3, {
                gameId: mod.game.me.gameId,
                id: mod.settings.elinuid,
                dbid: itemid,
                amount: 1
            });
            mod.command.message('Vial was used successfully.');
        }
        charsused.push(mod.game.me.playerId);

        if (chars.length > charsused.length) {
            mod.command.message('Switching characters.');
            setTimeout(lobbyreturn, mod.settings.actiondelay);
        } else {
            disablemodule();
            setTimeout(lobbyreturn, mod.settings.actiondelay);
            mod.command.message('Returning to the starting character.');
        }
    }

    function lobbyreturn() {
        mod.send('C_RETURN_TO_LOBBY', 1);
    }

    function disablemodule() {
        mod.settings.enabled = false;
        charsused = [];
        mod.command.message('Autovials is now disabled.');
        mod.log(`Autovials is now disabled.`);
    }

    let ui = null;
    if (global.TeraProxy.GUIMode) {
        ui = new SettingsUI(mod, require('./settings_structure'), mod.settings, { height: 190 }, { alwaysOnTop: true });
        ui.on('update', settings => { mod.settings = settings; });

        this.destructor = () => {
            if (ui) {
                ui.close();
                ui = null;
            }
        };
    }
};