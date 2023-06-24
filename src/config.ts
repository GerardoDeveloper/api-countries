import { registerAs } from '@nestjs/config';

/**
 * Archivo de configuración de los distintos servicios.
 * Esto permite tener tantos servicios dentro de la app como se desee.
 */
export default registerAs('config', () => {
    return {
        soapCountries: {
            clientName: process.env.SOAP_CLIENT_NAME,
            uri: process.env.SOAP_URI,
        },
    };
});
