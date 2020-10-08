await db.players.add({
    name: 'Warrior',  
    avatar: await getBlob('sprite_warrior.png'),
    key_mapping: 'default'
});