import { Module } from '@nestjs/common';
import { CountriesModule } from './countries/countries.module';
import { SoapServiceModule } from './soap-services/soap-service.module';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

import { enviroments } from './enviroments';
import config from './config';

@Module({
    imports: [
        ConfigModule.forRoot({
            /**
             * Realizamos la importación de forma dinámica de las variables de entorno con 'enviroments[process.env.NODE_ENV]'
             * según lo que se especifique al correr la app.
             * Por defecto, sí no se le especifica nada, levantará el archivo de entorno '.develop.env'
             */
            envFilePath: enviroments[process.env.NODE_ENV] || '.develop.env',
            load: [config],
            isGlobal: true,
            // Tipado de las varriables de entorno y obligatoriass.
            validationSchema: Joi.object({
                SOAP_CLIENT_NAME: Joi.string().required(),
                SOAP_URI: Joi.string().required(),
            }),
        }),
        CountriesModule,
        SoapServiceModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
