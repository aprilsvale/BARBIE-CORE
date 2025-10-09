let player = {
    health: 100,
    maxHealth: 100,
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    strength: 10,
    defense: 5,
    inventory: []
};

let currentLocation = "Beauty Salon";
let enemy = null;
let item = null;


const healthElement = document.getElementById('health');
const healthBarElement = document.getElementById('health-bar');
const levelElement = document.getElementById('level');
const xpElement = document.getElementById('xp');
const xpBarElement = document.getElementById('xp-bar');
const strengthElement = document.getElementById('strength');
const defenseElement = document.getElementById('defense');
const inventoryElement = document.getElementById('inventory');
const locationNameElement = document.getElementById('location-name');
const locationDescElement = document.getElementById('location-desc');
const enemyContainerElement = document.getElementById('enemy-container');
const itemContainerElement = document.getElementById('item-container');
const actionButtonsElement = document.getElementById('action-buttons');
const combatButtonsElement = document.getElementById('combat-buttons');
const logElement = document.getElementById('log');


document.getElementById('explore-btn').addEventListener('click', explore);
document.getElementById('move-btn').addEventListener('click', move);
document.getElementById('gossip-btn').addEventListener('click', gossip);
document.getElementById('rest-btn').addEventListener('click', rest);
document.getElementById('attack-btn').addEventListener('click', attack);
document.getElementById('flee-btn').addEventListener('click', flee);
document.getElementById('reset-btn').addEventListener('click', resetGame);


const gossip_xp = 50;
const gossip_strength = 5;
const police_win_xp = 50;
const police_flee_xp = 20;
const bag_defense = 3;


const messages = {
    fleeFail: "Побег не удался! Полиция моды догнала вас.",
    fleeSuccess: "Вы успешно улизнули от Полиции моды! +20 опыта.",
    attackSuccess: "Полиция моды побеждена! Вы доказали свой стиль! +50 опыта.",
    attackDeath: "Полиция моды арестовала вас за плохой вкус! Игра окончена. Увы, не нужно было надевать джинсы с низкой посадкой.",
    congrats: "ПОЗДРАВЛЯЕМ! Вы достигли 10 уровня и стали иконой стиля Беверли Хиллс!",
    gameEnd: "ИГРА ЗАВЕРШЕНА! Вы доказали, что достойны быть королевой моды!",
    meetPolice: "О нет! Вы встретили Полицию моды! Они критикуют ваш наряд!",
    bagFound: "Вы нашли модную сумочку! Она добавит +2 к защите.",
    meetSupportGirls: "Вы встретили подруг! Они поддержали ваш стиль. +10 здоровья.",
    makeupSavesHealth: "Вы обновили макияж и чувствуете себя прекрасно! Здоровье восстановлено.",
    gameStart: "Вы находитесь в Беверли Хиллс. Отсюда можно отправиться на поиски скидок и обновок.",
    nailsRestart: "Игра сброшена! Вы отправились на маникюр и вернулись обновленной!",
    welcomeBarbie: "Добро пожаловать в игру 'Barbie vs. Fashion Police'! Начните исследовать мир моды!",
}

