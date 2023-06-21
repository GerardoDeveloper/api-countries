import { Module } from '@nestjs/common';
import { SoapModule, SoapModuleOptions } from 'nestjs-soap';
import { ConfigModule, ConfigService, ConfigType } from '@nestjs/config';

import { CountriesService } from './services/countries.service';
import { CountriesController } from './controllers/countries.controller';
import config from './../config';

@Module({
    imports: [
        SoapModule.register({
            clientName: 'SOAP_COUNTRIES',
            uri: 'http://webservices.oorsprong.org/websamples.countryinfo/CountryInfoService.wso?wsdl',
        }),
    ],
    controllers: [CountriesController],
    providers: [CountriesService],
    exports: [SoapModule],
})
export class CountriesModule {}
