import { Global, Module } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { SoapModule, SoapModuleOptions } from 'nestjs-soap';

import config from './../config';

@Global()
@Module({
    imports: [
        SoapModule.forRootAsync({
            inject: [config.KEY],
            clientName: 'SOAP_COUNTRIES',
            useFactory: async (
                configService: ConfigType<typeof config>,
            ): Promise<SoapModuleOptions> => {
                const { clientName, uri } = configService.soapCountries;

                return {
                    clientName,
                    uri,
                };
            },
        }),
    ],
    exports: [SoapModule],
})
export class SoapServiceModule {}
