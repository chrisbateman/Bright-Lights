/* Bright Lights
 * http://github.com/chrisbateman/Bright-Lights
 * Copyright (c) 2014 Chris Bateman
 * Licensed under the MIT license */

var BrightLights = (function() {
	
	var canvas = document.getElementById("Canvas");
	var ctx = canvas.getContext('2d');
	var canvasWidth = window.innerWidth;
	var canvasHeight = window.innerHeight;
	var canvasSizePowerRatio = 1;

	var friction = 0.97;
	var animFrame = null;
	var lastTime;
	var delta = 16;
	var smoothedDelta = 30;
	var playing = false;
	
	var pCount;
	var particles = [];
	var forces = [];
	var createdParticleSpeed;

	var colors = ['#FF1929', '#ff8411', '#fbe52e', '#76E32D', '#49BEE5'];
	var colorSwitchPoints = {};
	var colorCurrentIndex = 0;

	var fireImageCanvas;
	var pImage1 = document.getElementById('pImage1');
	var pImage2 = document.getElementById('pImage2');
	var pImage2s = document.getElementById('pImage2s');
	var pImage3 = document.getElementById('pImage3');
	var pImage3s = document.getElementById('pImage3s');

	var menu = document.getElementById('menu');
	var menuObscure = document.getElementById('menuObscure');
	var menuButton = document.getElementById('MenuButton');
	var clearButton = document.getElementById('ClearButton');
    var menuItems;

	var removeTimeout;

	var currentTheme;
	var prepDraw = function() {};
	var drawParticle = function() {};
	var simulate = function() {};
	var postDrawFunction = function() {};
	
	
	var path = [];
	var pathCreateGap = 30;

    // Could do higher res for retina screens - but it's not really worth it
	//var pixelRatio = window.devicePixelRatio || 1;
	var pixelRatio = 1;
	
	var drawSize = 30;
	var smallDevice = false;



	/**
	* @private
	* @description Creates fire image
	**/
	(function createFireImage() {
		fireImageCanvas = document.createElement('canvas');
		fireImageCanvas.width = 100;
		fireImageCanvas.height = 100;
		var fireImageCtx = fireImageCanvas.getContext('2d');

		var radgrad = fireImageCtx.createRadialGradient(50, 50, 0, 50, 50, 50);
		radgrad.addColorStop(0.1, 'rgba(200, 65, 10, 1)');
		radgrad.addColorStop(1, 'rgba(180, 0, 0, 0)');

		fireImageCtx.fillStyle = radgrad;
		fireImageCtx.fillRect(0,0,100,100);
	})();



	/**
	* @private
	* @param {Event} e
	* @description Resets canvas size
	**/
	var resetCanvas = function(e) {
		canvasWidth = window.innerWidth;
		canvasHeight = window.innerHeight;
		
		canvas.width = canvasWidth * pixelRatio;
		canvas.height = canvasHeight * pixelRatio;
		
		canvas.style.width = canvasWidth + 'px';
		canvas.style.height = canvasHeight + 'px';
		
		ctx.scale(pixelRatio, pixelRatio);
		
		
		ctx.globalCompositeOperation = currentTheme.compositeOperation;
		ctx.translate(-currentTheme.particleSize.x/2, -currentTheme.particleSize.y/2);
		
		canvasSizePowerRatio = (canvasWidth * canvasHeight) * 0.000000474 + 0.627184;
		
		/*
		iPad    - 786432
		iPhone5 - 181760
		iPhone  - 153600
		*/
		smallDevice = (canvasWidth * canvasHeight < 300000) ? true : false;
		
		if (smallDevice) {
			pathCreateGap = 25;
		}
	};
	
	
	
	
	/**
	* @private
	* @param {Number} deltaDeviance
	* @description Executes physics simulation
	**/
	var simulateBasic = function(deltaDeviance) {
		
		var deltaFrictionAdjust = (-0.0201 * deltaDeviance + 1.0205) * friction;
		
		var i = particles.length;
		while (i--) {
			var particle = particles[i];
			
			var ax = 0;
			var ay = 0;
			
			var iF = forces.length;
			while (iF--) {
				var thisForce = forces[iF];
				
				var vectorX = thisForce.x - particle.x;
				var vectorY = thisForce.y - particle.y;
				
				var power =  thisForce.strength  / Math.pow(vectorX*vectorX + vectorY*vectorY + (Math.abs(thisForce.strength) * 3), 1.15);
				
				power *= canvasSizePowerRatio;
				
				power *= deltaDeviance * deltaDeviance;
				
				ax += vectorX * power;
				ay += vectorY * power;
			}
			
			
			particle.vx = (particle.vx + ax) * deltaFrictionAdjust;
			particle.vy = (particle.vy + ay) * deltaFrictionAdjust;
			
			particle.x += particle.vx;
			particle.y += particle.vy;
			
			
			
			particle.correctedSpeed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy) / (smoothedDelta / (1000 / 60)) * 3.5 / canvasSizePowerRatio;
			
			if (particle.x > canvasWidth) {
				particle.x = canvasWidth;
				particle.vx *= -1;
			} else if (particle.x < 0) {
				particle.x = 0;
				particle.vx *= -1;
			}
			
			if (particle.y > canvasHeight) {
				particle.y = canvasHeight;
				particle.vy *= -1;
			} else if (particle.y < 0) {
				particle.y = 0;
				particle.vy *= -1;
			}
			
		}
	};
	
	
	var getCreateParticle = function(thisForce) {
		return {
			x: thisForce.x,
			y: thisForce.y,
			vx: (Math.random() * createdParticleSpeed) - (createdParticleSpeed/2),
			vy: (Math.random() * createdParticleSpeed) - (createdParticleSpeed/2),
			ttl: 60,
			correctedSpeed: Math.random() * 59
		};
	};
	
	
	
	
	
	var checkSpot = function (x, y) {
		var i = path.length;
		while (i--) {
			var spot = path[i];
			
			if (Math.abs(spot.x - x) + Math.abs(spot.y - y) < 20) { // manhattan distance
				return false;
			}
		}
		return true;
	};
	
	
	
	var themes = {
		0: {
			//name: 'Bright Lights',
			countMod: 1,
			compositeOperation: 'lighter',
			particleSize: {
				x: 30,
				y: 30
			},
			init: function() {
				
			},
			prepFunction: function() {
				ctx.clearRect(0, 0, canvasWidth+15, canvasHeight+15);
			},
			drawFunction: function(particle) {
				ctx.drawImage(pImage1, 0, 30 * Math.min(round(particle.correctedSpeed), 59), 30, 30, round(particle.x), round(particle.y), 30, 30);
			},
			simulateFunction: simulateBasic,
			postDrawFunction: function() {
				
			},
			onShowMenu: function() {
				var removeCount = 1;
				if (smoothedDelta > 19) {
					removeCount = 5;
				} else if (smoothedDelta > 17) {
					removeCount =  3;
				}
				
				removeIncrementally(removeCount);
			}
		},
		1: {
			//name: 'Create'
			countMod: 1,
			genParticles: false,
			compositeOperation: 'source-over',
			particleSize: {
			x: drawSize,
			y: drawSize
			},
			init: function() {
				createdParticleSpeed = 11 * canvasSizePowerRatio;
				
				if (drawSize < 30) {
					pImage3 = pImage3s;
				}
			},
			prepFunction: function() {
				ctx.fillStyle = 'rgba(0,0,0,1)';
				ctx.fillRect(0,0,canvasWidth+15, canvasHeight+15);
			},
			drawFunction: function(particle) {
				ctx.globalAlpha = particle.ttl / 60;
				ctx.drawImage(pImage3, 0, drawSize * Math.min(round(particle.correctedSpeed), 59), drawSize, drawSize, round(particle.x), round(particle.y), drawSize, drawSize);
			},
			simulateFunction: function(deltaDeviance) {
				
				var deltaFrictionAdjust = (-0.0201 * deltaDeviance + 1.0205) * friction;
				
				
				var iF = forces.length;
				while (iF--) {
					var thisForce = forces[iF];
					
					particles.push(getCreateParticle(thisForce));
					particles.push(getCreateParticle(thisForce));
					
					if (particles.length > pCount) {
						particles.shift();
					}
				}
				
				
				var i = particles.length;
				while (i--) {
					var particle = particles[i];
					
					particle.ttl -= deltaDeviance;
					if (particle.ttl < 1) {
						particles.splice(i,1);
						continue;
					}
					
					particle.x += particle.vx * deltaDeviance;
					particle.y += particle.vy * deltaDeviance;
					
				}
			},
			postDrawFunction: function() {
				ctx.globalAlpha = 1;
			},
			onShowMenu: function() {
				
			}
		},
		2: {
			//name: 'Trails',
			countMod: 1,
			compositeOperation: 'source-over',
			particleSize: {
				x: 20,
				y: 20
			},
			init: function() {
				
			},
			prepFunction: function() {
				ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
				ctx.fillRect(0, 0, canvas.width+15, canvas.height+15);
			},
			drawFunction: function(particle) {
				ctx.drawImage(pImage2s, 0, 20 * Math.min(round(particle.correctedSpeed), 59), 20, 20, round(particle.x), round(particle.y), 20, 20);
			},
			simulateFunction: simulateBasic,
			postDrawFunction: function() {
				
			},
			onShowMenu: function() {
				var removeCount = 1;
				if (smoothedDelta > 19) {
					removeCount = 5;
				} else if (smoothedDelta > 17) {
					removeCount =  3;
				}
				
				removeIncrementally(removeCount);
			}
		},
		3: {
			//name: 'Swarm',
			countMod: 2.5,
			compositeOperation: 'lighter',
			particleSize: {
				x: 3,
				y: 3
			},
			init: function() {
				
			},
			prepFunction: function() {
				ctx.clearRect(0, 0, canvasWidth+15, canvasHeight+15);
				
				colorCurrentIndex = 0;
				ctx.fillStyle = colors[0];
				
				ctx.globalCompositeOperation = 'lighter';
			},
			drawFunction: function(particle, i) {
				if (i in colorSwitchPoints) {
					colorCurrentIndex++;
					ctx.fillStyle = colors[colorCurrentIndex];
				}
				
				ctx.fillRect(round(particle.x), round(particle.y), 3, 3);
			},
			simulateFunction: simulateBasic,
			postDrawFunction: function() {
				
			},
			onShowMenu: function() {
				var removeCount = 1;
				if (smoothedDelta > 19) {
					removeCount = 5;
				} else if (smoothedDelta > 17) {
					removeCount =  3;
				}
				
				removeIncrementally(removeCount);
			}
		},
		4: {
			//name: 'Fire',
			countMod: 0.8,
			compositeOperation: 'lighter',
			particleSize: {
				x: 100,
				y: 100
			},
			init: function() {
				
			},
			prepFunction: function() {
				ctx.clearRect(0, 0, canvasWidth+50, canvasHeight+50);
			},
			drawFunction: function(particle) {
				ctx.drawImage(fireImageCanvas, particle.x, particle.y);
			},
			simulateFunction: simulateBasic,
			postDrawFunction: function() {
				
			},
			onShowMenu: function() {
				var removeCount = 1;
				if (smoothedDelta > 19) {
					removeCount = 5;
				} else if (smoothedDelta > 17) {
					removeCount =  3;
				}
				
				removeIncrementally(removeCount);
			}
		},
		5: {
			//name: 'Draw'
			countMod: 1,
			genParticles: false,
			compositeOperation: 'lighter',
			particleSize: {
				x: drawSize,
				y: drawSize
			},
			init: function() {
				clearDraw();
				clearButton.className = 'button-clear';
				
				createdParticleSpeed = (canvasWidth * canvasHeight) * 0.00000142 + 0.6815;
				
				if (drawSize < 30) {
					pImage3 = pImage3s;
				}
			},
			prepFunction: function() {
				ctx.fillStyle = 'rgba(0,0,0,1)';
				ctx.globalCompositeOperation = 'source-over';
				ctx.fillRect(0,0,canvasWidth+15, canvasHeight+15);
				ctx.globalCompositeOperation = 'lighter';
			},
			drawFunction: function(particle) {
				ctx.globalAlpha = particle.ttl / 60;
				ctx.drawImage(pImage3, 0, drawSize * Math.min(round(particle.correctedSpeed), 59), drawSize, drawSize, round(particle.x), round(particle.y), drawSize, drawSize);
			},
			simulateFunction: function(deltaDeviance) {
				
				var deltaFrictionAdjust = (-0.0201 * deltaDeviance + 1.0205) * friction;
				
				var iF = forces.length;
				while (iF--) {
					var thisForce = forces[iF];
					
					if (checkSpot(thisForce.x, thisForce.y)) {
						path.push({
							x: thisForce.x,
							y: thisForce.y,
							count: Math.floor(Math.random() * pathCreateGap)
						});
						
						particles.push({
							x: thisForce.x,
							y: thisForce.y,
							vx: (Math.random() * createdParticleSpeed) - (createdParticleSpeed/2),
							vy: (Math.random() * createdParticleSpeed) - (createdParticleSpeed/2),
							ttl: 60,
							correctedSpeed: Math.random() * 59
						});
					}
				}
				
				
				var iP = path.length;
				while (iP--) {
					var pathPart = path[iP];
					
					pathPart.count++;
					
					if (pathPart.count % pathCreateGap === 0) {
						particles.push({
							x: pathPart.x,
							y: pathPart.y,
							vx: (Math.random() * createdParticleSpeed) - (createdParticleSpeed/2),
							vy: (Math.random() * createdParticleSpeed) - (createdParticleSpeed/2),
							ttl: 60,
							correctedSpeed: Math.random() * 59
						});
					}
				}
				
				if (particles.length > pCount) {
					particles.shift();
				}
				
				
				var i = particles.length;
				while (i--) {
					var particle = particles[i];
					
					particle.ttl -= deltaDeviance;
					if (particle.ttl < 1) {
						particles.splice(i,1);
						continue;
					}
					
					particle.x += particle.vx * deltaDeviance;
					particle.y += particle.vy * deltaDeviance;
					
				}
				
			},
			postDrawFunction: function() {
				ctx.globalAlpha = 1;
			},
			onShowMenu: function() {
				clearButton.className = 'button-clear hidden';
			}
		}
	};



	/**
	* @private
	* @description Adds particles based on canvas size, starts animation
	**/
	var init = function(theme) {
		currentTheme = themes[theme];
		
		resetCanvas();
		
		
		drawSize = (smallDevice) ? 15 : 30;
		
		
		prepDraw = currentTheme.prepFunction;
		drawParticle = currentTheme.drawFunction;
		simulate = currentTheme.simulateFunction;
		postDrawFunction = currentTheme.postDrawFunction;
		
		
		pCount = ((canvasWidth * canvasHeight) / 1800) + 100;
		//var pCount = canvasWidth * canvasHeight * 0.000682;
		pCount *= currentTheme.countMod;
		pCount = round(pCount);
		
		if (currentTheme.genParticles !== false) {
			
			while (pCount--) {
				particles.push({
					x: Math.random() * canvasWidth,
					y: Math.random() * canvasHeight,
					vx: 0,
					vy: 0
				});
			}
		
			colorInit(particles.length);
		}
		
		currentTheme.init();
		
		
		lastTime = new Date().getTime() - 16;
		playing = true;
		go();
		
	};


	var play = function() {
		lastTime = new Date().getTime() - 16;
		go();
		playing = true;
	};
	var pause = function() {
		window.cancelAnimationFrame(animFrame);
		playing = false;
	};


	/**
	* @private
	* @description Stops animation, removes particles, restarts
	**/
	var reset = function(themeIndex) {
		if (playing) {
			window.cancelAnimationFrame(animFrame);
			playing = false;
		}
		clearTimeout(removeTimeout);
		particles = [];
		
		init(themeIndex);
	};


	/**
	* @private
	* @param {number} removeCount
	* @description Removes given amount of particles, goes again
	**/
	var removeIncrementally = function(removeCount) {
		for (var i=0; i<removeCount; i++) {
			particles.pop();
		}
		if (particles.length > 0) {
			removeTimeout = setTimeout(function() {
				removeIncrementally(removeCount);
			}, 0);
		}
	};



	/**
	* @private
	* @param {Object} cfg
	* @description Force class
	**/
	var force = function(cfg) {
		this.x = cfg.x;
		this.y = cfg.y;
		this.strength = cfg.strength;
		if (cfg.id) {
			this.id = cfg.id;
		}
	};




	/**
	* @private
	* @param {Number} particleCount
	* @description Sets up colorSwitchPoints based on amount of colors
	**/
	var colorInit = function(particleCount) {
		colorCurrentIndex = 0;
		
		var colorSwitchAmount = Math.round(particleCount / colors.length);
		
		colorSwitchPoints = {};
		
		var i = colors.length;
		while (i--) {
			colorSwitchPoints[colorSwitchAmount * i] = '';
		}
		
		ctx.fillStyle = colors[0];
	};
	
	
	var clearDraw = function() {
		path = [];
	};
	
	
	
	
	/**
	* @private
	* @description Draws particles to canvas
	**/
	var draw = function() {
		
		prepDraw();

		var i = particles.length;
		while (i--) {
			var particle = particles[i];

			drawParticle(particle, i);
		}
		
		postDrawFunction();
		
		// DEBUG - draw framerate
		//ctx.fillStyle = 'rgb(255,255,255)';
		//ctx.fillText((1000/smoothedDelta).toFixed(0) + ' (' + particles.length + ')', 20, 70);
	};

	var _smoothing = 0.25;
	var _smooth = function(newVal, oldVal) {
		return (newVal * _smoothing) + (oldVal * (1.0 - _smoothing));
	};


	/**
	* @private
	* @description Animation loop
	**/
	var go = function() {
		var time = new Date().getTime();
		delta = time - lastTime;
		
		
		if (delta > 250) {
			delta = 45;
		}/* else if (smoothedDelta > 45) {
			particles = particles.slice(0,-5);
			//particles.splice(Math.floor(Math.random() * particles.length), 5);
			colorInit(particles.length);
		}*/
		
		smoothedDelta = _smooth(delta, smoothedDelta);
		
		lastTime = time;
		
		simulate(delta / (1000 / 60));
		draw();
		
		
		animFrame = window.requestAnimationFrame(go);
	};




	/**
	* @private
	* @param {number} num
	* @return {number} Rounded number.
	* @description Faster substitute for Math.round - only for non-negative numbers
	**/
	var round = function(num) {
		return ~~ (0.5 + num);
	};




	var touchMoveEvent = function(ev) {
		ev.preventDefault();
		
		var forcesI = forces.length;
		while (forcesI--) {
			var thisForce = forces[forcesI];
			if (ev.pointerId === thisForce.id) {
				thisForce.x = ev.clientX;
				thisForce.y = ev.clientY;
				continue;
			}
		}
	};

	var touchUpEvent = function(ev) {
		ev.preventDefault();
		
		var forcesI = forces.length;
		while (forcesI--) {
			var thisForce = forces[forcesI];
			
			if (!thisForce.id || ev.pointerId === thisForce.id) {
				forces.splice(forcesI, 1);
				continue;
			}
		}
	};

	var touchDownEvent = function(ev) {
        forces.push(new force({
			x: ev.clientX,
			y: ev.clientY,
			strength: 600,
			id: ev.pointerId,
			touch: ev
		}));
	};

	var touchCancelEvent = function(ev) {
		forces = [];
	};









	/*** MENU FUNCTIONS ***/


	/**
	* @private
	* @description Adds listeners to menu
	**/
	var initMenu = function(cfg) {
		/*
		menuButton.innerHTML = cfg.menu;
		
		if (cfg.font) {
			menuButton.style.fontSize = cfg.font + 'px';
		}
		*/
		
		var menuHtml = '';
		for (var i in themes) {
			menuHtml += '<li><a href="javascript:;" onclick="BrightLights.reset(' + i + ');BrightLights.hideMenu()">' + cfg[i] + '</a></li>';
		}
		
		menu.innerHTML = menuHtml;
		
		menuItems = menu.querySelectorAll('li');
		
		var anchors = menu.querySelectorAll('a');
		var anchorsLength = anchors.length;
		
		while (anchorsLength--) {
			new FastClick(anchors[anchorsLength]);
		}
		new FastClick(menuButton);
		new FastClick(clearButton);
	};

    /**
	 * @private
	 * @description Sets the transform value of the menu items, so that
	 * 				they're just off-screen
	 **/
    var setMenuPositions = function() {
        var pos = ((window.innerWidth - 300) / 2) + 300;
        
        for (var i=0,iLen=menuItems.length; i<iLen; i++) {
            var item = menuItems[i];
            
            item.style.webkitTransform = 'translate3d(' + pos + 'px, 0, 0)';
            item.style.transform = 'translate3d(' + pos + 'px, 0, 0)';
            
            pos = -pos;
        }
    };

	/**
	* @private
	* @description Shows the menu, calls function to remove particles
	**/
	var showMenu = function() {
		setMenuPositions();
		
		window.requestAnimationFrame(function() {
			menu.className = 'active';
			currentTheme.onShowMenu();
		});
		
		menuObscure.className = 'active';
		menuButton.className = 'button-menu hidden';
	};

	/**
	* @private
	* @description Hides the menu
	**/
	var hideMenu = function() {
		setMenuPositions();
		
		menu.className = 'menu-out';
		window.setTimeout(function() {
			menu.className = '';
		}, 400);
		
		menuObscure.className = '';
		menuButton.className = 'button-menu';
	};






	(function kickstart() {
		window.addEventListener('resize', resetCanvas, false);
		window.addEventListener('orientationchange', resetCanvas, false);
		window.addEventListener('touchmove', function(ev) { ev.preventDefault(); });
		
		canvas.addEventListener('pointerdown', touchDownEvent);
		canvas.addEventListener('pointermove', touchMoveEvent);
		canvas.addEventListener('pointerup', touchUpEvent);
		canvas.addEventListener('pointercancel', touchCancelEvent);
		
		currentTheme = themes[0];
		
		//setTimeout(function() { init(0); }, 10);
		init(0);
	})();




	return {
		initMenu: initMenu,
		showMenu: showMenu,
		hideMenu: hideMenu,
		reset: reset,
		clearDraw: clearDraw
	};

})();
