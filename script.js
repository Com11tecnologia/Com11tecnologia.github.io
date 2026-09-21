// Mapeo de Carros según Sector
const carrosPorSector = {
    'Biblioteca': ['Carro C', 'Carro E'],
    'Espacio Digital': ['Carro D', 'Carro G'],
    'Secretaría': ['Carro A', 'Carro B', 'Carro F']
};

// Base de datos de docentes precargados de la planilla
const docentesData = [
    { nombre: "Carlos Alberto", apellido: "Barbieri", area: "AREA CONTABLES", email: "carlos.barbieri@bue.edu.ar" },
    { nombre: "Eduardo", apellido: "Yugdar", area: "AREA CONTABLES", email: "eduardo.yugdar@bue.edu.ar" },
    { nombre: "Alicia", apellido: "Ozuna", area: "AREA DE EXACTAS", email: "alicia.ozuna@bue.edu.ar" },
    { nombre: "Camila", apellido: "Tubaldi", area: "AREA DE EXACTAS", email: "camila.tubaldi@bue.edu.ar" },
    { nombre: "Alejo", apellido: "Surce", area: "AREA SOCIALES", email: "alejo.surce3@bue.edu.ar" },
    { nombre: "Agostina", apellido: "Paz", area: "AREA COMUNICACIÓN", email: "agostina.calienno@bue.edu.ar" }
];

// Cargar préstamos guardados en el navegador (localStorage) o iniciar vacío
let prestamos = JSON.parse(localStorage.getItem('prestamos_netbooks')) || [];

document.addEventListener("DOMContentLoaded", () => {
    lucide.createIcons();
    document.getElementById('fecha').value = new Date().toISOString().split('T')[0];
    populateDocentesList();
    updateUI();
});

// Guardar en el almacenamiento del navegador
function saveToLocalStorage() {
    localStorage.setItem('prestamos_netbooks', JSON.stringify(prestamos));
}

// Obtener conjunto de netbooks que están ocupadas actualmente (estado 'Asignada')
function getOcupiedNetbooks() {
    const ocupadas = new Set();
    prestamos.forEach(p => {
        if (p.estado === 'Asignada') {
            p.netbooks.forEach(nb => ocupadas.add(String(nb)));
        }
    });
    return ocupadas;
}

// Renderizar la grilla de casillas (1 a 40) bloqueando las prestadas
function renderNetbooksGrid() {
    const grid = document.getElementById('netbooks-grid');
    const ocupadas = getOcupiedNetbooks();
    grid.innerHTML = '';

    for (let i = 1; i <= 40; i++) {
        const strNum = String(i);
        const isOcupied = ocupadas.has(strNum);

        if (isOcupied) {
            // Casilla Deshabilitada (Netbook ya prestada)
            grid.innerHTML += `
                <div>
                    <input type="checkbox" id="nb_${i}" name="netbooks" value="${i}" disabled class="hidden netbook-checkbox">
                    <label for="nb_${i}" class="flex flex-col items-center justify-center p-2 rounded-lg border border-red-300 bg-red-50 text-red-500 cursor-not-allowed opacity-80 select-none" title="Equipo N° ${i} actualmente prestado">
                        <i data-lucide="lock" class="w-4 h-4 mb-1 text-red-500"></i>
                        <span class="text-xs font-bold">N° ${i}</span>
                        <span class="text-[9px] font-bold tracking-wider uppercase text-red-600">Ocupada</span>
                    </label>
                </div>
            `;
        } else {
            // Casilla Disponible (Verde al seleccionar)
            grid.innerHTML += `
                <div>
                    <input type="checkbox" id="nb_${i}" name="netbooks" value="${i}" class="hidden netbook-checkbox">
                    <label for="nb_${i}" class="netbook-card flex flex-col items-center justify-center p-2 rounded-lg border border-slate-200 bg-white hover:border-emerald-400 cursor-pointer select-none">
                        <i data-lucide="laptop" class="w-4 h-4 mb-1"></i>
                        <span class="text-xs font-bold">N° ${i}</span>
                        <span class="text-[9px] font-medium text-emerald-600">Disponible</span>
                    </label>
                </div>
            `;
        }
    }
    lucide.createIcons();
}

