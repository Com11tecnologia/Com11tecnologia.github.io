 <canvas id="app-netbooks" title="Sistema de Gestión y Registro de Netbooks" type="text/html">
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sistema de Gestión y Registro de Netbooks</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/lucide@latest/dist/umd/lucide.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
        .netbook-checkbox:checked + label {
            background-color: #2563eb;
            color: white;
            border-color: #1d4ed8;
            box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
        }
    </style>
</head>
<body class="bg-slate-50 text-slate-800 min-h-screen">

    <!-- Encabezado con métricas al estilo de la página de referencia -->
    <header class="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 text-white shadow-md sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div class="flex items-center space-x-3">
                    <div class="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                        <i data-lucide="laptop" class="w-8 h-8 text-blue-200"></i>
                    </div>
                    <div>
                        <h1 class="text-xl sm:text-2xl font-bold tracking-tight">Espacio Digital - Control de Netbooks</h1>
                        <p class="text-xs sm:text-sm text-blue-100/80">Registro diario de préstamos y devolución de equipos</p>
                    </div>
                </div>

                <!-- Métricas diarias de equipos (Asignadas y Devueltas) -->
                <div class="flex items-center space-x-3 bg-white/10 backdrop-blur-md p-2 sm:p-3 rounded-xl border border-white/20 shadow-inner">
                    <div class="text-center px-3 py-1 bg-blue-950/40 rounded-lg">
                        <span class="block text-xs font-medium text-blue-200 uppercase tracking-wider">Hoy Asignadas</span>
                        <span id="counter-asignadas" class="text-2xl font-extrabold text-amber-300">0</span>
                    </div>
                    <div class="h-8 w-px bg-white/20"></div>
                    <div class="text-center px-3 py-1 bg-blue-950/40 rounded-lg">
                        <span class="block text-xs font-medium text-blue-200 uppercase tracking-wider">Hoy Devueltas</span>
                        <span id="counter-devueltas" class="text-2xl font-extrabold text-emerald-300">0</span>
                    </div>
                </div>
            </div>
        </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <!-- Formulario principal de Registro -->
        <form id="loanForm" class="space-y-8" onsubmit="handleSubmit(event)">
            
            <!-- SECCIÓN 1: DATOS DEL PRÉSTAMO -->
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div class="flex items-center space-x-3 mb-6 pb-3 border-b border-slate-100">
                    <div class="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <i data-lucide="calendar" class="w-5 h-5"></i>
                    </div>
                    <h2 class="text-lg font-semibold text-slate-800">1. Datos del Préstamo</h2>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <!-- Fecha -->
                    <div>
                        <label for="fecha" class="block text-sm font-medium text-slate-700 mb-1">Fecha <span class="text-red-500">*</span></label>
                        <input type="date" id="fecha" name="fecha" required
                            class="w-full rounded-lg border-slate-300 border px-3 py-2 text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition">
                    </div>

                    <!-- Turno (Sin vespertino) -->
                    <div>
                        <label for="turno" class="block text-sm font-medium text-slate-700 mb-1">Turno <span class="text-red-500">*</span></label>
                        <select id="turno" name="turno" required
                            class="w-full rounded-lg border-slate-300 border px-3 py-2 text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition">
                            <option value="">Seleccione turno</option>
                            <option value="Mañana">Mañana</option>
                            <option value="Tarde">Tarde</option>
                            <option value="Noche">Noche</option>
                        </select>
                    </div>

                    <!-- Sector -->
                    <div>
                        <label for="sector" class="block text-sm font-medium text-slate-700 mb-1">Sector <span class="text-red-500">*</span></label>
                        <select id="sector" name="sector" required onchange="handleSectorChange()"
                            class="w-full rounded-lg border-slate-300 border px-3 py-2 text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition">
                            <option value="">Seleccione sector</option>
                            <option value="Biblioteca">Biblioteca</option>
                            <option value="Espacio Digital">Espacio Digital</option>
                            <option value="Secretaría">Secretaría</option>
                        </select>
                    </div>

                    <!-- Carro (Dependiente del sector) -->
                    <div>
                        <label for="carro" class="block text-sm font-medium text-slate-700 mb-1">Carro Asignado <span class="text-red-500">*</span></label>
                        <select id="carro" name="carro" required disabled
                            class="w-full rounded-lg border-slate-300 border px-3 py-2 text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-slate-50">
                            <option value="">Primero seleccione sector</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- SECCIÓN 2: INFORMACIÓN DEL DOCENTE Y ESTUDIANTE -->
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div class="flex items-center space-x-3 mb-6 pb-3 border-b border-slate-100">
                    <div class="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                        <i data-lucide="user" class="w-5 h-5"></i>
                    </div>
                    <h2 class="text-lg font-semibold text-slate-800">2. Información del Docente y Estudiante</h2>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <!-- Búsqueda / Selección de Docente -->
                    <div class="relative">
                        <label for="docente_input" class="block text-sm font-medium text-slate-700 mb-1">Docente (Búsqueda o Manual) <span class="text-red-500">*</span></label>
                        <input type="text" id="docente_input" list="docentes_list" placeholder="Escriba apellido o nombre..." required oninput="handleDocenteSelect()"
                            class="w-full rounded-lg border-slate-300 border px-3 py-2 text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition">
                        <datalist id="docentes_list">
                            <!-- Se completa por JavaScript -->
                        </datalist>
                    </div>

                    <!-- Área (Opcional) -->
                    <div>
                        <label for="area" class="block text-sm font-medium text-slate-700 mb-1">Área <span class="text-xs text-slate-400">(Opcional)</span></label>
                        <input type="text" id="area" name="area" placeholder="Ej. AREA EXACTAS"
                            class="w-full rounded-lg border-slate-300 border px-3 py-2 text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition">
                    </div>

                    <!-- Correo Electrónico (Opcional) -->
                    <div>
                        <label for="email" class="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico <span class="text-xs text-slate-400">(Opcional)</span></label>
                        <input type="email" id="email" name="email" placeholder="docente@bue.edu.ar"
                            class="w-full rounded-lg border-slate-300 border px-3 py-2 text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition">
                    </div>

                    <!-- Apellido Estudiante (Opcional) -->
                    <div>
                        <label for="estudiante_apellido" class="block text-sm font-medium text-slate-700 mb-1">Apellido del Estudiante <span class="text-xs text-slate-400">(Opcional)</span></label>
                        <input type="text" id="estudiante_apellido" name="estudiante_apellido" placeholder="Apellido del alumno"
                            class="w-full rounded-lg border-slate-300 border px-3 py-2 text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition">
                    </div>

                    <!-- Nombre Estudiante (Opcional) -->
                    <div>
                        <label for="estudiante_nombre" class="block text-sm font-medium text-slate-700 mb-1">Nombre del Estudiante <span class="text-xs text-slate-400">(Opcional)</span></label>
                        <input type="text" id="estudiante_nombre" name="estudiante_nombre" placeholder="Nombre del alumno"
                            class="w-full rounded-lg border-slate-300 border px-3 py-2 text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition">
                    </div>

                    <!-- N° de Serie (Opcional) -->
                    <div>
                        <label for="numero_serie" class="block text-sm font-medium text-slate-700 mb-1">N° de Serie de Equipo <span class="text-xs text-slate-400">(Opcional)</span></label>
                        <input type="text" id="numero_serie" name="numero_serie" placeholder="Ej. SN12345678"
                            class="w-full rounded-lg border-slate-300 border px-3 py-2 text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition">
                    </div>
                </div>
            </div>

            <!-- SECCIÓN 3: SELECCIÓN MÚLTIPLE DE COMPUTADORAS (1-40) -->
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-3 border-b border-slate-100 gap-4">
                    <div class="flex items-center space-x-3">
                        <div class="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                            <i data-lucide="grid" class="w-5 h-5"></i>
                        </div>
                        <div>
                            <h2 class="text-lg font-semibold text-slate-800">3. Selección de Netbooks (Casillas 1 al 40)</h2>
                            <p class="text-xs text-slate-500">Puedes seleccionar una o más computadoras para la misma solicitud</p>
                        </div>
                    </div>
                    <div class="flex items-center space-x-2">
                        <button type="button" onclick="selectAll(true)" class="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition">
                            Marcar Todas
                        </button>
                        <button type="button" onclick="selectAll(false)" class="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition">
                            Desmarcar
                        </button>
                    </div>
                </div>

                <!-- Grilla de casillas 1 a 40 -->
                <div class="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-10 gap-2.5" id="netbooks-grid">
                    <!-- Renderizado por JS -->
                </div>
            </div>

            <!-- OPCIONAL: ENVIAR CORREO ELECTRÓNICO Y ACCIONES -->
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div class="flex items-center space-x-3">
                    <input type="checkbox" id="send_email_option" name="send_email_option"
                        class="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500">
                    <label for="send_email_option" class="text-sm font-medium text-slate-700 cursor-pointer">
                        Enviar notificación por correo electrónico al docente (Opcional)
                    </label>
                </div>

                <div class="flex items-center space-x-3 w-full md:w-auto justify-end">
                    <button type="reset" onclick="resetForm()" class="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition">
                        Limpiar Formulario
                    </button>
                    <button type="submit" class="px-6 py-2.5 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm hover:shadow transition flex items-center space-x-2">
                        <i data-lucide="save" class="w-4 h-4"></i>
                        <span>Registrar Préstamo</span>
                    </button>
                </div>
            </div>
        </form>

        <!-- TABLA DE REGISTROS / HISTORIAL -->
        <div class="mt-10 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div class="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h3 class="text-lg font-semibold text-slate-800">Historial de Registros</h3>
                    <p class="text-xs text-slate-500">Gestiona los préstamos y marca la devolución de los equipos</p>
                </div>
            </div>

            <div class="overflow-x-auto">
                <table class="w-full text-left text-sm text-slate-600">
                    <thead class="bg-slate-50 text-slate-700 font-medium uppercase text-xs tracking-wider border-b border-slate-200">
                        <tr>
                            <th class="px-4 py-3">Fecha</th>
                            <th class="px-4 py-3">Docente</th>
                            <th class="px-4 py-3">Área / Mail</th>
                            <th class="px-4 py-3">Ubicación</th>
                            <th class="px-4 py-3">Equipos</th>
                            <th class="px-4 py-3">Estado</th>
                            <th class="px-4 py-3 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="records-table-body" class="divide-y divide-slate-100">
                        <!-- Renderizado de registros por JS -->
                    </tbody>
                </table>
            </div>
        </div>

    </main>

    <script>
        // Mapeo de Carros según Sector
        const carrosPorSector = {
            'Biblioteca': ['Carro C', 'Carro E'],
            'Espacio Digital': ['Carro D', 'Carro G'],
            'Secretaría': ['Carro A', 'Carro B', 'Carro F']
        };

        // Base de Datos de Docentes precargados
        const docentesData = [
            { nombre: "Carlos Alberto", apellido: "Barbieri", area: "AREA CONTABLES", email: "carlos.barbieri@bue.edu.ar" },
            { nombre: "Eduardo", apellido: "Yugdar", area: "AREA CONTABLES", email: "eduardo.yugdar@bue.edu.ar" },
            { nombre: "Alicia", apellido: "Ozuna", area: "AREA DE EXACTAS", email: "alicia.ozuna@bue.edu.ar" },
            { nombre: "Camila", apellido: "Tubaldi", area: "AREA DE EXACTAS", email: "camila.tubaldi@bue.edu.ar" },
            { nombre: "Alejo", apellido: "Surce", area: "AREA SOCIALES", email: "alejo.surce3@bue.edu.ar" },
            { nombre: "Agostina", apellido: "Paz", area: "AREA COMUNICACIÓN", email: "agostina.calienno@bue.edu.ar" }
        ];

        // Estado local
        let prestamos = [];

        document.addEventListener("DOMContentLoaded", () => {
            // Inicializar Lucide Icons
            lucide.createIcons();

            // Establecer fecha de hoy por defecto
            document.getElementById('fecha').valueToDate = new Date();
            document.getElementById('fecha').value = new Date().toISOString().split('T')[0];

            // Renderizar casillas 1 a 40
            renderNetbooksGrid();

            // Cargar lista de docentes
            populateDocentesList();

            // Actualizar tabla y contadores
            updateUI();
        });

        // Genera la cuadrícula de netbooks 1 al 40
        function renderNetbooksGrid() {
            const grid = document.getElementById('netbooks-grid');
            grid.innerHTML = '';
            for (let i = 1; i <= 40; i++) {
                grid.innerHTML += `
                    <div>
                        <input type="checkbox" id="nb_${i}" name="netbooks" value="${i}" class="hidden netbook-checkbox">
                        <label for="nb_${i}" class="flex flex-col items-center justify-center p-2 rounded-lg border border-slate-200 bg-white hover:border-blue-400 cursor-pointer transition select-none">
                            <i data-lucide="laptop" class="w-4 h-4 mb-1"></i>
                            <span class="text-xs font-bold">N° ${i}</span>
                        </label>
                    </div>
                `;
            }
            lucide.createIcons();
        }

        // Carga los docentes en el datalist para autocompletado
        function populateDocentesList() {
            const datalist = document.getElementById('docentes_list');
            datalist.innerHTML = '';
            docentesData.forEach(d => {
                const option = document.createElement('option');
                option.value = `${d.apellido}, ${d.nombre}`;
                datalist.appendChild(option);
            });
        }

        // Autocompleta área y mail si el docente existe
        function handleDocenteSelect() {
            const val = document.getElementById('docente_input').value.toLowerCase().trim();
            const found = docentesData.find(d => `${d.apellido}, ${d.nombre}`.toLowerCase() === val || `${d.nombre} ${d.apellido}`.toLowerCase() === val);

            if (found) {
                document.getElementById('area').value = found.area || '';
                document.getElementById('email').value = found.email || '';
            }
        }

        // Manejo de cambio de Sector para desplegar Carros correspondientes
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

        // Marcar/Desmarcar todas las netbooks
        function selectAll(status) {
            document.querySelectorAll('input[name="netbooks"]').forEach(cb => cb.checked = status);
        }

        // Registrar un nuevo préstamo
        function handleSubmit(e) {
            e.preventDefault();

            const selectedNetbooks = Array.from(document.querySelectorAll('input[name="netbooks"]:checked')).map(cb => cb.value);

            if (selectedNetbooks.length === 0) {
                alert("Por favor seleccione al menos una netbook (1-40).");
                return;
            }

            const docenteVal = document.getElementById('docente_input').value;
            const sendEmail = document.getElementById('send_email_option').checked;
            const email = document.getElementById('email').value;

            const record = {
                id: Date.now(),
                fecha: document.getElementById('fecha').value,
                turno: document.getElementById('turno').value,
                sector: document.getElementById('sector').value,
                carro: document.getElementById('carro').value,
                docente: docenteVal,
                area: document.getElementById('area').value || 'N/A',
                email: email || 'N/A',
                estudiante: (document.getElementById('estudiante_apellido').value || document.getElementById('estudiante_nombre').value)
                    ? `${document.getElementById('estudiante_apellido').value} ${document.getElementById('estudiante_nombre').value}`.trim() 
                    : 'N/A',
                numeroSerie: document.getElementById('numero_serie').value || 'N/A',
                netbooks: selectedNetbooks,
                estado: 'Asignada' // Asignada o Devuelta
            };

            prestamos.unshift(record);

            // Si se marcó enviar correo electrónico opcional
            if (sendEmail) {
                sendNotificationEmail(record);
            }

            // Reiniciar y actualizar
            resetForm();
            updateUI();
        }

        // Envía notificación por correo mediante cliente de correo predeterminado
        function sendNotificationEmail(record) {
            const subject = encodeURIComponent(`Notificación de Préstamo de Netbooks - ${record.fecha}`);
            const body = encodeURIComponent(
                `Hola ${record.docente},\n\n` +
                `Se ha registrado el préstamo de equipamiento en la institución:\n\n` +
                `- Fecha: ${record.fecha}\n` +
                `- Turno: ${record.turno}\n` +
                `- Sector: ${record.sector} (${record.carro})\n` +
                `- Equipos Netbooks N°: ${record.netbooks.join(', ')}\n` +
                (record.estudiante !== 'N/A' ? `- Estudiante: ${record.estudiante}\n` : '') +
                `\nMuchas gracias.\nEspacio Digital.`
            );

            const mailtoUrl = `mailto:${record.email !== 'N/A' ? record.email : ''}?subject=${subject}&body=${body}`;
            window.open(mailtoUrl, '_blank');
        }

        // Cambia el estado entre 'Asignada' y 'Devuelta'
        function toggleDevolucion(id) {
            const item = prestamos.find(p => p.id === id);
            if (item) {
                item.estado = item.estado === 'Asignada' ? 'Devuelta' : 'Asignada';
                updateUI();
            }
        }

        // Eliminar registro
        function deleteRecord(id) {
            if (confirm("¿Desea eliminar este registro del historial?")) {
                prestamos = prestamos.filter(p => p.id !== id);
                updateUI();
            }
        }

        // Reinicia el formulario
        function resetForm() {
            document.getElementById('loanForm').reset();
            document.getElementById('fecha').value = new Date().toISOString().split('T')[0];
            handleSectorChange();
            selectAll(false);
        }

        // Actualiza los contadores de la cabecera y la tabla de historial
        function updateUI() {
            const todayStr = new Date().toISOString().split('T')[0];

            // Contadores de hoy
            const hoyAsignadas = prestamos
                .filter(p => p.fecha === todayStr && p.estado === 'Asignada')
                .reduce((acc, p) => acc + p.netbooks.length, 0);

            const hoyDevueltas = prestamos
                .filter(p => p.fecha === todayStr && p.estado === 'Devuelta')
                .reduce((acc, p) => acc + p.netbooks.length, 0);

            document.getElementById('counter-asignadas').textContent = hoyAsignadas;
            document.getElementById('counter-devueltas').textContent = hoyDevueltas;

            // Renderizado de tabla
            const tbody = document.getElementById('records-table-body');
            tbody.innerHTML = '';

            if (prestamos.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="7" class="px-4 py-8 text-center text-slate-400">
                            No hay préstamos registrados aún.
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
                    <tr class="hover:bg-slate-50/80 transition">
                        <td class="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">${p.fecha} <span class="text-xs font-normal text-slate-400 block">${p.turno}</span></td>
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
                            <button onclick="toggleDevolucion(${p.id})" class="p-1 text-slate-500 hover:text-emerald-600 rounded transition" title="Marcar Devolución">
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
    </script>
</body>
</html>
</canvas>
