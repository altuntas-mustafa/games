import React, { useEffect, useRef, useState } from "react";

const SimpleSnakeGame = () => {
  const COLS = 26;
  const ROWS = 26;

  const EMPTY = 0;
  const SNAKE = 1;
  const FRUIT = 2;

  const LEFT = 0;
  const UP = 1;
  const RIGHT = 2;
  const DOWN = 3;

  const KEY_LEFT = 37;
  const KEY_UP = 38;
  const KEY_RIGHT = 39;
  const KEY_DOWN = 40;

  let canvas;
  let ctx;
  let keystate;
  let frames;
  let score;
  let grid;
  let snake;

  const [isGameRunning, setIsGameRunning] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!isGameRunning) {
      setIsGameRunning(true);
    }
  }, []);

  useEffect(() => {
    if (isGameRunning) {
      initializeGame();
      gameLoop();
    }
  }, [isGameRunning]);

  const initializeGame = () => {
    canvas = canvasRef.current;
    ctx = canvas.getContext("2d");

    ctx.font = "12px Helvetica";

    frames = 0;
    keystate = {};
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    init();
  };

  const handleKeyDown = (evt) => {
    keystate[evt.keyCode] = true;
  };

  const handleKeyUp = (evt) => {
    delete keystate[evt.keyCode];
  };

  const init = () => {
    score = 0;

    grid = {
      width: null,
      height: null,
      _grid: null,

      init: function (d, c, r) {
        this.width = c;
        this.height = r;

        this._grid = [];
        for (let x = 0; x < c; x++) {
          this._grid.push([]);
          for (let y = 0; y < r; y++) {
            this._grid[x].push(d);
          }
        }
      },

      set: function (val, x, y) {
        this._grid[x][y] = val;
      },

      get: function (x, y) {
        return this._grid[x][y];
      },
    };

    snake = {
      direction: null,
      last: null,
      _queue: null,

      init: function (d, x, y) {
        this.direction = d;

        this._queue = [];
        this.insert(x, y);
      },

      insert: function (x, y) {
        this._queue.unshift({ x: x, y: y });
        this.last = this._queue[0];
      },

      remove: function () {
        return this._queue.pop();
      },
    };

    grid.init(EMPTY, COLS, ROWS);

    const sp = { x: Math.floor(COLS / 2), y: ROWS - 1 };
    snake.init(UP, sp.x, sp.y);
    grid.set(SNAKE, sp.x, sp.y);

    setFood();
  };

  const setFood = () => {
    const empty = [];
    for (let x = 0; x < grid.width; x++) {
      for (let y = 0; y < grid.height; y++) {
        if (grid.get(x, y) === EMPTY) {
          empty.push({ x: x, y: y });
        }
      }
    }
    const randpos = empty[Math.floor(Math.random() * empty.length)];
    grid.set(FRUIT, randpos.x, randpos.y);
  };

  const gameLoop = () => {
    update();
    draw();
    window.requestAnimationFrame(gameLoop);
  };

  const update = () => {
    frames++;

    if (keystate[KEY_LEFT] && snake.direction !== RIGHT) {
      snake.direction = LEFT;
    }
    if (keystate[KEY_UP] && snake.direction !== DOWN) {
      snake.direction = UP;
    }
    if (keystate[KEY_RIGHT] && snake.direction !== LEFT) {
      snake.direction = RIGHT;
    }
    if (keystate[KEY_DOWN] && snake.direction !== UP) {
      snake.direction = DOWN;
    }

    if (frames % 5 === 0) {
      let nx = snake.last.x;
      let ny = snake.last.y;

      switch (snake.direction) {
        case LEFT:
          nx = (nx - 1 + grid.width) % grid.width; // Wrap around to the right side
          break;
        case UP:
          ny = (ny - 1 + grid.height) % grid.height; // Wrap around to the bottom side
          break;
        case RIGHT:
          nx = (nx + 1) % grid.width; // Wrap around to the left side
          break;
        case DOWN:
          ny = (ny + 1) % grid.height; // Wrap around to the top side
          break;
      }

      if (grid.get(nx, ny) === SNAKE) {
        return init();
      }

      if (grid.get(nx, ny) === FRUIT) {
        score++;
        setFood();
      } else {
        const tail = snake.remove();
        grid.set(EMPTY, tail.x, tail.y);
      }

      grid.set(SNAKE, nx, ny);
      snake.insert(nx, ny);
    }
  };

  const draw = () => {
    const tw = canvas.width / grid.width;
    const th = canvas.height / grid.height;
  
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    // Set black background color
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  
    for (let x = 0; x < grid.width; x++) {
      for (let y = 0; y < grid.height; y++) {
        const squareX = x * tw;
        const squareY = y * th;
  
        // Set border color
        ctx.strokeStyle = '#00aaff'; // Light blue border color
        ctx.lineWidth = 1;
  
        switch (grid.get(x, y)) {
          case SNAKE:
            // Calculate the snake body part gradient colors
            const gradient = ctx.createLinearGradient(squareX, squareY, squareX + tw, squareY + th);
            gradient.addColorStop(0, '#008000'); // Dark green
            gradient.addColorStop(0.5, '#00ff00'); // Light green
            gradient.addColorStop(1, '#008000'); // Dark green
  
            // Draw a rounded rectangle for the snake body part
            const cornerRadius = 5;
            ctx.fillStyle = gradient;
            ctx.lineJoin = 'round';
            ctx.fillRect(squareX, squareY, tw, th);
            ctx.strokeRect(squareX, squareY, tw, th);
            ctx.fillStyle = '#000';
            ctx.fillRect(squareX + cornerRadius, squareY + cornerRadius, tw - cornerRadius * 2, th - cornerRadius * 2);
  
            if (x === snake._queue[0].x && y === snake._queue[0].y) {
              // Draw the snake head with a triangular shape
              const headCenterX = squareX + tw / 2;
              const headCenterY = squareY + th / 2;
              const headSize = Math.min(tw, th) * 0.8;
  
              ctx.fillStyle = '#008000'; // Dark green snake head color
              ctx.strokeStyle = '#00aaff'; // Light blue border color
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.moveTo(headCenterX, headCenterY - headSize / 2);
              ctx.lineTo(headCenterX + headSize / 2, headCenterY + headSize / 2);
              ctx.lineTo(headCenterX - headSize / 2, headCenterY + headSize / 2);
              ctx.closePath();
              ctx.fill();
              ctx.stroke();
            }
            break;
          case FRUIT:
            // Draw a circular fruit shape
            const radius = tw / 2;
            const centerX = squareX + radius;
            const centerY = squareY + radius;
  
            ctx.fillStyle = '#ff0000'; // Red fruit color
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
            break;
          default:
            // Set empty cell color
            ctx.fillStyle = '#222'; // Dark gray empty cell color
            ctx.fillRect(squareX, squareY, tw, th);
            ctx.strokeRect(squareX, squareY, tw, th);
            break;
        }
      }
    }
  
    ctx.fillStyle = '#fff';
    ctx.fillText('SCORE: ' + score, 10, canvas.height - 10);
  };
  
  return (
    <canvas
      ref={canvasRef}
      width={COLS * 20}
      height={ROWS * 20}
      style={{ border: "1px solid #000" }}
    />
  );
};

export default SimpleSnakeGame;
