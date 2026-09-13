const API_URL =
  'https://script.google.com/macros/s/AKfycbwGrlACa05-PtmQkdN7NNdIBXc6QqAbM2Udgzb07LuR4uOpdzi2fBxanqkbMShoUAE/exec';

let DATA = {
  procesos: [],
  candidaturas: [],
  catalogos: {},
  dashboard: {}
};


async function apiGet(
  accion,
  parametros = {}
) {

  const query =
    new URLSearchParams({
      accion,
      ...parametros
    });

  const response =
    await fetch(
      `${API_URL}?${query.toString()}`
    );

  const result =
    await response.json();

  if (!result.ok) {

    throw new Error(
      result.error || 'Error de API'
    );

  }

  return result.data;

}


async function apiPost(
  accion,
  datos
) {

  const response =
    await fetch(
      API_URL,
      {
        method: 'POST',

        headers: {
          'Content-Type':
            'text/plain;charset=utf-8'
        },

        body: JSON.stringify({
          accion,
          datos
        })

      }
    );

  const result =
    await response.json();

  if (!result.ok) {

    throw new Error(
      result.error || 'Error de API'
    );

  }

  return result.data;

}


function formToObject(form) {

  return Object.fromEntries(
    new FormData(form).entries()
  );

}


function llenarSelect(
  id,
  valores,
  textoInicial = 'Seleccionar...'
) {

  const select =
    document.getElementById(id);

  if (!select) {
    return;
  }

  select.innerHTML =
    `<option value="">
      ${textoInicial}
    </option>`;

  valores.forEach(valor => {

    const option =
      document.createElement('option');

    option.value = valor;

    option.textContent = valor;

    select.appendChild(option);

  });

}


function mostrarMensaje(
  id,
  mensaje,
  error = false
) {

  const element =
    document.getElementById(id);

  element.textContent = mensaje;

  element.className =
    error
      ? 'message error'
      : 'message success';

}


function configurarNavegacion() {

  const buttons =
    document.querySelectorAll(
      'nav button'
    );

  buttons.forEach(button => {

    button.addEventListener(
      'click',
      () => {

        document
          .querySelectorAll('.view')
          .forEach(
            section =>
              section.classList.add(
                'hidden'
              )
          );

        document
          .getElementById(
            button.dataset.view
          )
          .classList.remove(
            'hidden'
          );

        buttons.forEach(
          b =>
            b.classList.remove(
              'active'
            )
        );

        button.classList.add(
          'active'
        );

      }
    );

  });

}


function cargarProcesosEnSelects() {

  const opciones =
    DATA.procesos.map(
      proceso => {

        return {
          id:
            proceso.ID_Proceso,

          texto:
            `${proceso.ID_Proceso} — ${proceso.Nombre_Proceso}`

        };

      }
    );


  const selects = [
    'candidaturaProceso',
    'filtroProceso'
  ];


  selects.forEach(id => {

    const select =
      document.getElementById(id);

    if (!select) {
      return;
    }

    select.innerHTML =
      '<option value="">Todos los procesos</option>';

    opciones.forEach(
      opcion => {

        const option =
          document.createElement(
            'option'
          );

        option.value =
          opcion.id;

        option.textContent =
          opcion.texto;

        select.appendChild(
          option
        );

      }
    );

  });

}


function cargarCandidaturas() {

  const selects = [
    'estadoCandidatura',
    'entrevistaCandidatura',
    'contratacionCandidatura'
  ];


  selects.forEach(id => {

    const select =
      document.getElementById(id);

    if (!select) {
      return;
    }

    select.innerHTML =
      '<option value="">Seleccionar candidatura...</option>';


    DATA.candidaturas.forEach(
      candidatura => {

        const option =
          document.createElement(
            'option'
          );

        option.value =
          candidatura.ID_Candidatura;

        option.textContent =
          `${candidatura.ID_Candidatura} — ` +
          `${candidatura.ID_Proceso} — ` +
          `${candidatura.Sexo} — ` +
          `${candidatura.Estado_Actual}`;

        select.appendChild(
          option
        );

      }
    );

  });

}


