const EMPRESAS = [
  {
    id: "calrenove",
    nombre: "Calrenove",
    logo: "img/logo-calrenove.png",
    color: "#cc092f",
    colorLight: "#e8304f",
    direccion: "Bizkaia"
  },
  {
    id: "norcaldera",
    nombre: "Norcaldera",
    logo: "img/logo-norcaldera.png",
    color: "#00917E",
    colorLight: "#00b89f",
    direccion: "Bizkaia"
  },
  {
    id: "calderas-calefaccion",
    nombre: "Calefacciones Mimetiz",
    logo: "img/logo-calderas.png",
    color: "#005691",
    colorLight: "#2d7fc1",
    direccion: ""
  }
];

const MODELOS = {
  empresa: EMPRESAS[0],
  marcas: [
    {
      id: "saunier-duval", nombre: "Saunier Duval",
      modelos: [
        { id: "hermann-micracom-24", nombre: "Hermann MicraCom Condens 24", descripcion: "Caldera de condensación Hermann MicraCom Condens 24-AS/1 (H-ES) Gas Natural. Transformable a propano.", precioBase: 1550.00, precioFinal: 1875.50, precioRedondeado: 1899,
          incluye: ["Desmontaje del aparato antiguo y montaje del nuevo en la misma ubicación","Retirada del aparato antiguo a punto limpio","Conexionado de fontanería, gas y electricidad","Conexionado de termostato ambiente existente","Kit de salida de humos (codo 90° + tramo terminal ~80cm) con evacuación a fachada o terraza abierta","Necesario desagüe de PVC cercano y accesible, o recipiente bajo la caldera"],
          noIncluye: ["Termostato modulante compatible","Cambio de ubicación del aparato","Trabajos de albañilería, pintura, etc."],
          opcionales: [{ nombre: "Termostato modulante ThermoLink select", precio: 96 }] },
        { id: "hermann-micracom-28", nombre: "Hermann MicraCom Condens 28", descripcion: "Caldera de condensación Hermann MicraCom Condens 28-AS/1 (H-ES) Gas Natural. Transformable a propano.", precioBase: 1726.45, precioFinal: 2089, precioRedondeado: 2089,
          incluye: ["Desmontaje del aparato antiguo y montaje del nuevo en la misma ubicación","Retirada del aparato antiguo a punto limpio","Conexionado de fontanería, gas y electricidad","Conexionado de termostato ambiente existente","Kit de salida de humos (codo 90° + tramo terminal ~80cm)"],
          noIncluye: ["Termostato modulante compatible","Cambio de ubicación del aparato","Trabajos de albañilería, pintura, etc."],
          opcionales: [{ nombre: "Termostato modulante ThermoLink select", precio: 96 }] },
        { id: "hermann-micraplus-25", nombre: "Hermann Micraplus 25", descripcion: "Caldera de condensación Hermann Micraplus 25-AS/1 (H-ES) Gas Natural.", precioBase: 1559.50, precioFinal: 1887, precioRedondeado: 1887,
          incluye: ["Desmontaje del aparato antiguo y montaje del nuevo en la misma ubicación","Retirada del aparato antiguo a punto limpio","Conexionado de fontanería, gas y electricidad","Kit de salida de humos"],
          noIncluye: ["Termostato","Cambio de ubicación del aparato","Trabajos de albañilería, pintura, etc."],
          opcionales: [] },
        { id: "hermann-micraplus-30", nombre: "Hermann Micraplus 30", descripcion: "Caldera de condensación Hermann Micraplus 30-AS/1 (H-ES) Gas Natural.", precioBase: 1652.07, precioFinal: 1999, precioRedondeado: 1999,
          incluye: ["Desmontaje del aparato antiguo y montaje del nuevo en la misma ubicación","Retirada del aparato antiguo a punto limpio","Conexionado de fontanería, gas y electricidad","Kit de salida de humos"],
          noIncluye: ["Termostato","Cambio de ubicación del aparato","Trabajos de albañilería, pintura, etc."],
          opcionales: [] },
        { id: "saunier-thelia-25", nombre: "Saunier Duval Thelia Condens 25", descripcion: "Caldera de condensación Saunier Duval Thelia Condens 25 Mixta Gas Natural.", precioBase: 1917.36, precioFinal: 2320, precioRedondeado: 2320,
          incluye: ["Desmontaje del aparato antiguo y montaje del nuevo en la misma ubicación","Retirada del aparato antiguo a punto limpio","Conexionado de fontanería, gas y electricidad","Kit de salida de humos y materiales para su instalación"],
          noIncluye: ["Termostato modulante","Cambio de ubicación del aparato","Trabajos de albañilería, pintura, etc."],
          opcionales: [{ nombre: "Termostato Modulante Room Thermostat HRT 50/2", precio: 102 }],
          notas: "El desagüe de los condensados se realizará en un recipiente ubicado bajo la caldera." },
        { id: "saunier-thema-26-cable", nombre: "Saunier Duval Thema MiConnect 26 Cableada", descripcion: "Caldera de condensación Saunier Duval Thema MiConnect® 26-CS/1-C (N-ES). Con termostato de control MiSet cableado.", precioBase: 2173.55, precioFinal: 2630, precioRedondeado: 2630,
          incluye: ["Desmontaje del aparato antiguo y montaje del nuevo en la misma ubicación","Retirada del aparato antiguo a punto limpio","Conexionado de fontanería, gas y electricidad","Kit de salida de humos y materiales para su instalación","Termostato de control MiSet cableado"],
          noIncluye: ["Cambio de ubicación del aparato","Trabajos de albañilería, pintura, etc."],
          opcionales: [],
          notas: "Este presupuesto incluye la instalación de la caldera en la ubicación de la caldera preexistente." },
        { id: "saunier-thema-31-radio", nombre: "Saunier Duval Thema MiConnect 31 MiSet Radio", descripcion: "Caldera de condensación Saunier Duval Thema MiConnect® 31-CS/1-Cf (N-ES). Con termostato de control MiSet radio.", precioBase: 2611.57, precioFinal: 3160, precioRedondeado: 3160,
          incluye: ["Desmontaje del aparato antiguo y montaje del nuevo en la misma ubicación","Retirada del aparato antiguo a punto limpio","Conexionado de fontanería, gas y electricidad","Kit de salida de humos y materiales para su instalación","Termostato de control MiSet radio"],
          noIncluye: ["Cambio de ubicación del aparato","Trabajos de albañilería, pintura, etc."],
          opcionales: [],
          notas: "Este presupuesto incluye la instalación de la caldera en la ubicación de la caldera preexistente." },
        { id: "saunier-thema-31-cable", nombre: "Saunier Duval Thema MiConnect 31 Cableada", descripcion: "Caldera de condensación Saunier Duval Thema MiConnect® 31-CS/1-C (N-ES). Con termostato de control MiSet cableado.", precioBase: 2561.57, precioFinal: 3099, precioRedondeado: 3099,
          incluye: ["Desmontaje del aparato antiguo y montaje del nuevo en la misma ubicación","Retirada del aparato antiguo a punto limpio","Conexionado de fontanería, gas y electricidad","Kit de salida de humos y materiales para su instalación","Termostato de control MiSet cableado"],
          noIncluye: ["Cambio de ubicación del aparato","Trabajos de albañilería, pintura, etc."],
          opcionales: [],
          notas: "Este presupuesto incluye la instalación de la caldera en la ubicación de la caldera preexistente." },
        { id: "saunier-themafast-26-cable", nombre: "Saunier Duval ThemaFast MiConnect 26 Cableada", descripcion: "Caldera de condensación Saunier Duval ThemaFast MiConnect® MA 26-CS/1-C (N-ES). Con termostato de control MiSet cableado.", precioBase: 2230.58, precioFinal: 2699, precioRedondeado: 2699,
          incluye: ["Desmontaje del aparato antiguo y montaje del nuevo en la misma ubicación","Retirada del aparato antiguo a punto limpio","Conexionado de fontanería, gas y electricidad","Kit de salida de humos y materiales para su instalación","Termostato de control MiSet cableado"],
          noIncluye: ["Cambio de ubicación del aparato","Trabajos de albañilería, pintura, etc."],
          opcionales: [],
          notas: "Este presupuesto incluye la instalación de la caldera en la ubicación de la caldera preexistente." },
        { id: "saunier-themafast-26-radio", nombre: "Saunier Duval ThemaFast MiConnect 26 Miset Radio", descripcion: "Caldera de condensación Saunier Duval ThemaFast MiConnect® MA 26-CS/1-C (N-ES). Con termostato de control MiSet radio.", precioBase: 2271.90, precioFinal: 2749, precioRedondeado: 2749,
          incluye: ["Desmontaje del aparato antiguo y montaje del nuevo en la misma ubicación","Retirada del aparato antiguo a punto limpio","Conexionado de fontanería, gas y electricidad","Kit de salida de humos y materiales para su instalación","Termostato de control MiSet radio"],
          noIncluye: ["Cambio de ubicación del aparato","Trabajos de albañilería, pintura, etc."],
          opcionales: [],
          notas: "Este presupuesto incluye la instalación de la caldera en la ubicación de la caldera preexistente." },
        { id: "saunier-thematek-24", nombre: "Saunier Duval ThemaTek Condens 24", descripcion: "Caldera de condensación Saunier Duval ThemaTek Condens 24-AS/2-C (H-ES). La más compacta de Saunier Duval. Control modulante Exacontrol Select SRT50/2 incluido de serie.", precioBase: 1750.00, precioFinal: 2117.50, precioRedondeado: 2118,
          incluye: ["Desmontaje del aparato antiguo y montaje del nuevo en la misma ubicación","Retirada del aparato antiguo a punto limpio","Conexionado de fontanería, gas y electricidad","Conexionado de termostato ambiente","Kit de salida de humos (codo 90° + tramo terminal)"],
          noIncluye: ["Cambio de ubicación del aparato","Trabajos de albañilería, pintura, etc."],
          opcionales: [{ nombre: "Módulo MiGo Link para conexión WiFi", precio: 120 }],
          notas: "Incluye control modulante Exacontrol Select SRT50/2 cableado de serie." },
        { id: "saunier-thematek-28", nombre: "Saunier Duval ThemaTek Condens 28", descripcion: "Caldera de condensación Saunier Duval ThemaTek Condens 28-AS/2-C (H-ES). La más compacta de Saunier Duval. Control modulante Exacontrol Select SRT50/2 incluido de serie.", precioBase: 1900.00, precioFinal: 2299.00, precioRedondeado: 2299,
          incluye: ["Desmontaje del aparato antiguo y montaje del nuevo en la misma ubicación","Retirada del aparato antiguo a punto limpio","Conexionado de fontanería, gas y electricidad","Conexionado de termostato ambiente","Kit de salida de humos (codo 90° + tramo terminal)"],
          noIncluye: ["Cambio de ubicación del aparato","Trabajos de albañilería, pintura, etc."],
          opcionales: [{ nombre: "Módulo MiGo Link para conexión WiFi", precio: 120 }],
          notas: "Incluye control modulante Exacontrol Select SRT50/2 cableado de serie." }
      ]
    },
    {
      id: "vaillant", nombre: "Vaillant",
      modelos: [
        { id: "vaillant-ecotec-26-cable", nombre: "Vaillant ecoTEC Plus 26 Cableada", descripcion: "Caldera de condensación Vaillant ecoTEC plus VMW 26 CS/1-5 C. Incluye termostato SensoHome cableado de serie.", precioBase: 2175.21, precioFinal: 2749, precioRedondeado: 2749,
          incluye: ["Desmontaje del aparato antiguo y montaje del nuevo en la misma ubicación","Retirada del aparato antiguo a punto limpio","Conexionado de fontanería, gas y electricidad","Kit de salida de humos y materiales para su instalación","Termostato SensoHome cableado de serie"],
          noIncluye: ["Cambio de ubicación del aparato","Trabajos de albañilería, pintura, etc."],
          opcionales: [],
          notas: "Este presupuesto incluye la instalación de la caldera en la ubicación de la caldera preexistente." },
        { id: "vaillant-ecotec-plus-26-radio", nombre: "Vaillant ecoTEC Plus radio VMW 26 CS/1-5 CF R1", descripcion: "Caldera mural mixta de condensación Vaillant ecoTEC plus VMW 26 CS/1-5 CF R1. Incluye termostato radio de serie.", precioBase: 2220.00, precioFinal: 2799, precioRedondeado: 2799,
          incluye: ["Desmontaje del aparato antiguo y montaje del nuevo en la misma ubicación","Retirada del aparato antiguo a punto limpio","Conexionado de fontanería, gas y electricidad","Kit de salida de humos y materiales para su instalación","Termostato radio de serie"],
          noIncluye: ["Cambio de ubicación del aparato","Trabajos de albañilería, pintura, etc."],
          opcionales: [],
          notas: "Este presupuesto incluye la instalación de la caldera en la ubicación de la caldera preexistente." },
        { id: "vaillant-ecotec-32-cable", nombre: "Vaillant ecoTEC Plus 32 Cableada", descripcion: "Caldera de condensación Vaillant ecoTEC plus VMW 32 CS/1-5 C (N-ES). Incluye termostato SensoHome cableado de serie.", precioBase: 2420.00, precioFinal: 2899, precioRedondeado: 2899,
          incluye: ["Desmontaje del aparato antiguo y montaje del nuevo en la misma ubicación","Retirada del aparato antiguo a punto limpio","Conexionado de fontanería, gas y electricidad","Kit de salida de humos y materiales para su instalación","Termostato SensoHome cableado de serie"],
          noIncluye: ["Cambio de ubicación del aparato","Trabajos de albañilería, pintura, etc."],
          opcionales: [],
          notas: "Este presupuesto incluye la instalación de la caldera en la ubicación de la caldera preexistente." },
        { id: "vaillant-ecotec-32-radio", nombre: "Vaillant ecoTEC Plus radio VMW 32 CS/1-5 Cf (N-ES)", descripcion: "Caldera de condensación Vaillant ecoTEC plus VMW 32 CS/1-5 Cf (N-ES). Incluye termostato SensoHome radio de serie.", precioBase: 2465.00, precioFinal: 2949, precioRedondeado: 2949,
          incluye: ["Desmontaje del aparato antiguo y montaje del nuevo en la misma ubicación","Retirada del aparato antiguo a punto limpio","Conexionado de fontanería, gas y electricidad","Kit de salida de humos y materiales para su instalación","Termostato SensoHome radio de serie"],
          noIncluye: ["Cambio de ubicación del aparato","Trabajos de albañilería, pintura, etc."],
          opcionales: [],
          notas: "Este presupuesto incluye la instalación de la caldera en la ubicación de la caldera preexistente." },
        { id: "vaillant-ecotec-36-radio", nombre: "Vaillant ecoTEC Plus radio VMW 36 CS/1-5 Cf (N-ES)", descripcion: "Caldera de condensación Vaillant ecoTEC plus VMW 36 CS/1-5 Cf (N-ES). Incluye termostato SensoHome radio de serie.", precioBase: 2599.00, precioFinal: 3099, precioRedondeado: 3099,
          incluye: ["Desmontaje del aparato antiguo y montaje del nuevo en la misma ubicación","Retirada del aparato antiguo a punto limpio","Conexionado de fontanería, gas y electricidad","Kit de salida de humos y materiales para su instalación","Termostato SensoHome radio de serie"],
          noIncluye: ["Cambio de ubicación del aparato","Trabajos de albañilería, pintura, etc."],
          opcionales: [],
          notas: "Este presupuesto incluye la instalación de la caldera en la ubicación de la caldera preexistente." },
        { id: "vaillant-ecotec-36-cable", nombre: "Vaillant ecoTEC Plus 36 Cableada", descripcion: "Caldera de condensación Vaillant ecoTEC plus VMW 36 CS/1-5 C (N-ES). Incluye termostato SensoHome cableado de serie.", precioBase: 2550.00, precioFinal: 3049, precioRedondeado: 3049,
          incluye: ["Desmontaje del aparato antiguo y montaje del nuevo en la misma ubicación","Retirada del aparato antiguo a punto limpio","Conexionado de fontanería, gas y electricidad","Kit de salida de humos y materiales para su instalación","Termostato SensoHome cableado de serie"],
          noIncluye: ["Cambio de ubicación del aparato","Trabajos de albañilería, pintura, etc."],
          opcionales: [],
          notas: "Este presupuesto incluye la instalación de la caldera en la ubicación de la caldera preexistente." },
        { id: "vaillant-ecotec-intro-24", nombre: "Vaillant ecoTEC intro VMW 24/24", descripcion: "Caldera de condensación Vaillant ecoTEC intro VMW 24/24 AS/2-1C (H-ES). Ultracompacta. Control modulante sensoROOM pure VRT50/2 incluido de serie.", precioBase: 1700.00, precioFinal: 2057.00, precioRedondeado: 2057,
          incluye: ["Desmontaje del aparato antiguo y montaje del nuevo en la misma ubicación","Retirada del aparato antiguo a punto limpio","Conexionado de fontanería, gas y electricidad","Conexionado de termostato ambiente","Kit de salida de humos y materiales para su instalación"],
          noIncluye: ["Cambio de ubicación del aparato","Trabajos de albañilería, pintura, etc."],
          opcionales: [],
          notas: "Incluye control modulante sensoROOM pure VRT50/2 cableado de serie." },
        { id: "vaillant-ecotec-intro-28", nombre: "Vaillant ecoTEC intro VMW 28/28", descripcion: "Caldera de condensación Vaillant ecoTEC intro VMW 28/28 AS/2-1C (H-ES). Ultracompacta. Control modulante sensoROOM pure VRT50/2 incluido de serie.", precioBase: 1850.00, precioFinal: 2238.50, precioRedondeado: 2239,
          incluye: ["Desmontaje del aparato antiguo y montaje del nuevo en la misma ubicación","Retirada del aparato antiguo a punto limpio","Conexionado de fontanería, gas y electricidad","Conexionado de termostato ambiente","Kit de salida de humos y materiales para su instalación"],
          noIncluye: ["Cambio de ubicación del aparato","Trabajos de albañilería, pintura, etc."],
          opcionales: [],
          notas: "Incluye control modulante sensoROOM pure VRT50/2 cableado de serie." }
      ]
    },
    {
      id: "protherm", nombre: "Protherm",
      modelos: [
        { id: "protherm-puma-24", nombre: "Protherm Puma 18/24", descripcion: "Caldera de condensación Protherm Puma 18/24 MKV-AS/1 (H-ES) Gas Natural.", precioBase: 1569.42, precioFinal: 1899, precioRedondeado: 1899,
          incluye: ["Desmontaje del aparato antiguo y montaje del nuevo en la misma ubicación","Retirada del aparato antiguo a punto limpio","Conexionado de fontanería, gas y electricidad","Kit de salida de humos y materiales para su instalación"],
          noIncluye: ["Termostato","Cambio de ubicación del aparato","Trabajos de albañilería, pintura, etc."],
          opcionales: [{ nombre: "Termostato Modulante ThermoLink select", precio: 96 }] }
      ]
    },
    {
      id: "junkers-bosch", nombre: "Junkers / Bosch",
      modelos: [
        { id: "junkers-4300i-24-25", nombre: "Junkers Condens 4300i W 24/25", descripcion: "Caldera de condensación Junkers Condens 4300i W 24-25 Gas Natural.", precioBase: 1871.90, precioFinal: 2265, precioRedondeado: 2265,
          incluye: ["Desmontaje del aparato antiguo y montaje del nuevo en la misma ubicación","Retirada del aparato antiguo a punto limpio","Conexionado de fontanería, gas y electricidad","Kit de salida de humos"],
          noIncluye: ["Termostato","Cambio de ubicación del aparato","Trabajos de albañilería, pintura, etc."], opcionales: [] },
        { id: "bosch-4300iw-24-30", nombre: "Bosch Condens 4300iW 24/30", descripcion: "Caldera de condensación Bosch Condens 4300iW 24-30 Gas Natural.", precioBase: 2032.23, precioFinal: 2459, precioRedondeado: 2459,
          incluye: ["Desmontaje del aparato antiguo y montaje del nuevo en la misma ubicación","Retirada del aparato antiguo a punto limpio","Conexionado de fontanería, gas y electricidad","Kit de salida de humos"],
          noIncluye: ["Termostato","Cambio de ubicación del aparato","Trabajos de albañilería, pintura, etc."], opcionales: [] },
        { id: "bosch-gc1200w-20-24", nombre: "Bosch Condens GC1200W 20-24 C23", descripcion: "Caldera de condensación Bosch Condens GC1200W 20-24 C23 Gas Natural.", precioBase: 1635.54, precioFinal: 1979, precioRedondeado: 1979,
          incluye: ["Desmontaje del aparato antiguo y montaje del nuevo en la misma ubicación","Retirada del aparato antiguo a punto limpio","Conexionado de fontanería, gas y electricidad","Kit de salida de humos"],
          noIncluye: ["Termostato","Cambio de ubicación del aparato","Trabajos de albañilería, pintura, etc."], opcionales: [] },
        { id: "bosch-gc1200w-24-30", nombre: "Bosch Condens GC1200W 24-30 C23", descripcion: "Caldera de condensación Bosch Condens GC1200W 24-30 C23 Gas Natural.", precioBase: 1776.03, precioFinal: 2149, precioRedondeado: 2149,
          incluye: ["Desmontaje del aparato antiguo y montaje del nuevo en la misma ubicación","Retirada del aparato antiguo a punto limpio","Conexionado de fontanería, gas y electricidad","Kit de salida de humos"],
          noIncluye: ["Termostato","Cambio de ubicación del aparato","Trabajos de albañilería, pintura, etc."], opcionales: [] }
      ]
    },
    {
      id: "ariston", nombre: "Ariston",
      modelos: [
        { id: "ariston-clas-one-24", nombre: "Ariston Clas One wifi 24FFEU", descripcion: "Caldera de condensación Ariston Clas One wifi 24FFEU Gas Natural.", precioBase: 1600.00, precioFinal: 1936.00, precioRedondeado: 1936,
          incluye: ["Desmontaje del aparato antiguo y montaje del nuevo en la misma ubicación","Retirada del aparato antiguo a punto limpio","Conexionado de fontanería, gas y electricidad","Kit de salida de humos"],
          noIncluye: ["Cambio de ubicación del aparato","Trabajos de albañilería, pintura, etc."], opcionales: [] },
        { id: "ariston-clas-one-30", nombre: "Ariston Clas One wifi 30FFEU", descripcion: "Caldera de condensación Ariston Clas One wifi 30FFEU Gas Natural.", precioBase: 1750.00, precioFinal: 2117.50, precioRedondeado: 2118,
          incluye: ["Desmontaje del aparato antiguo y montaje del nuevo en la misma ubicación","Retirada del aparato antiguo a punto limpio","Conexionado de fontanería, gas y electricidad","Kit de salida de humos"],
          noIncluye: ["Cambio de ubicación del aparato","Trabajos de albañilería, pintura, etc."], opcionales: [] },
        { id: "ariston-clas-one-35", nombre: "Ariston Clas One wifi 35FFEU", descripcion: "Caldera de condensación Ariston Clas One wifi 35FFEU Gas Natural.", precioBase: 1900.00, precioFinal: 2299.00, precioRedondeado: 2299,
          incluye: ["Desmontaje del aparato antiguo y montaje del nuevo en la misma ubicación","Retirada del aparato antiguo a punto limpio","Conexionado de fontanería, gas y electricidad","Kit de salida de humos"],
          noIncluye: ["Cambio de ubicación del aparato","Trabajos de albañilería, pintura, etc."], opcionales: [] }
      ]
    },
    {
      id: "kosner", nombre: "Kosner",
      modelos: [
        { id: "kosner-titan-hr-24-28", nombre: "Kosner Titan HR 24-28", descripcion: "Caldera de condensación Kosner Titan HR 24-28 Gas Natural.", precioBase: 1450.00, precioFinal: 1754.50, precioRedondeado: 1755,
          incluye: ["Desmontaje del aparato antiguo y montaje del nuevo en la misma ubicación","Retirada del aparato antiguo a punto limpio","Conexionado de fontanería, gas y electricidad","Kit de salida de humos"],
          noIncluye: ["Termostato","Cambio de ubicación del aparato","Trabajos de albañilería, pintura, etc."], opcionales: [] },
        { id: "kosner-titan-hr-30-36", nombre: "Kosner Titan HR 30-36", descripcion: "Caldera de condensación Kosner Titan HR 30-36 Gas Natural.", precioBase: 1600.00, precioFinal: 1936.00, precioRedondeado: 1936,
          incluye: ["Desmontaje del aparato antiguo y montaje del nuevo en la misma ubicación","Retirada del aparato antiguo a punto limpio","Conexionado de fontanería, gas y electricidad","Kit de salida de humos"],
          noIncluye: ["Termostato","Cambio de ubicación del aparato","Trabajos de albañilería, pintura, etc."], opcionales: [] }
      ]
    },
    {
      id: "warmhaus", nombre: "Warmhaus",
      modelos: [
        { id: "warmhaus-enerwa-33-40", nombre: "Warmhaus Enerwa 33-40", descripcion: "Caldera de condensación Warmhaus Enerwa 33-40 Gas Natural.", precioBase: 1700.00, precioFinal: 2057.00, precioRedondeado: 2057,
          incluye: ["Desmontaje del aparato antiguo y montaje del nuevo en la misma ubicación","Retirada del aparato antiguo a punto limpio","Conexionado de fontanería, gas y electricidad","Kit de salida de humos"],
          noIncluye: ["Termostato","Cambio de ubicación del aparato","Trabajos de albañilería, pintura, etc."], opcionales: [] },
        { id: "warmhaus-minerwa-25-31", nombre: "Warmhaus Minerwa 25-31", descripcion: "Caldera de condensación Warmhaus Minerwa 25-31 Gas Natural.", precioBase: 1550.00, precioFinal: 1875.50, precioRedondeado: 1876,
          incluye: ["Desmontaje del aparato antiguo y montaje del nuevo en la misma ubicación","Retirada del aparato antiguo a punto limpio","Conexionado de fontanería, gas y electricidad","Kit de salida de humos"],
          noIncluye: ["Termostato","Cambio de ubicación del aparato","Trabajos de albañilería, pintura, etc."], opcionales: [] }
      ]
    }
  ]
};