function populateDocentesList() {
    const datalist = document.getElementById('docentes_list');
    datalist.innerHTML = '';
    docentesData.forEach(d => {
        const option = document.createElement('option');
        option.value = `${d.apellido}, ${d.nombre}`;
        datalist.appendChild(option);
    });
}

function handleDocenteSelect() {
    const val = document.getElementById('docente_input').value.toLowerCase().trim();
    const found = docentesData.find(d => `${d.apellido}, ${d.nombre}`.toLowerCase() === val || `${d.nombre} ${d.apellido}`.toLowerCase() === val);

    if (found) {
        document.getElementById('area').value = found.area || '';
        document.getElementById('email').value = found.email || '';
    }
}

function handleSectorChange() {
    const sector = document.getElementById('sector').value;
    const selectCarro = document.getElementById('carro');

    selectCarro.innerHTML = '<option value="">Seleccione un carro</option>';

    if (sector && carrosPorSector[sector]) {
        selectCarro.disabled = false;
        selectCarro.classList.remove('bg-slate-50');
        carrosPorSector[sector].forEach(carro => {
            const opt = document.createElement('option');
            opt.value = carro;
            opt.textContent = carro;
            selectCarro.appendChild(opt);
        });
    } else {
        selectCarro.disabled = true;
        selectCarro.classList.add('bg-slate-50');
    }
}

function selectAll(status) {
    document.querySelectorAll('input[name="netbooks"]:not(:disabled)').forEach(cb => cb.checked = status);
}

function handleSubmit(e) {
    e.preventDefault();

    const selectedNetbooks = Array.from(document.querySelectorAll('input[name="netbooks"]:checked')).map(cb => cb.value);

    if (selectedNetbooks.length === 0) {
        alert("Por favor seleccione al menos una netbook disponible (1-40).");
        return;
    }

    // Verificar doble confirmación de disponibilidad
    const ocupadas = getOcupiedNetbooks();
    const conflicto = selectedNetbooks.find(nb => ocupadas.has(String(nb)));
    if (conflicto) {
        alert(`La netbook N° ${conflicto} ya se encuentra prestada y no puede asignarse de nuevo.`);
        return;
    }

    const record = {
        id: Date.now(),
        fecha: document.getElementById('fecha').value,
        turno: document.getElementById('turno').value,
        sector: document.getElementById('sector').value,
        carro: document.getElementById('carro').value,
        docente: document.getElementById('docente_input').value,
        area: document.getElementById('area').value || 'N/A',
        email: document.getElementById('email').value || 'N/A',
        estudiante: (document.getElementById('estudiante_apellido').value || document.getElementById('estudiante_nombre').value)
            ? `${document.getElementById('estudiante_apellido').value} ${document.getElementById('estudiante_nombre').value}`.trim() 
            : 'N/A',
        numeroSerie: document.getElementById('numero_serie').value || 'N/A',
        netbooks: selectedNetbooks,
        estado: 'Asignada'
    };

    prestamos.unshift(record);
    saveToLocalStorage();

    if (document.getElementById('send_email_option').checked) {
        sendNotificationEmail(record);
    }

    resetForm();
    updateUI();
}

function sendNotificationEmail(record) {
    const subject = encodeURIComponent(`Préstamo de Netbooks - ${record.fecha}`);
    const body = encodeURIComponent(
        `Hola ${record.docente},\n\n` +
        `Registramos el retiro de equipos:\n` +
        `- Fecha: ${record.fecha}\n` +
        `- Turno: ${record.turno}\n` +
        `- Ubicación: ${record.sector} (${record.carro})\n` +
        `- Netbooks N°: ${record.netbooks.join(', ')}\n` +
        (record.estudiante !== 'N/A' ? `- Estudiante: ${record.estudiante}\n` : '') +
        `\nMuchas gracias.`
    );

    window.open(`mailto:${record.email !== 'N/A' ? record.email : ''}?subject=${subject}&body=${body}`, '_blank');
}

function toggleDevolucion(id) {
    const item = prestamos.find(p => p.id === id);
    if (item) {
        item.estado = item.estado === 'Asignada' ? 'Devuelta' : 'Asignada';
        saveToLocalStorage();
        updateUI();
    }
}

function deleteRecord(id) {
    if (confirm("¿Desea eliminar este registro del historial?")) {
        prestamos = prestamos.filter(p => p.id !== id);
        saveToLocalStorage();
        updateUI();
    }
}