function addLog(message, type = 'normal') {
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry ${type}`;
    logEntry.textContent = message;
    logElement.appendChild(logEntry);
    logElement.scrollTop = logElement.scrollHeight;
}


function updateStats() {
    healthElement.textContent = `${player.health}/${player.maxHealth}`;
    healthBarElement.style.width = `${(player.health / player.maxHealth) * 100}%`;
    levelElement.textContent = player.level;
    xpElement.textContent = `${player.xp}/${player.xpToNextLevel}`;
    xpBarElement.style.width = `${(player.xp / player.xpToNextLevel) * 100}%`;
    strengthElement.textContent = player.strength;
    defenseElement.textContent = player.defense;
    
  
    if (player.inventory.length === 0) {
        inventoryElement.innerHTML = '<div class="inventory-item">Пусто</div>';
    } else {
        inventoryElement.innerHTML = player.inventory.map(item => 
            `<div class="inventory-item">${item}</div>`
        ).join('');
    }
}


function explore() {
    const random = Math.random();
    
    if (random < 0.3) {
        enemy = {
            name: "Полиция моды",
            health: 30,
            maxHealth: 30,
            strength: 8
        };
        showEnemy();
        addLog(messages.meetPolice, 'combat');
    } else if (random < 0.6) {
        item = "Модная сумочка";
        showItem();
        addLog(messages.bagFound, 'loot');
    } else {
        addLog(messages.meetSupportGirls, 'location-change');
        player.health = Math.min(player.health + 10, player.maxHealth);
        updateStats();
    }
}

function move() {
    const locations = [
        "Mall", "Maliby Beach", "Disco Hall", "StarBucks", "Chanel Shop"
    ];
    currentLocation = locations[Math.floor(Math.random() * locations.length)];
    locationNameElement.textContent = currentLocation;
    locationDescElement.textContent = `Вы переместились в ${currentLocation}. Что же ждет вас здесь?`;
    addLog(`Вы переместились в ${currentLocation}`, 'location-change');
    
    enemy = null;
    item = null;
    hideEnemy();
    hideItem();
    showActionButtons();
}

function gossip() {
    const gossipMessages = [
        "Вы покрысили с подружками о новых трендах. +50 опыта!",
        "Подруги рассказали вам секрет стиля. +5 к силе!",
    ];
    const randomMessage = gossipMessages[Math.floor(Math.random() * gossipMessages.length)];
    
    addLog(randomMessage, 'location-change');
    
    if (randomMessage.includes("опыта")) {
        player.xp += gossip_xp;
        checkLevelUp();
    } else if (randomMessage.includes("силе")) {
        player.strength += gossip_strength;
    }
    
    updateStats();
}

function rest() {
    player.health = player.maxHealth;
    addLog(messages.makeupSavesHealth, 'location-change');
    updateStats();
}

function attack() {
    if (!enemy) return;
    
    const playerDamage = Math.max(1, player.strength - Math.floor(Math.random() * 3));
    enemy.health -= playerDamage;
    
    addLog(`Вы пытаетесь низвергнуть полицию моды стилем и наносите ${playerDamage} урона!`, 'combat');
    
    if (enemy.health <= 0) {
        addLog(messages.attackSuccess, 'loot');
        player.xp += police_win_xp;
        checkLevelUp();
        enemy = null;
        hideEnemy();
        showActionButtons();
    } else {
        const enemyDamage = Math.max(1, enemy.strength - Math.floor(Math.random() * player.defense));
        player.health -= enemyDamage;
        addLog(`Полиция моды критикует ваш наряд! Вы получаете ${enemyDamage} урона.`, 'combat');
        
        if (player.health <= 0) {
            addLog(messages.attackDeath, 'combat');
            player.health = 0;
            combatButtonsElement.style.display = 'none';
        }
    }
    
    updateStats();
    if (enemy) updateEnemyHealth();
}

function flee() {
    if (Math.random() < 0.7) { 
        addLog(messages.fleeSuccess, 'location-change');
        player.xp += police_flee_xp;
        checkLevelUp();
        enemy = null;
        hideEnemy();
        showActionButtons();
        updateStats();
    } else {
        addLog(messages.fleeFail, 'combat');
        const enemyDamage = Math.max(1, enemy.strength - Math.floor(Math.random() * player.defense));
        player.health -= enemyDamage;
        addLog(`Вы получаете ${enemyDamage} урона при попытке побега.`, 'combat');
        updateStats();
        updateEnemyHealth();
    }
}


function pickUpItem() {
    if (!item) return;
    
    player.inventory.push(item);
    addLog(`Вы подобрали ${item}! +3 к защите.`, 'loot');
    player.defense += bag_defense;
    item = null;
    hideItem();
    updateStats();
}

function checkLevelUp() {
    if (player.xp >= player.xpToNextLevel) {
        player.level++;
        player.xp -= player.xpToNextLevel;
        player.xpToNextLevel = Math.floor(player.xpToNextLevel);
        player.maxHealth += 10;
        player.health = player.maxHealth;
        player.strength += 2;
        player.defense += 1;
        
        addLog(`Поздравляем! Вы достигли ${player.level} уровня!`, 'loot');
        updateStats();

         if (checkWin()) {
            return true;
        }
    }
    return false;
}

function showEnemy() {
    enemyContainerElement.innerHTML = `
        <div class="enemy">
            <span>${enemy.name}</span>
            <span>Здоровье: ${enemy.health}/${enemy.maxHealth}</span>
        </div>
    `;
    combatButtonsElement.style.display = 'block';
    actionButtonsElement.style.display = 'none';
}

function hideEnemy() {
    enemyContainerElement.innerHTML = '';
    combatButtonsElement.style.display = 'none';
    actionButtonsElement.style.display = 'block';
}

function updateEnemyHealth() {
    if (enemy) {
        enemyContainerElement.innerHTML = `
            <div class="enemy">
                <span>${enemy.name}</span>
                <span>Здоровье: ${enemy.health}/${enemy.maxHealth}</span>
            </div>
        `;
    }
}

function showItem() {
    itemContainerElement.innerHTML = `
        <div class="item-list">
            <div class="inventory-item">
                <span>${item}</span>
                <button onclick="pickUpItem()">Подобрать</button>
            </div>
        </div>
    `;
}

function hideItem() {
    itemContainerElement.innerHTML = '';
}

function showActionButtons() {
    combatButtonsElement.style.display = 'none';
    actionButtonsElement.style.display = 'block';
}

function checkWin() {
    if (player.level >= 10) {
        addLog(messages.congrats, 'loot');
        addLog(messages.gameEnd, 'loot');
        
        document.getElementById('explore-btn').disabled = true;
        document.getElementById('move-btn').disabled = true;
        document.getElementById('gossip-btn').disabled = true;
        document.getElementById('rest-btn').disabled = true;
        document.getElementById('attack-btn').disabled = true;
        document.getElementById('flee-btn').disabled = true;
        
        document.getElementById('reset-btn').style.display = 'block';
        
        return true;
    }
    return false;
}


function resetGame() {
    player = {
        health: 100,
        maxHealth: 100,
        level: 1,
        xp: 0,
        xpToNextLevel: 100,
        strength: 10,
        defense: 5,
        inventory: []
    };
    
    currentLocation = "Beauty Salon";
    enemy = null;
    item = null;
    
    locationNameElement.textContent = currentLocation;
    locationDescElement.textContent = messages.gameStart;
    
    hideEnemy();
    hideItem();
    showActionButtons();
    logElement.innerHTML = '';
    
    addLog(messages.nailsRestart, 'location-change');
    updateStats();
}


window.pickUpItem = pickUpItem;


updateStats();
addLog(messages.welcomeBarbie, 'location-change');