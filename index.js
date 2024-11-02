const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

class Conecta4 {
  constructor() {
    this.FILAS = 6;
    this.COLUMNAS = 7;
    this.VACIO = 0;
    this.J1 = 1;
    this.J2 = 2;

    this.VACIO_EMOJI = "⬛";
    this.EJ1 = "🔴";
    this.EJ2 = "🟡";

    this.tablero = Array.from({ length: this.FILAS }, () => Array(this.COLUMNAS).fill(this.VACIO));
    this.jugadorActual = this.J1;
    this.ganador = null;
  }

  soltarPieza(columna) {
    if (columna < 0 || columna >= this.COLUMNAS || this.tablero[0][columna] !== this.VACIO) {
      return false;
    }

    for (let fila = this.FILAS - 1; fila >= 0; fila--) {
      if (this.tablero[fila][columna] === this.VACIO) {
        this.tablero[fila][columna] = this.jugadorActual;
        if (this.verificarGanador(fila, columna)) {
          this.ganador = this.jugadorActual;
        }
        this.jugadorActual = this.jugadorActual === this.J1 ? this.J2 : this.J1;
        return true;
      }
    }
    return false;
  }

  verificarGanador(fila, columna) {
    const direcciones = [
      [1, 0], [0, 1], [1, 1], [1, -1]
    ];

    for (const [df, dc] of direcciones) {
      let contador = 1;
      for (let i = 1; i < 4; i++) {
        const nuevaFila = fila + df * i;
        const nuevaColumna = columna + dc * i;
        if (nuevaFila >= 0 && nuevaFila < this.FILAS && nuevaColumna >= 0 && nuevaColumna < this.COLUMNAS &&
            this.tablero[nuevaFila][nuevaColumna] === this.jugadorActual) {
          contador++;
        } else {
          break;
        }
      }
      for (let i = 1; i < 4; i++) {
        const nuevaFila = fila - df * i;
        const nuevaColumna = columna - dc * i;
        if (nuevaFila >= 0 && nuevaFila < this.FILAS && nuevaColumna >= 0 && nuevaColumna < this.COLUMNAS &&
            this.tablero[nuevaFila][nuevaColumna] === this.jugadorActual) {
          contador++;
        } else {
          break;
        }
      }
      if (contador >= 4) {
        return true;
      }
    }
    return false;
  }

  obtenerTableroConEmojis() {
    return this.tablero.map(fila =>
      fila.map(celda => 
        celda === this.VACIO ? this.VACIO_EMOJI : 
        celda === this.JUGADOR1 ? this.EJ1 : 
        this.EJ2
      ).join('')
    ).join('\n');
  }
}

const juegos = {};

const fecha = Date.now();
app.get('/', (req, res) => {
  const uptime = ((Date.now() - fecha) / 1000).toFixed(0) + "s";
  res.json({ uptime });
});

app.post('/crear', (req, res) => {
  const idJuego = Date.now().toString();
  juegos[idJuego] = new Conecta4();
  res.json({ idJuego });
});

app.post('/drop/:idJuego', (req, res) => {
  const { idJuego } = req.params;
  const { jugador, columna } = req.body;
  const juego = juegos[idJuego];

  if (!juego) {
    return res.status(404).json({ error: "Juego no encontrado" });
  }
  if (juego.ganador) {
    return res.status(400).json({ error: "El juego ya terminó" });
  }
  if (juego.jugadorActual !== jugador) {
    return res.status(400).json({ error: "No es el turno de este jugador" });
  }
  if (!juego.soltarPieza(columna)) {
    return res.status(400).json({ error: "Movimiento inválido" });
  }

  res.json({
    tablero: juego.obtenerTableroConEmojis(),
    turno: juego.jugadorActual,
    ganador: juego.ganador
  });
});

app.get('/game/:idJuego', (req, res) => {
  const { idJuego } = req.params;
  const juego = juegos[idJuego];

  if (!juego) {
    return res.status(404).json({ error: "Juego no encontrado" });
  }

  res.json({
    tablero: juego.obtenerTableroConEmojis(),
    turno: juego.jugadorActual,
    ganador: juego.ganador
  });
});

app.listen(PORT, () => {
  console.log(`Ya wey`);
});
