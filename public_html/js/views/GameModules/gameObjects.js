define(function (require) {
    var THREE = require('three');
   
    
    var objects = {
        scene: null,
        camera: null,
		cameraControls: null,
        light: null,
        renderer: null,
        particleEngine: null,
        playersCharacter: null,
        bombReys:{},
        playersCharacterLook: 950,
        fps: 0, // needed to move bomber sync to server
        objects: {}, // here we dump all links to obstacle index by id of object
        bombObj: null,
        prefabsObjects: {},
        worldObjects: {
            indestructible_crate: new THREE.MeshPhongMaterial({map: new THREE.TextureLoader().load('media/game/textures/grey_bricks2.jpg')}),
            destructible_crate: new THREE.MeshPhongMaterial({map: new THREE.TextureLoader().load('media/game/textures/destruct_crate.gif')}),
            bomb_bonus_range: new THREE.MeshPhongMaterial({map: new THREE.TextureLoader().load('media/game/textures/bonus_bomb.gif')}),
            drop_bomb_on_death: new THREE.MeshPhongMaterial({map: new THREE.TextureLoader().load('media/game/textures/death_bomb.jpg')}),
            explosion_rey: new THREE.MeshPhongMaterial({map: new THREE.TextureLoader().load('media/game/textures/explosion.jpg')}),
            shockwaveGroup : THREE.ImageUtils.loadTexture('../media/game/textures/smokeparticle.png'),
            fireball: THREE.ImageUtils.loadTexture('../media/game/textures/sprite-explosion2.png')
        },
        getRealCoordinates: function (x, z) {
            return {
                x: x * 64 - 992,
                z: z * 64 - 992
            }
        },
        getBomberManRealCoordinates: function (x, z) {
            return {
                x: x * 64 - 1024,
                z: z * 64 - 1024
            }
        },
		addPrefabToWorld: function (model, id, x, z) { // needed to place objects by x, y and its id
            var coordinates = this.getRealCoordinates(x, z);
            model.position.set(coordinates.x, 32, coordinates.z);
            this.objects[id] = {
                index: model
            };
            this.scene.add(model);
        },
		addComplexObjectToWorld: function (object, id) {
            this.objects[id] = {
                index: object,
				isComplex: true
            };
			for (var i = 0; i < object.objects.length; i++) {
				var model = object[object.objects[i]];
				this.scene.add(model);
			}
        },
        addObjectToWorldWithNoCollisions: function (type, obj_geometry, id, x, z) { // needed to place objects by x, y and its id
            var realObj = new THREE.Mesh(obj_geometry, type);
            var coordinates = this.getRealCoordinates(x, z);
            realObj.position.set(coordinates.x, 32, coordinates.z);
            this.objects[id] = {
                index: realObj
            };
            this.scene.add(realObj);
        },
        deleteObjectFromWorld: function (id) {
            if (this.objects[id]) {
                var object = this.objects[id];
                if (object.isComplex) {
                    for (var i = 0; i < object.index.objects.length; i++) {
                        var model = object.index[object.index.objects[i]];
                        this.scene.remove(model);
                    }
                    delete this.objects[id];
                    return
                }
                if (this.objects[id].index.mesh != undefined) {
                    this.scene.remove(this.objects[id].index.mesh);
                } else {
                    this.scene.remove(this.objects[id].index);
                }
                delete this.objects[id];
                return
            } 
            if (this.bombReys[id]) {
                this.scene.remove(this.bombReys[id].shockwaveGroup.mesh);
                this.scene.remove(this.bombReys[id].group.mesh);
                delete this.bombReys[id];
            }
        },
        setBomb: function (id, x, z) {
            var bomb = this.bombObj.clone();
            var coordinates = this.getRealCoordinates(x,z);
            bomb.position.set(coordinates.x, 2, coordinates.z);
            var timerId = setInterval(function () {
                bomb.scale.y *= 1.11;
                bomb.scale.x *= 1.11;
                bomb.scale.z *= 1.11;
            }, 500);
            setTimeout(function () {
                clearInterval(timerId);
            }, 2100);
            this.objects[id] = {
                index: bomb
            };
            this.scene.add(bomb);
        }
    };
    return objects;
});