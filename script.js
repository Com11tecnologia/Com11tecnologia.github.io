 // Mapeo de Carros según Sector
const carrosPorSector = {
    'Biblioteca': ['Carro C', 'Carro E'],
    'Espacio Digital': ['Carro D', 'Carro G'],
    'Secretaría': ['Carro A', 'Carro B', 'Carro F']
};

const docentesDefault = [
    { nombre: "Carlos Alberto", apellido: "Barbieri", area: "AREA CONTABLES", email: "carlos.barbieri@bue.edu.ar" },
    { nombre: "Eduardo", apellido: "Yugdar", area: "AREA CONTABLES", email: "eduardo.yugdar@bue.edu.ar" },
    { nombre: "Alicia", apellido: "Ozuna", area: "AREA DE EXACTAS", email: "alicia.ozuna@bue.edu.ar" },
    { nombre: "Camila", apellido: "Tubaldi", area: "AREA DE EXACTAS", email: "camila.tubaldi@bue.edu.ar" },
    { nombre: "Alejo", apellido: "Surce", area: "AREA SOCIALES", email: "alejo.surce3@bue.edu.ar" },
    { nombre: "Agostina", apellido: "Paz", area: "AREA COMUNICACIÓN", email: "agostina.calienno@bue.edu.ar" }
];

let docentesData = JSON.parse(localStorage.getItem('docentes_netbooks')) || docentesDefault;
let prestamos = JSON.parse(localStorage.getItem('prestamos_netbooks')) || [];
let inventarioEquipos = JSON.parse(localStorage.getItem('inventario_equipos')) || {};

// Inicialización de los 40 equipos por carro
const todosLosCarros = ['Carro A', 'Carro B', 'Carro C', 'Carro D', 'Carro E', 'Carro F', 'Carro G'];
todosLosCarros.forEach(carro => {
    for (let i = 1; i <= 40; i++) {
        const key = `${carro}_${i}`;
        if (!inventarioEquipos[key]) {
            inventarioEquipos[key] = {
                idActivo: `${carro.replace(' ', '')}-${String(i).padStart(2, '0')}`,
                estado: 'Disponible',
                mantenimiento: 'Sin registros de fallas.'
            };
        }
    }
});

document.addEventListener("DOMContentLoaded", () => {
    lucide.createIcons();
    document.getElementById('fecha').value = new Date().toISOString().split('T')[0];
    saveToLocalStorage();
    populateDocentesList();
    handleInvSectorChange();
    updateUI();
});

function saveToLocalStorage() {
    localStorage.setItem('prestamos_netbooks', JSON.stringify(prestamos));
    localStorage.setItem('docentes_netbooks', JSON.stringify(docentesData));
    localStorage.setItem('inventario_equipos', JSON.stringify(inventarioEquipos));
}

// FUNCIONES DE COPIA DE SEGURIDAD GENERAL (BACKUP)
function exportBackupJSON() {
    const backupData = {
        prestamos: prestamos,
        docentes: docentesData,
        inventario: inventarioEquipos
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Backup_Netbooks_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

function importBackupJSON(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            if (importedData.docentes && importedData.inventario) {
                prestamos = importedData.prestamos || [];
                docentesData = importedData.docentes || [];
                inventarioEquipos = importedData.inventario || {};

                saveToLocalStorage();
                populateDocentesList();
                handleInvSectorChange();
                updateUI();
                alert("Backup restaurado correctamente.");
            } else {
                alert("El archivo subido no tiene un formato válido.");
            }
        } catch (err) {
            alert("Error al procesar el archivo de backup.");
        }
    };
    reader.readAsText(file);
}

function getOcupiedNetbooksByCarro(carroTarget) {
    const ocupadas = new Set();
    if (!carroTarget) return ocupadas;

    prestamos.forEach(p => {
        if (p.estado === 'Asignada' && p.carro === carroTarget) {
            p.netbooks.forEach(nb => ocupadas.add(String(nb)));
        }
    });
    return ocupadas;
}