function renderDashboard(data) {

  const metricas = [

    [
      'Vacantes',
      data.vacantes
    ],

    [
      'Candidaturas',
      data.candidaturas
    ],

    [
      'Preseleccionadas',
      data.preseleccionadas
    ],

    [
      'Entrevistas',
      data.entrevistas
    ],

    [
      'Seleccionadas',
      data.seleccionadas
    ],

    [
      'Contrataciones',
      data.contrataciones
    ]

  ];


  const container =
    document.getElementById(
      'metricas'
    );


  container.innerHTML =
    metricas
      .map(
        item => `

          <div class="metric-card">

            <div>
              ${item[0]}
            </div>

            <strong>
              ${item[1]}
            </strong>

          </div>

        `
      )
      .join('');


  document
    .getElementById('tablaSexo')
    .innerHTML = `

      <table>

        <thead>

          <tr>
            <th>Indicador</th>
            <th>Mujeres</th>
            <th>Hombres</th>
          </tr>

        </thead>

        <tbody>

          <tr>
            <td>Candidaturas</td>
            <td>${data.candidaturasMujeres}</td>
            <td>${data.candidaturasHombres}</td>
          </tr>

          <tr>
            <td>Preseleccionadas</td>
            <td>${data.preseleccionadasMujeres}</td>
            <td>${data.preseleccionadasHombres}</td>
          </tr>

          <tr>
            <td>Entrevistas</td>
            <td>${data.entrevistasMujeres}</td>
            <td>${data.entrevistasHombres}</td>
          </tr>

          <tr>
            <td>Seleccionadas</td>
            <td>${data.seleccionadasMujeres}</td>
            <td>${data.seleccionadasHombres}</td>
          </tr>

          <tr>
            <td>Contrataciones</td>
            <td>${data.contratacionesMujeres}</td>
            <td>${data.contratacionesHombres}</td>
          </tr>

        </tbody>

      </table>

      <div class="ratios">

        <p>
          Ratio de preselección:
          ${(data.ratioPreseleccion * 100).toFixed(1)}%
        </p>

        <p>
          Ratio de entrevista:
          ${(data.ratioEntrevista * 100).toFixed(1)}%
        </p>

        <p>
          Ratio de contratación:
          ${(data.ratioContratacion * 100).toFixed(1)}%
        </p>

      </div>

    `;

}


async function actualizarDashboard() {

  const proceso =
    document.getElementById(
      'filtroProceso'
    ).value;

  const dashboard =
    await apiGet(
      'dashboard',
      proceso
        ? { proceso }
        : {}
    );

  renderDashboard(
    dashboard
  );

}


async function recargarDatos() {

  DATA.procesos =
    await apiGet(
      'procesos'
    );

  DATA.candidaturas =
    await apiGet(
      'candidaturas'
    );

  cargarProcesosEnSelects();

  cargarCandidaturas();

  await actualizarDashboard();

}


async function enviarFormulario(
  form,
  accion,
  mensajeId
) {

  try {

    const datos =
      formToObject(form);

    await apiPost(
      accion,
      datos
    );

    mostrarMensaje(
      mensajeId,
      'Operación realizada correctamente.'
    );

    form.reset();

    await recargarDatos();

  } catch (error) {

    mostrarMensaje(
      mensajeId,
      error.message,
      true
    );

  }

}


async function inicializar() {

  configurarNavegacion();


  DATA =
    await apiGet(
      'init'
    );


  cargarProcesosEnSelects();

  cargarCandidaturas();


  llenarSelect(
    'faseInicial',
    DATA.catalogos.Fases_Proceso
  );


  llenarSelect(
    'candidaturaSexo',
    DATA.catalogos.Sexos
  );


  llenarSelect(
    'candidaturaFuente',
    DATA.catalogos.Fuentes_Candidatura
  );


  llenarSelect(
    'nuevoEstado',
    DATA.catalogos.Estados_Candidatura
  );


  llenarSelect(
    'estadoEntrevista',
    DATA.catalogos.Estados_Entrevista
  );


  llenarSelect(
    'resultadoEntrevista',
    DATA.catalogos.Resultados_Entrevista
  );


  llenarSelect(
    'estadoContrato',
    DATA.catalogos.Estados_Contrato
  );


  renderDashboard(
    DATA.dashboard
  );


  document
    .getElementById(
      'filtroProceso'
    )
    .addEventListener(
      'change',
      actualizarDashboard
    );


  document
    .getElementById(
      'formProceso'
    )
    .addEventListener(
      'submit',
      event => {

        event.preventDefault();

        enviarFormulario(
          event.target,
          'crearProceso',
          'mensajeProceso'
        );

      }
    );


  document
    .getElementById(
      'formCandidatura'
    )
    .addEventListener(
      'submit',
      event => {

        event.preventDefault();

        enviarFormulario(
          event.target,
          'crearCandidatura',
          'mensajeCandidatura'
        );

      }
    );


  document
    .getElementById(
      'formEstado'
    )
    .addEventListener(
      'submit',
      event => {

        event.preventDefault();

        enviarFormulario(
          event.target,
          'cambiarEstado',
          'mensajeEstado'
        );

      }
    );


  document
    .getElementById(
      'formEntrevista'
    )
    .addEventListener(
      'submit',
      event => {

        event.preventDefault();

        enviarFormulario(
          event.target,
          'crearEntrevista',
          'mensajeEntrevista'
        );

      }
    );


  document
    .getElementById(
      'formContratacion'
    )
    .addEventListener(
      'submit',
      event => {

        event.preventDefault();

        enviarFormulario(
          event.target,
          'crearContratacion',
          'mensajeContratacion'
        );

      }
    );

}


document.addEventListener(
  'DOMContentLoaded',
  () => {

    inicializar()
      .catch(
        error => {

          console.error(error);

          alert(
            'No se pudo conectar con la API: ' +
            error.message
          );

        }
      );

  }
);
