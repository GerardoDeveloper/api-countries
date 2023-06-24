import { Controller, Get, Query } from '@nestjs/common';

import { CountriesService } from './../services/countries.service';
import { FilterCountryDto } from './../dto/filter-country.dto';

@Controller('countries')
export class CountriesController {
    constructor(private readonly countriesService: CountriesService) {}

    @Get()
    findAll(@Query() params: FilterCountryDto) {
        return this.countriesService.findAll(params);
    }
}
