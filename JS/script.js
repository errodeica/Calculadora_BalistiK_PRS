// script.js

// Añade un manejador de eventos al campo de subida de imagen
document.getElementById('reticleImage').addEventListener('change', handleImageUpload);

// Configura el canvas para la retícula y obtiene el contexto de dibujo
const reticleCanvas = document.getElementById('reticleCanvas');
const reticleCtx = reticleCanvas.getContext('2d');
let reticleImage = new Image();

// Maneja la subida de la imagen de la retícula
function handleImageUpload(event) {
    const file = event.target.files[0]; // Obtiene el archivo seleccionado
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            reticleImage.src = e.target.result; // Establece la fuente de la imagen
            reticleImage.onload = function() {
                drawReticle(); // Dibuja la retícula una vez cargada la imagen
            }
        };
        reader.readAsDataURL(file); // Lee el archivo como URL de datos
    }
}

// Dibuja la imagen de la retícula en el canvas
function drawReticle() {
    reticleCtx.clearRect(0, 0, reticleCanvas.width, reticleCanvas.height); // Limpia el canvas
    reticleCtx.drawImage(reticleImage, 0, 0, reticleCanvas.width, reticleCanvas.height); // Dibuja la imagen
}

// Dibuja la trayectoria de la bala en el canvas
function drawTrajectory(angleRad, velocity, time) {
    const g = 9.81; // Aceleración debida a la gravedad
    const trajectoryData = []; // Arreglo para almacenar los datos de la trayectoria

    for (let t = 0; t <= time; t += 0.1) {
        const x = velocity * Math.cos(angleRad) * t; // Posición horizontal
        const y = velocity * Math.sin(angleRad) * t - 0.5 * g * t * t; // Posición vertical
        trajectoryData.push({ x, y }); // Añade el punto al arreglo
    }

    reticleCtx.beginPath();
    reticleCtx.strokeStyle = 'red'; // Color de la trayectoria
    reticleCtx.lineWidth = 2; // Ancho de la línea

    trajectoryData.forEach((point, index) => {
        if (index === 0) {
            reticleCtx.moveTo(point.x, reticleCanvas.height - point.y); // Mueve al primer punto
        } else {
            reticleCtx.lineTo(point.x, reticleCanvas.height - point.y); // Traza la línea
        }
    });

    reticleCtx.stroke(); // Dibuja la trayectoria
}

// Calcula los resultados balísticos basados en los datos ingresados
function calculateBallistics() {
    const velocity = parseFloat(document.getElementById('velocity').value);
    const angle = parseFloat(document.getElementById('angle').value);
    const distance = parseFloat(document.getElementById('distance').value);
    const wind = parseFloat(document.getElementById('wind').value);
    const temperature = parseFloat(document.getElementById('temperature').value);
    const humidity = parseFloat(document.getElementById('humidity').value);
    const bulletWeight = parseFloat(document.getElementById('bulletWeight').value);
    const muzzleVelocity = parseFloat(document.getElementById('muzzleVelocity').value);
    const bc = parseFloat(document.getElementById('bc').value);
    const altitude = parseFloat(document.getElementById('altitude').value);
    const pressure = parseFloat(document.getElementById('pressure').value);
    const energy = parseFloat(document.getElementById('energy').value);

    // Verifica si todos los valores son válidos
    if (isNaN(velocity) || isNaN(angle) || isNaN(distance) || isNaN(wind) || isNaN(temperature) || isNaN(humidity) || isNaN(bulletWeight) || isNaN(muzzleVelocity) || isNaN(bc) || isNaN(altitude) || isNaN(pressure) || isNaN(energy)) {
        document.getElementById('result').innerHTML = 'Por favor, ingrese valores válidos.';
        return; // Sale de la función si hay errores
    }

    const angleRad = angle * (Math.PI / 180); // Convierte el ángulo a radianes
    const R = 287.05; // Constante de gas
    const temperatureK = temperature + 273.15; // Convierte la temperatura a Kelvin
    const density = (pressure * 100) / (R * temperatureK); // Calcula la densidad del aire

    const g = 9.81; // Aceleración debida a la gravedad
    const time = distance / (velocity * Math.cos(angleRad)); // Tiempo de vuelo
    const drop = 0.5 * g * Math.pow(time, 2); // Caída vertical

    const windDrift = wind * time; // Desplazamiento por viento
    const dragFactor = bc * (density / 1.225); // Factor de arrastre ajustado
    const adjustedVelocity = muzzleVelocity * Math.exp(-dragFactor * time); // Velocidad ajustada
    const adjustedDrop = drop / Math.exp(-dragFactor * time); // Caída ajustada

    const altitudeAdjustment = altitude / 1000 * 0.3; // Ajuste por altitud
    const projectileTemperatureFactor = 1 + (temperature - 20) / 100; // Factor de temperatura del proyectil

    const finalVelocity = adjustedVelocity * projectileTemperatureFactor; // Velocidad final

    // Calcula la velocidad a una distancia dada
    function calculateSpeedAtDistance(velocity, angleRad, distance) {
        const timeAtDistance = distance / (velocity * Math.cos(angleRad));
        return velocity * Math.exp(-dragFactor * timeAtDistance);
    }

    const speedAt50m = calculateSpeedAtDistance(velocity, angleRad, 50); // Velocidad a 50 metros
    const speedAt100m = calculateSpeedAtDistance(velocity, angleRad, 100); // Velocidad a 100 metros

    const coriolisEffect = 2 * 7.2921e-5 * Math.sin(angleRad) * time; // Efecto Coriolis
    const gyroscopicDrift = 0.1 * bulletWeight * time; // Deriva giroscópica
    const clicksMilRad = (adjustedDrop * (1 - altitudeAdjustment)) / 0.01; // Corrección en milirradianos

    // Muestra los resultados en el elemento 'result'
    const result = document.getElementById('result');
    result.innerHTML = `
        <p>Tiempo de Vuelo: ${time.toFixed(2)} segundos</p>
        <p>Caída de la Bala: ${drop.toFixed(2)} metros</p>
        <p>Desplazamiento por el Viento: ${windDrift.toFixed(2)} metros</p>
        <p>Velocidad Ajustada Final: ${finalVelocity.toFixed(2)} m/s</p>
        <p>Velocidad a 50 metros: ${speedAt50m.toFixed(2)} m/s</p>
        <p>Velocidad a 100 metros: ${speedAt100m.toFixed(2)} m/s</p>
        <p>Corrección de Deriva de Coriolis: ${coriolisEffect.toFixed(2)} metros</p>
        <p>Corrección de Deriva Giroscópica: ${gyroscopicDrift.toFixed(2)} metros</p>
        <p>Clics en Milirradiano: ${clicksMilRad.toFixed(2)}</p>
    `;

    drawReticle();  // Redibuja la retícula
    drawTrajectory(angleRad, velocity, time);  // Dibuja la trayectoria
    populateTable(); // Llena la tabla con datos
}

