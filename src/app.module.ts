import { Module } from '@nestjs/common';
import { CountriesModule } from './countries/countries.module';
import { SoapServiceModule } from './soap-services/soap-service.module';

@Module({
    imports: [CountriesModule, SoapServiceModule],
    controllers: [],
    providers: [],
})
export class AppModule {}
