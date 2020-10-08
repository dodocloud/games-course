let myStorage = window.localStorage;
 
myStorage.setItem('player_state', player.stateId);
myStorage.removeItem('player_state');
myStorage.clear();