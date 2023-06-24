import { registerAs } from '@nestjs/config';

export default registerAs('config', () => {
    return {
        soapCountries: {
            clientName: process.env.SOAP_CLIENT_NAME,
            uri: process.env.SOAP_URI,
        },
    };
});