// Llena la tabla con datos de caída a intervalos
function populateTable() {
    const tbody = document.getElementById('ballisticsTable').getElementsByTagName('tbody')[0];
    tbody.innerHTML = ''; // Limpia la tabla

    const dropData = calculateDropAtIntervals(1000, 25); // Calcula la caída en intervalos de 25 metros

    // Añade cada dato a la tabla
    dropData.forEach(({ distance, drop }) => {
        const row = tbody.insertRow();
        row.insertCell(0).textContent = `Caída a ${distance} metros`;
        row.insertCell(1).textContent = `${drop.toFixed(2)} metros`;
    });

    drawDropChart(dropData); // Dibuja el gráfico de caída
}

// Calcula la caída a intervalos específicos
function calculateDropAtIntervals(maxDistance, interval) {
    const results = [];
    const velocity = parseFloat(document.getElementById('velocity').value);
    const angleRad = parseFloat(document.getElementById('angle').value) * (Math.PI / 180);
    const g = 9.81;

    for (let d = 25; d <= maxDistance; d += interval) {
        const timeAtDistance = d / (velocity * Math.cos(angleRad));
        const dropAtDistance = -0.5 * g * Math.pow(timeAtDistance, 2); // Caída negativa
        results.push({ distance: d, drop: dropAtDistance }); // Añade el resultado al arreglo
    }
    return results;
}

// Dibuja el gráfico de caída en un canvas
function drawDropChart(dropData) {
    const ctx = document.createElement('canvas');
    document.getElementById('tableContainer').appendChild(ctx);

    const distances = dropData.map(point => point.distance); // Distancias
    const drops = dropData.map(point => point.drop); // Caídas

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: distances,
            datasets: [{
                label: 'Caída de la Bala (m)',
                data: drops,
                borderColor: 'blue',
                fill: false
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    title: {
                        display: true,
                        text: 'Distancia (m)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Caída (m)'
                    }
                }
            }
        }
    });
}

// Descarga los datos de la tabla en formato CSV
function downloadCSV() {
    const table = document.getElementById('ballisticsTable');
    let csvContent = "data:text/csv;charset=utf-8,";
    for (let row of table.rows) {
        let rowData = Array.from(row.cells).map(cell => cell.textContent).join(",");
        csvContent += rowData + "\r\n"; // Añade cada fila al contenido CSV
    }

    const encodedUri = encodeURI(csvContent); // Codifica el contenido CSV
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "ballistics_data.csv"); // Nombre del archivo CSV
    document.body.appendChild(link);
    link.click(); // Inicia la descarga
}

// Guarda la configuración actual en el almacenamiento local
function saveConfiguration() {
    const formData = {
        velocity: document.getElementById('velocity').value,
        angle: document.getElementById('angle').value,
        distance: document.getElementById('distance').value,
        wind: document.getElementById('wind').value,
        temperature: document.getElementById('temperature').value,
        humidity: document.getElementById('humidity').value,
        bulletWeight: document.getElementById('bulletWeight').value,
        muzzleVelocity: document.getElementById('muzzleVelocity').value,
        bc: document.getElementById('bc').value,
        altitude: document.getElementById('altitude').value,
        pressure: document.getElementById('pressure').value,
        energy: document.getElementById('energy').value
    };

    localStorage.setItem('ballisticsConfig', JSON.stringify(formData)); // Guarda la configuración
    alert('Configuración guardada!'); // Muestra un mensaje de éxito
}

// Carga la configuración guardada desde el almacenamiento local
function loadConfiguration() {
    const savedConfig = localStorage.getItem('ballisticsConfig');
    if (savedConfig) {
        const formData = JSON.parse(savedConfig);
        for (const [key, value] of Object.entries(formData)) {
            const input = document.getElementById(key);
            if (input) {
                input.value = value; // Rellena el formulario con los valores guardados
            }
        }
    }
}

window.onload = loadConfiguration; // Carga la configuración al cargar la página
document.getElementById('saveButton').addEventListener('click', saveConfiguration); // Asocia la función de guardado al botón