function renderNetbooksGrid() {
    const grid = document.getElementById('netbooks-grid');
    if (!grid) return;

    const carroSeleccionado = document.getElementById('carro') ? document.getElementById('carro').value : '';
    const ocupadas = getOcupiedNetbooksByCarro(carroSeleccionado);
    grid.innerHTML = '';

    for (let i = 1; i <= 40; i++) {
        const strNum = String(i);
        const isOcupied = ocupadas.has(strNum);
        const keyInventario = carroSeleccionado ? `${carroSeleccionado}_${i}` : `Carro C_${i}`;
        const equipo = inventarioEquipos[keyInventario] || { estado: 'Disponible' };
        const estado = equipo.estado;

        if (estado === 'Desaparecido') {
            grid.innerHTML += `
                <div>
                    <input type="checkbox" id="nb_${i}" name="netbooks" value="${i}" disabled class="hidden netbook-checkbox">
                    <label for="nb_${i}" class="flex flex-col items-center justify-center p-2 rounded-lg border border-purple-400 bg-purple-100 text-purple-900 cursor-not-allowed opacity-90 select-none" title="Equipo N° ${i} Desaparecido">
                        <i data-lucide="ghost" class="w-4 h-4 mb-1 text-purple-700"></i>
                        <span class="text-xs font-bold">N° ${i}</span>
                        <span class="text-[9px] font-extrabold tracking-wider uppercase text-purple-900">Desaparecido</span>
                    </label>
                </div>
            `;
        } else if (estado === 'Roto') {
            grid.innerHTML += `
                <div>
                    <input type="checkbox" id="nb_${i}" name="netbooks" value="${i}" disabled class="hidden netbook-checkbox">
                    <label for="nb_${i}" class="flex flex-col items-center justify-center p-2 rounded-lg border border-rose-400 bg-rose-100 text-rose-900 cursor-not-allowed opacity-90 select-none" title="Equipo N° ${i} Roto">
                        <i data-lucide="alert-triangle" class="w-4 h-4 mb-1 text-rose-700"></i>
                        <span class="text-xs font-bold">N° ${i}</span>
                        <span class="text-[9px] font-extrabold tracking-wider uppercase text-rose-900">Roto</span>
                    </label>
                </div>
            `;
        } else if (estado === 'Bajo reparación') {
            grid.innerHTML += `
                <div>
                    <input type="checkbox" id="nb_${i}" name="netbooks" value="${i}" disabled class="hidden netbook-checkbox">
                    <label for="nb_${i}" class="flex flex-col items-center justify-center p-2 rounded-lg border border-amber-400 bg-amber-100 text-amber-900 cursor-not-allowed opacity-90 select-none" title="Equipo N° ${i} Bajo reparación">
                        <i data-lucide="wrench" class="w-4 h-4 mb-1 text-amber-700"></i>
                        <span class="text-xs font-bold">N° ${i}</span>
                        <span class="text-[9px] font-extrabold tracking-wider uppercase text-amber-900">Reparación</span>
                    </label>
                </div>
            `;
        } else if (estado === 'Arrendado') {
            grid.innerHTML += `
                <div>
                    <input type="checkbox" id="nb_${i}" name="netbooks" value="${i}" disabled class="hidden netbook-checkbox">
                    <label for="nb_${i}" class="flex flex-col items-center justify-center p-2 rounded-lg border border-sky-400 bg-sky-100 text-sky-900 cursor-not-allowed opacity-90 select-none" title="Equipo N° ${i} Arrendado">
                        <i data-lucide="file-contract" class="w-4 h-4 mb-1 text-sky-700"></i>
                        <span class="text-xs font-bold">N° ${i}</span>
                        <span class="text-[9px] font-extrabold tracking-wider uppercase text-sky-900">Arrendado</span>
                    </label>
                </div>
            `;
        } else if (isOcupied) {
            grid.innerHTML += `
                <div>
                    <input type="checkbox" id="nb_${i}" name="netbooks" value="${i}" disabled class="hidden netbook-checkbox">
                    <label for="nb_${i}" class="flex flex-col items-center justify-center p-2 rounded-lg border border-red-300 bg-red-50 text-red-600 cursor-not-allowed opacity-80 select-none" title="Equipo N° ${i} prestado">
                        <i data-lucide="lock" class="w-4 h-4 mb-1 text-red-500"></i>
                        <span class="text-xs font-bold">N° ${i}</span>
                        <span class="text-[9px] font-bold tracking-wider uppercase text-red-600">Prestada</span>
                    </label>
                </div>
            `;
        } else {
            grid.innerHTML += `
                <div>
                    <input type="checkbox" id="nb_${i}" name="netbooks" value="${i}" class="hidden netbook-checkbox">
                    <label for="nb_${i}" class="netbook-card flex flex-col items-center justify-center p-2 rounded-lg border border-slate-200 bg-white hover:border-emerald-400 cursor-pointer select-none">
                        <i data-lucide="laptop" class="w-4 h-4 mb-1 text-slate-600"></i>
                        <span class="text-xs font-bold">N° ${i}</span>
                        <span class="text-[9px] font-medium text-emerald-600">Disponible</span>
                    </label>
                </div>
            `;
        }
    }
    lucide.createIcons();
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
    renderNetbooksGrid();
}

