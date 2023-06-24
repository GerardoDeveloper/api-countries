import { Global, Module } from '@nestjs/common';
import { SoapModule } from 'nestjs-soap';

@Global()
@Module({
    imports: [
        SoapModule.register({
            clientName: 'SOAP_COUNTRIES',
            uri: 'http://webservices.oorsprong.org/websamples.countryinfo/CountryInfoService.wso?wsdl',
        }),
    ],
    exports: [SoapModule],
})
export class SoapServiceModule {}
