## Tera proxy module which uses vial of elinu's tears on every character.

---

## Console Command
- Type `/8 autovials` to enable or disable the modules function.
- Type `/8 autovialsid + id` to set the the item id which should be used on every character.
- Type `/8 autovialsactiondelay + ms` to set the delay between the actions default is one second.
- Type `/8 autovialschardelay + ms` to set the delay for switching to the next character default is 15 seconds.

---

## Interface Command
- Type `/8 autovialsconfig` to modify char select and action timeouts and the vial of elinu's tears id.

---

## Note
- To disable the module you must cancel the return to character selection message and run the autovials command.
- The module will prevent you from selecting a character manually while it is running, for additional safety.
- If it doesn't find any, or it finds it but it is on cooldown, it will simply proceed to the next character.
- The module will login to a character whether or not it has vial of elinu's tears in the inventory.
- When the module has finished its job, it will return to the character it was started from.
    - Click cancel on the return to character message and use command again.
- You can pause the process by cancelling the return to character selection message.
    - The module will continue if you manually return to character selection.
- The commands should be written without the plus just an space between it.