document.addEventListener("change", (e) => {
    if (e.target && e.target.id === 'carro') {
        renderNetbooksGrid();
    }
});

function handleInvSectorChange() {
    const sector = document.getElementById('inv-sector').value;
    const selectCarro = document.getElementById('inv-carro');
    if (!selectCarro) return;

    selectCarro.innerHTML = '';
    if (carrosPorSector[sector]) {
        carrosPorSector[sector].forEach(carro => {
            const opt = document.createElement('option');
            opt.value = carro;
            opt.textContent = carro;
            selectCarro.appendChild(opt);
        });
    }
    renderInventarioTable();
}

function renderInventarioTable() {
    const tbody = document.getElementById('inventario-table-body');
    const carroSeleccionado = document.getElementById('inv-carro') ? document.getElementById('inv-carro').value : 'Carro C';
    if (!tbody || !carroSeleccionado) return;

    tbody.innerHTML = '';

    for (let i = 1; i <= 40; i++) {
        const key = `${carroSeleccionado}_${i}`;
        const eq = inventarioEquipos[key] || { idActivo: 'N/A', estado: 'Disponible', mantenimiento: '' };

        let badgeStyle = 'bg-emerald-100 text-emerald-800 border-emerald-200';
        if (eq.estado === 'Roto') badgeStyle = 'bg-rose-100 text-rose-800 border-rose-200';
        if (eq.estado === 'Bajo reparación') badgeStyle = 'bg-amber-100 text-amber-800 border-amber-200';
        if (eq.estado === 'Arrendado') badgeStyle = 'bg-sky-100 text-sky-800 border-sky-200';
        if (eq.estado === 'Desaparecido') badgeStyle = 'bg-purple-100 text-purple-800 border-purple-200';

        tbody.innerHTML += `
            <tr class="hover:bg-slate-50 transition">
                <td class="px-4 py-2.5 font-bold text-slate-800">${carroSeleccionado} - N° ${i}</td>
                <td class="px-4 py-2.5 text-xs font-mono text-slate-600">${eq.idActivo}</td>
                <td class="px-4 py-2.5">
                    <span class="px-2.5 py-0.5 text-xs font-semibold rounded-full border ${badgeStyle}">
                        ${eq.estado}
                    </span>
                </td>
                <td class="px-4 py-2.5 text-xs text-slate-500 max-w-xs truncate">${eq.mantenimiento}</td>
                <td class="px-4 py-2.5 text-right">
                    <button onclick="openInventarioModal('${carroSeleccionado}', ${i})" class="p-1 text-slate-500 hover:text-blue-600" title="Editar Activo / Mantenimiento">
                        <i data-lucide="edit-3" class="w-4 h-4"></i>
                    </button>
                </td>
            </tr>
        `;
    }
    lucide.createIcons();
}