function resetForm() {
    document.getElementById('loanForm').reset();
    document.getElementById('fecha').value = new Date().toISOString().split('T')[0];
    handleSectorChange();
    selectAll(false);
}

function updateUI() {
    const todayStr = new Date().toISOString().split('T')[0];

    // Re-renderizar grilla para deshabilitar las netbooks prestadas actualmente
    renderNetbooksGrid();

    const hoyAsignadas = prestamos
        .filter(p => p.fecha === todayStr && p.estado === 'Asignada')
        .reduce((acc, p) => acc + p.netbooks.length, 0);

    const hoyDevueltas = prestamos
        .filter(p => p.fecha === todayStr && p.estado === 'Devuelta')
        .reduce((acc, p) => acc + p.netbooks.length, 0);

    document.getElementById('counter-asignadas').textContent = hoyAsignadas;
    document.getElementById('counter-devueltas').textContent = hoyDevueltas;

    const tbody = document.getElementById('records-table-body');
    tbody.innerHTML = '';

    if (prestamos.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="px-4 py-8 text-center text-slate-400">
                    No hay préstamos registrados.
                </td>
            </tr>
        `;
        return;
    }

    prestamos.forEach(p => {
        const badgeColor = p.estado === 'Asignada' 
            ? 'bg-amber-100 text-amber-800 border-amber-200' 
            : 'bg-emerald-100 text-emerald-800 border-emerald-200';

        tbody.innerHTML += `
            <tr class="hover:bg-slate-50 transition">
                <td class="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">${p.fecha}<span class="text-xs font-normal text-slate-400 block">${p.turno}</span></td>
                <td class="px-4 py-3 font-semibold text-slate-800">${p.docente}</td>
                <td class="px-4 py-3">
                    <span class="block text-xs text-slate-600">${p.area}</span>
                    <span class="block text-xs text-slate-400">${p.email}</span>
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                    <span class="text-xs font-medium bg-slate-100 px-2 py-1 rounded text-slate-700">${p.sector}</span>
                    <span class="text-xs block text-slate-500 mt-1">${p.carro}</span>
                </td>
                <td class="px-4 py-3">
                    <div class="flex flex-wrap gap-1 max-w-xs">
                        ${p.netbooks.map(nb => `<span class="px-1.5 py-0.5 bg-blue-50 text-blue-700 font-semibold text-xs rounded border border-blue-200">N°${nb}</span>`).join('')}
                    </div>
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                    <span class="px-2.5 py-1 text-xs font-semibold rounded-full border ${badgeColor}">
                        ${p.estado}
                    </span>
                </td>
                <td class="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                    <button onclick="toggleDevolucion(${p.id})" class="p-1 text-slate-500 hover:text-emerald-600 rounded transition" title="Marcar Devolución / Asignación">
                        <i data-lucide="${p.estado === 'Asignada' ? 'check-circle' : 'rotate-ccw'}" class="w-5 h-5"></i>
                    </button>
                    <button onclick="deleteRecord(${p.id})" class="p-1 text-slate-500 hover:text-red-600 rounded transition" title="Eliminar">
                        <i data-lucide="trash-2" class="w-5 h-5"></i>
                    </button>
                </td>
            </tr>
        `;
    });

    lucide.createIcons();
}

// Función para exportar la planilla a un archivo CSV
function exportToCSV() {
    if (prestamos.length === 0) {
        alert("No hay registros en el historial para exportar.");
        return;
    }

    const headers = ["Fecha", "Turno", "Docente", "Area", "Email", "Sector", "Carro", "Equipos Netbook", "Estudiante", "Numero de Serie", "Estado"];
    
    const rows = prestamos.map(p => [
        `"${p.fecha}"`,
        `"${p.turno}"`,
        `"${p.docente}"`,
        `"${p.area}"`,
        `"${p.email}"`,
        `"${p.sector}"`,
        `"${p.carro}"`,
        `"${p.netbooks.map(nb => 'N°' + nb).join('; ')}"`,
        `"${p.estudiante}"`,
        `"${p.numeroSerie}"`,
        `"${p.estado}"`
    ]);

    let csvContent = "\uFEFF";
    csvContent += headers.join(";") + "\n";
    rows.forEach(row => {
        csvContent += row.join(";") + "\n";
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Historial_Netbooks_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}