import axios from 'axios';
import https from "https";
import {pool} from '../db.js'

export const url_endpoint = process.env.apirest_url;


// Configuración para ignorar certificados self-signed (equivalente al -k de curl)
const agent = new https.Agent({  
  rejectUnauthorized: false
});



// --- CONTROLADOR PARA EXPRESS ---
export const getValoresBCV = async (req, res) => {
    try {
    // 1. Ejecutar el Login para obtener el JWT
    console.log('Autenticando...');
    const loginResponse = await axios.get('https://tc.extra.bcv.org.ve/TipoCambioBCV/api/usuario/login', {
      httpsAgent: agent,
      auth: {
        username: 'INVITADO',
        password: 'INVITADO'
      }
    });

    // Extraer el token (ajusta la propiedad según la estructura exacta de la respuesta del BCV)
    // Usualmente viene en el cuerpo como { token: "..." } o en los headers
    console.log('✅ Respuesta de login recibida:');
    let fullToken = loginResponse.headers['authorization'];
    //console.log(fullToken);

    const token = fullToken.replace('Bearer ', '');
    //console.log('✅ Token extraído correctamente:', token);

    // 2. Usar el token en la siguiente petición
    console.log('Consultando tasas bancarias...');
    const tasasResponse = await axios.get('https://tc.extra.bcv.org.ve/TipoCambioBCV/api/Consultas/fechaOperacion', {
      httpsAgent: agent,
      headers: {
        'Authorization': fullToken,
        'Accept': 'application/json'
      }
    });
    

    console.log('Datos recibidos:');
    console.log(tasasResponse.data);

    const fechaOperacion = tasasResponse.data.FECHAOPERACION; // Ejemplo: "2024-06-14T00:00:00"
    const fechaValor = tasasResponse.data.tipoDolarTCRF[0].FECHAVALOR; // Ejemplo: "2024-06-14T00:00:00"
    //console.log(tasasResponse.data.tipoDolarTCRF[0].monedaTCREFs);
    console.log('✅ Fechas extraídas:');
    console.log('Fecha de Operación:', fechaOperacion);
    console.log('Fecha Valor:', fechaValor);

    // ... dentro de tu bloque try después de la petición de tasas
    const respuestaTasas = tasasResponse.data; // El JSON que pegaste

    let tasasFiltradas = '';

    if (respuestaTasas.tipoDolarTCRF[0].monedaTCREFs) {
        const todasLasMonedas = tasasResponse.data.tipoDolarTCRF[0].monedaTCREFs;
        const targets = ['COP', 'EUR', 'RUB', 'USD'];

        tasasFiltradas = todasLasMonedas
            .filter(m => targets.includes(m.SWIFT))
            .map(m => ({
                moneda: m.SWIFT,
                pais: m.PAIS,
                compra: m.BDCOMPRABID,
                venta: m.BDVENTAASK
            }));

        console.table(tasasFiltradas); // Esto lo mostrará en una bonita tabla en la consola
    }

    return res.status(200).json({
        estatus: '200',
        mensaje: '✅ Tasas obtenidas con éxito y almacenadas en la base de datos',
        fechaOperacion:fechaOperacion,
        fechaValor:fechaValor,
        valores: tasasFiltradas
    });

  } catch (error) {
    console.error('Error en la operación:', error.response ? error.response.data : error.message);
  }
};