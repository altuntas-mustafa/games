import React, { useEffect, useRef } from 'react';

const PongGame = () => {
  const canvasRef = useRef(null);
  const WIDTH = 700;
  const HEIGHT = 600;
  const pi = Math.PI;
  const UpArrow = 38;
  const DownArrow = 40;
  let ctx;
  let keystate;
  let player;
  let ai;
  let ball;
  let playerScore = 0;
  let aiScore = 0;

  useEffect(() => {
    const canvas = canvasRef.current;
    ctx = canvas.getContext('2d');
    keystate = {};

    const keyDownHandler = (event) => {
      keystate[event.keyCode] = true;
    };

    const keyUpHandler = (event) => {
      delete keystate[event.keyCode];
    };

    document.addEventListener('keydown', keyDownHandler);
    document.addEventListener('keyup', keyUpHandler);

    init();
    gameLoop();

    return () => {
      document.removeEventListener('keydown', keyDownHandler);
      document.removeEventListener('keyup', keyUpHandler);
    };
  }, []);

  const init = () => {
    player = {
      x: null,
      y: null,
      width: 20,
      height: 100,

      update: function () {
        if (keystate[UpArrow]) this.y -= 7;
        if (keystate[DownArrow]) this.y += 7;
        this.y = Math.max(Math.min(this.y, HEIGHT - this.height), 0);
      },

      draw: function () {
        ctx.fillRect(this.x, this.y, this.width, this.height);
      },
    };

    ai = {
      x: null,
      y: null,
      width: 20,
      height: 100,

      update: function () {
        var desty = ball.y - (this.height - ball.side) * 0.5;
        this.y += (desty - this.y) * 0.1;
        this.y = Math.max(Math.min(this.y, HEIGHT - this.height), 0);
      },

      draw: function () {
        ctx.fillRect(this.x, this.y, this.width, this.height);
      },
    };

    ball = {
      x: null,
      y: null,
      vel: null,
      side: 20,
      // you can modify the game speed 
      speed: 10,

      serve: function (side) {
        if (playerScore < 5 && aiScore < 5) {
          var r = Math.random();
          this.x = side === 1 ? player.x + player.width : ai.x - this.side;
          this.y = (HEIGHT - this.side) * r;
          var phi = 0.1 * pi * (1 - 2 * r);
          this.vel = {
            x: side * this.speed * Math.cos(phi),
            y: this.speed * Math.sin(phi),
          };
        }
      },

      update: function () {
        this.x += this.vel.x;
        this.y += this.vel.y;

        if (0 > this.y || this.y + this.side > HEIGHT) {
          var offset = this.vel.y < 0 ? 0 - this.y : HEIGHT - (this.y + this.side);
          this.y += 2 * offset;
          this.vel.y *= -1;
        }

        var AABBIntersect = function (ax, ay, aw, ah, bx, by, bw, bh) {
          return ax < bx + bw && ay < by + bh && bx < ax + aw && by < ay + ah;
        };

        var pdle = this.vel.x < 0 ? player : ai;
        if (
          AABBIntersect(pdle.x, pdle.y, pdle.width, pdle.height, this.x, this.y, this.side, this.side)
        ) {
          this.x = pdle === player ? player.x + player.width : ai.x - this.side;
          var n = (this.y + this.side - pdle.y) / (pdle.height + this.side);
          var phi = 0.25 * pi * (2 * n - 1);
          var smash = Math.abs(phi) > 0.2 * pi ? 1.5 : 1;
          this.vel.x = smash * (pdle === player ? 1 : -1) * this.speed * Math.cos(phi);
          this.vel.y = smash * this.speed * Math.sin(phi);
        }

        if (0 > this.x + this.side || this.x > WIDTH) {
          if (this.x > WIDTH) {
            playerScore++;
          } else {
            aiScore++;
          }

          checkScore();
          // you can modify the game end score 
          if (playerScore === 5 || aiScore === 5) {
            showWinner();
          } else {
            this.serve(pdle === player ? 1 : -1);
          }
        }
      },

      draw: function () {
        ctx.fillRect(this.x, this.y, this.side, this.side);
      },
    };

    player.x = player.width;
    player.y = (HEIGHT - player.height) / 2;

    ai.x = WIDTH - (player.width + ai.width);
    ai.y = (HEIGHT - ai.height) / 2;

    ball.serve(1);
  };

  const update = () => {
    ball.update();
    player.update();
    ai.update();
    checkScore();
  };

  const draw = () => {
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.save();
    ctx.fillStyle = '#fff';

    ball.draw();
    player.draw();
    ai.draw();

    var w = 4;
    var x = (WIDTH - w) * 0.5;
    var y = 0;
    var step = HEIGHT / 20;

    while (y < HEIGHT) {
      ctx.fillRect(x, y + step * 0.25, w, step * 0.5);
      y += step;
    }

    ctx.font = '30px Arial';
    ctx.fillText(`Player: ${playerScore}`, WIDTH / 2 - 100, 50);
    ctx.fillText(`AI: ${aiScore}`, WIDTH / 2 + 50, 50);

    ctx.restore();
  };

  const checkScore = () => {
    if (playerScore === 5 || aiScore === 5) {
      showWinner();
    }
  };

  const resetGame = () => {
    playerScore = 0;
    aiScore = 0;
    init();
  };

  const showWinner = () => {
    if (playerScore === 5) {
      alert('Player wins!');
    } else if (aiScore === 5) {
      alert('AI wins!');
    }
    resetGame();
  };

  const gameLoop = () => {
    update();
    draw();

    if (playerScore < 5 && aiScore < 5) {
      window.requestAnimationFrame(gameLoop);
    }
  };

  return (
    <div>
      <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} />
    </div>
  );
};

export default PongGame;
