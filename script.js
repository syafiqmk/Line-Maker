const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
const button = document.getElementById('showCoordinates');

let lines = [
    { startX: 0, startY: 0, endX: 0, endY: 0, color: 'red' },  // Garis pertama
    { startX: 0, startY: 0, endX: 0, endY: 0, color: 'blue' } // Garis kedua
];

let isDrawing = false;         // Menandakan apakah sedang menggambar
let activeLineIndex = null;    // Menandakan garis mana yang aktif untuk diedit
let activePoint = null;        // Menandakan titik mana yang sedang diedit
let offsetX, offsetY;          // Offset untuk drag and drop

// Fungsi untuk menggambar garis
function drawLines() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Hapus kanvas
    for (const line of lines) {
        ctx.strokeStyle = line.color;
        ctx.beginPath();
        ctx.moveTo(line.startX, line.startY);
        ctx.lineTo(line.endX, line.endY);
        ctx.stroke();
        
        // Menggambar titik pada awal dan akhir garis
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(line.startX, line.startY, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(line.endX, line.endY, 5, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Fungsi untuk mendapatkan posisi mouse relatif terhadap kanvas
function getMousePos(canvas, event) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}

// Mengatur titik awal dan akhir untuk garis yang akan digambar
canvas.addEventListener('click', (e) => {
    const { x, y } = getMousePos(canvas, e);
    
    if (activePoint) {
        // Mengubah titik yang aktif
        if (activePoint === 'start') {
            lines[activeLineIndex].startX = x;
            lines[activeLineIndex].startY = y;
        } else if (activePoint === 'end') {
            lines[activeLineIndex].endX = x;
            lines[activeLineIndex].endY = y;
        }
        drawLines(); // Gambar ulang garis
        activePoint = null; // Reset titik aktif
    } else {
        // Mengatur titik awal untuk garis yang aktif
        if (isDrawing && activeLineIndex !== null) {
            // Set titik akhir untuk garis aktif
            lines[activeLineIndex].endX = x;
            lines[activeLineIndex].endY = y;
            activeLineIndex = null; // Reset indeks
        } else {
            // Mengatur titik awal untuk garis
            if (lines[0].startX === 0 && lines[0].startY === 0) {
                lines[0].startX = x;
                lines[0].startY = y; // Set titik awal garis pertama
                isDrawing = true; // Menandakan pengguna sedang menggambar
                activeLineIndex = 0; // Garis pertama aktif
            } else if (lines[1].startX === 0 && lines[1].startY === 0) {
                lines[1].startX = x;
                lines[1].startY = y; // Set titik awal garis kedua
                isDrawing = true; // Menandakan pengguna sedang menggambar
                activeLineIndex = 1; // Garis kedua aktif
            }
        }
        drawLines(); // Gambar garis setelah mengatur titik
    }
});

// Fungsi untuk menampilkan koordinat di jendela alert
button.addEventListener('click', () => {
    alert(
        `Koordinat Garis Pertama: [[${lines[0].startX}, ${lines[0].startY}], [${lines[0].endX}, ${lines[0].endY}]],` +
        `  Koordinat Garis Kedua: [[${lines[1].startX}, ${lines[1].startY}], [${lines[1].endX}, ${lines[1].endY}]]`
    );
});

// Fungsi untuk menangani klik ganda pada titik untuk mengubahnya
canvas.addEventListener('dblclick', (e) => {
    const { x, y } = getMousePos(canvas, e);
    
    // Memeriksa apakah klik ganda berada dekat dengan titik awal atau akhir
    for (let i = 0; i < lines.length; i++) {
        if (isPointNear(x, y, lines[i].startX, lines[i].startY)) {
            activeLineIndex = i; // Menetapkan garis yang akan diedit
            activePoint = 'start'; // Titik aktif adalah titik awal
            return;
        } else if (isPointNear(x, y, lines[i].endX, lines[i].endY)) {
            activeLineIndex = i; // Menetapkan garis yang akan diedit
            activePoint = 'end'; // Titik aktif adalah titik akhir
            return;
        }
    }
});

// Event listener untuk memulai drag garis
canvas.addEventListener('mousedown', (e) => {
    const { x, y } = getMousePos(canvas, e);
    
    // Memeriksa apakah titik mouse berada dekat dengan titik awal atau akhir garis
    for (let i = 0; i < lines.length; i++) {
        if (isPointNear(x, y, lines[i].startX, lines[i].startY)) {
            activeLineIndex = i;
            activePoint = 'start';
            offsetX = lines[i].startX - x;
            offsetY = lines[i].startY - y;
            return;
        } else if (isPointNear(x, y, lines[i].endX, lines[i].endY)) {
            activeLineIndex = i;
            activePoint = 'end';
            offsetX = lines[i].endX - x;
            offsetY = lines[i].endY - y;
            return;
        }
    }
});

// Event listener untuk drag garis
canvas.addEventListener('mousemove', (e) => {
    if (activeLineIndex !== null && activePoint) {
        const { x, y } = getMousePos(canvas, e);
        if (activePoint === 'start') {
            lines[activeLineIndex].startX = x + offsetX;
            lines[activeLineIndex].startY = y + offsetY;
        } else if (activePoint === 'end') {
            lines[activeLineIndex].endX = x + offsetX;
            lines[activeLineIndex].endY = y + offsetY;
        }
        drawLines(); // Gambar ulang garis saat dragging
    }
});

// Event listener untuk mengakhiri drag garis
canvas.addEventListener('mouseup', () => {
    activeLineIndex = null; // Reset indeks garis aktif
    activePoint = null; // Reset titik aktif
});

// Fungsi untuk memeriksa apakah titik mendekati titik yang ada
function isPointNear(x1, y1, x2, y2, tolerance = 5) {
    return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2) < tolerance;
}
