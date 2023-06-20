import { registerAs } from '@nestjs/config';

export default registerAs('config', () => {
    return {
        soap: {
            uri: 'http://webservices.oorsprong.org/websamples.countryinfo/CountryInfoService.wso?wsdl',
        },
    };
});