function openInventarioModal(carro, nbNumber) {
    const key = `${carro}_${nbNumber}`;
    const eq = inventarioEquipos[key] || { idActivo: '', estado: 'Disponible', mantenimiento: '' };

    document.getElementById('inv-edit-nb-id').value = key;
    document.getElementById('inv-modal-title').textContent = `Editar ${carro} - Netbook N° ${nbNumber}`;
    document.getElementById('inv-modal-activo').value = eq.idActivo;
    document.getElementById('inv-modal-estado').value = eq.estado;
    document.getElementById('inv-modal-mantenimiento').value = eq.mantenimiento;

    const modal = document.getElementById('inventario-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeInventarioModal() {
    const modal = document.getElementById('inventario-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function saveInventarioItem() {
    const key = document.getElementById('inv-edit-nb-id').value;
    const activo = document.getElementById('inv-modal-activo').value.trim() || 'N/A';
    const estado = document.getElementById('inv-modal-estado').value;
    const mantenimiento = document.getElementById('inv-modal-mantenimiento').value.trim() || 'Sin notas.';

    inventarioEquipos[key] = {
        idActivo: activo,
        estado: estado,
        mantenimiento: mantenimiento
    };

    saveToLocalStorage();
    renderInventarioTable();
    updateUI();
    closeInventarioModal();
}

function populateDocentesList() {
    const datalist = document.getElementById('docentes_list');
    if (!datalist) return;
    datalist.innerHTML = '';
    docentesData.forEach(d => {
        const option = document.createElement('option');
        option.value = `${d.apellido}, ${d.nombre}`;
        datalist.appendChild(option);
    });
}

function renderDocentesTable() {
    const tbody = document.getElementById('docentes-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    docentesData.forEach((d, idx) => {
        tbody.innerHTML += `
            <tr class="hover:bg-slate-50 transition">
                <td class="px-4 py-2.5 font-semibold text-slate-800">${d.apellido}, ${d.nombre}</td>
                <td class="px-4 py-2.5 text-xs text-slate-600">${d.area || 'N/A'}</td>
                <td class="px-4 py-2.5 text-xs text-slate-500">${d.email || 'N/A'}</td>
                <td class="px-4 py-2.5 text-right space-x-1">
                    <button onclick="editDocente(${idx})" class="p-1 text-slate-500 hover:text-blue-600" title="Modificar">
                        <i data-lucide="pencil" class="w-4 h-4"></i>
                    </button>
                    <button onclick="deleteDocente(${idx})" class="p-1 text-slate-500 hover:text-red-600" title="Eliminar">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    lucide.createIcons();
}

function openDocenteModal(idx = -1) {
    document.getElementById('edit-docente-index').value = idx;
    if (idx >= 0) {
        document.getElementById('modal-title').textContent = "Editar Docente";
        document.getElementById('modal-apellido').value = docentesData[idx].apellido;
        document.getElementById('modal-nombre').value = docentesData[idx].nombre;
        document.getElementById('modal-area').value = docentesData[idx].area;
        document.getElementById('modal-email').value = docentesData[idx].email;
    } else {
        document.getElementById('modal-title').textContent = "Agregar Docente";
        document.getElementById('modal-apellido').value = "";
        document.getElementById('modal-nombre').value = "";
        document.getElementById('modal-area').value = "";
        document.getElementById('modal-email').value = "";
    }
    const modal = document.getElementById('docente-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeDocenteModal() {
    const modal = document.getElementById('docente-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function saveDocenteFromModal() {
    const idx = parseInt(document.getElementById('edit-docente-index').value);
    const apellido = document.getElementById('modal-apellido').value.trim();
    const nombre = document.getElementById('modal-nombre').value.trim();
    const area = document.getElementById('modal-area').value.trim() || 'N/A';
    const email = document.getElementById('modal-email').value.trim() || 'N/A';

    if (!nombre || !apellido) {
        alert("Por favor completa nombre y apellido.");
        return;
    }

    if (idx >= 0) {
        docentesData[idx] = { nombre, apellido, area, email };
    } else {
        docentesData.push({ nombre, apellido, area, email });
    }

    saveToLocalStorage();
    populateDocentesList();
    renderDocentesTable();
    closeDocenteModal();
}

function editDocente(idx) {
    openDocenteModal(idx);
}

function deleteDocente(idx) {
    if (confirm(`¿Deseas eliminar a ${docentesData[idx].apellido}, ${docentesData[idx].nombre}?`)) {
        docentesData.splice(idx, 1);
        saveToLocalStorage();
        populateDocentesList();
        renderDocentesTable();
    }
}

function importDocentesCSV(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        const lines = text.split(/\r\n|\n/);
        let agregados = 0;

        lines.forEach((line, index) => {
            if (index === 0 || !line.trim()) return;
            const parts = line.split(/;|,/);
            
            if (parts.length >= 2) {
                const nombre = parts[0] ? parts[0].replace(/"/g, '').trim() : '';
                const apellido = parts[1] ? parts[1].replace(/"/g, '').trim() : '';
                const area = parts[2] ? parts[2].replace(/"/g, '').trim() : 'N/A';
                const email = parts[3] ? parts[3].replace(/"/g, '').trim() : 'N/A';

                if (nombre && apellido) {
                    const exists = docentesData.some(d => d.nombre.toLowerCase() === nombre.toLowerCase() && d.apellido.toLowerCase() === apellido.toLowerCase());
                    if (!exists) {
                        docentesData.push({ nombre, apellido, area, email });
                        agregados++;
                    }
                }
            }
        });

        saveToLocalStorage();
        populateDocentesList();
        renderDocentesTable();
        alert(`Se importaron ${agregados} docentes correctamente.`);
    };
    reader.readAsText(file);
}

function handleDocenteSelect() {
    const val = document.getElementById('docente_input').value.toLowerCase().trim();
    const found = docentesData.find(d => `${d.apellido}, ${d.nombre}`.toLowerCase() === val || `${d.nombre} ${d.apellido}`.toLowerCase() === val);

    if (found) {
        document.getElementById('area').value = found.area || '';
        document.getElementById('email').value = found.email || '';
    }
}

function saveOrUpdateDocente(docenteStr, areaStr, emailStr) {
    if (!docenteStr) return;

    let nombre = docenteStr;
    let apellido = "";

    if (docenteStr.includes(",")) {
        const parts = docenteStr.split(",");
        apellido = parts[0].trim();
        nombre = parts[1].trim();
    } else if (docenteStr.includes(" ")) {
        const parts = docenteStr.split(" ");
        apellido = parts.pop();
        nombre = parts.join(" ");
    }

    const idx = docentesData.findIndex(d => `${d.apellido}, ${d.nombre}`.toLowerCase() === docenteStr.toLowerCase() || `${d.nombre} ${d.apellido}`.toLowerCase() === docenteStr.toLowerCase());

    if (idx !== -1) {
        if (areaStr && areaStr !== 'N/A') docentesData[idx].area = areaStr;
        if (emailStr && emailStr !== 'N/A') docentesData[idx].email = emailStr;
    } else {
        docentesData.push({ nombre, apellido, area: areaStr || 'N/A', email: emailStr || 'N/A' });
    }

    saveToLocalStorage();
    populateDocentesList();
    renderDocentesTable();
}

function selectAll(status) {
    document.querySelectorAll('input[name="netbooks"]:not(:disabled)').forEach(cb => cb.checked = status);
}

function handleSubmit(e) {
    e.preventDefault();

    const carroSeleccionado = document.getElementById('carro').value;
    const selectedNetbooks = Array.from(document.querySelectorAll('input[name="netbooks"]:checked')).map(cb => String(cb.value));

    if (!carroSeleccionado) {
        alert("Por favor seleccione un carro.");
        return;
    }

    if (selectedNetbooks.length === 0) {
        alert("Por favor seleccione al menos una netbook disponible (1-40).");
        return;
    }

    const noDisponibles = selectedNetbooks.find(nb => {
        const key = `${carroSeleccionado}_${nb}`;
        return inventarioEquipos[key] && inventarioEquipos[key].estado !== 'Disponible';
    });

    if (noDisponibles) {
        const key = `${carroSeleccionado}_${noDisponibles}`;
        alert(`La netbook N° ${noDisponibles} del ${carroSeleccionado} no está disponible (${inventarioEquipos[key].estado}).`);
        return;
    }

    const ocupadas = getOcupiedNetbooksByCarro(carroSeleccionado);
    const ocupiedFound = selectedNetbooks.find(nb => ocupadas.has(nb));
    if (ocupiedFound) {
        alert(`La netbook N° ${ocupiedFound} del ${carroSeleccionado} ya se encuentra prestada.`);
        return;
    }

    const docenteInput = document.getElementById('docente_input').value;
    const areaInput = document.getElementById('area').value || 'N/A';
    const emailInput = document.getElementById('email').value || 'N/A';

    saveOrUpdateDocente(docenteInput, areaInput, emailInput);

    const record = {
        id: Date.now(),
        fecha: document.getElementById('fecha').value,
        turno: document.getElementById('turno').value,
        sector: document.getElementById('sector').value,
        carro: carroSeleccionado,
        docente: docenteInput,
        area: areaInput,
        email: emailInput,
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

    renderNetbooksGrid();
    renderDocentesTable();

    const hoyAsignadas = prestamos
        .filter(p => p.fecha === todayStr && p.estado === 'Asignada')
        .reduce((acc, p) => acc + p.netbooks.length, 0);

    const hoyDevueltas = prestamos
        .filter(p => p.fecha === todayStr && p.estado === 'Devuelta')
        .reduce((acc, p) => acc + p.netbooks.length, 0);

    document.getElementById('counter-asignadas').textContent = hoyAsignadas;
    document.getElementById('counter-devueltas').textContent = hoyDevueltas;

    const tbody = document.getElementById('records-table-body');
    if (!tbody) return;
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