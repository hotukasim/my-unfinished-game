
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let x = 100;
let y = 100;

function drawPlayer() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "lime";
  ctx.fillRect(x, y, 40, 40);
}

document.addEventListener("keydown", function(event) {
  if (event.key === "ArrowRight") {
    x = x + 10;
  }

  if (event.key === "ArrowLeft") {
    x = x - 10;
  }

  if (event.key === "ArrowDown") {
    y = y + 10;
  }

  if (event.key === "ArrowUp") {
    y = y - 10;
  }
  x = Math.max(0, Math.min(x, canvas.width - 40));
  y = Math.max(0, Math.min(y, canvas.height - 40));
  drawPlayer();
});

drawPlayer();
