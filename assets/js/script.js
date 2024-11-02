let chartInstance; // Variable para almacenar la instancia del gráfico

async function getMonedas(moneda) {
  const endpoint = "https://mindicador.cl/api/" + moneda;
  const res = await fetch(endpoint);
  const indicadores = await res.json();
  return Number(indicadores.serie[0].valor);
}

async function getMonedas_Historico(moneda) {
  const endpoint = "https://mindicador.cl/api/" + moneda;
  const res = await fetch(endpoint);
  const indicadores = await res.json();
  return indicadores.serie;
}

async function prepararConfiguracionParaLaGrafica(moneda) {
  const monedas = await getMonedas_Historico(moneda);
  const nombreFechas = monedas
    .map((dia) => dia.fecha.substring(0, 10))
    .slice(0, 10)
    .reverse();
  const valores = monedas
    .map((dia) => dia.valor)
    .slice(0, 10)
    .reverse();

  return {
    type: "line",
    data: {
      labels: nombreFechas,
      datasets: [
        {
          label: `Historial de ${moneda}`,
          backgroundColor: "rgb(255, 99, 132)",
          data: valores,
          fill: false,
        },
      ],
    },
  };
}

async function renderGrafica(moneda) {
  const config = await prepararConfiguracionParaLaGrafica(moneda);
  const chartDOM = document.getElementById("myChart");

  // Si ya existe un gráfico, destrúyelo
  if (chartInstance) {
    chartInstance.destroy();
  }

  // Crea un nuevo gráfico
  chartInstance = new Chart(chartDOM, config);
  chartDOM.style.display = "block"; // Muestra el canvas
}

document
  .querySelector(".bton_buscar")
  .addEventListener("click", async function (event) {
    try {
      event.preventDefault(); // Previene el comportamiento por defecto del formulario

      const cantidad_pesos_clp = document.querySelector(".pesos_clp").value;
      const tipo_de_moneda = document.querySelector(".tipo_de_moneda").value;

      const valor_actual_TC = await getMonedas(tipo_de_moneda);
      const division = cantidad_pesos_clp / valor_actual_TC;

      const resultadoAproximado = Math.round(division * 100) / 100;
      const resultadoFormateado = resultadoAproximado.toFixed(2);

      document.querySelector(".resultado").innerHTML =
        `<h2>Resultado: $${resultadoFormateado} <h2/>`;

      // Renderiza el gráfico
      await renderGrafica(tipo_de_moneda);
      // Altera el estilo de fondo del gráfico
      const elemento = document.getElementById("myChart");
      elemento.style.backgroundColor = "white";
    } catch (e) {
      alert("ocurrio un error");
      document.querySelector(".resultado").innerHTML =
        `<h1> Algo salió mal durante la ejecuión!!! <h1/>`;
    }
  });
