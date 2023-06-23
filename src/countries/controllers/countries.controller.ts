import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
} from '@nestjs/common';
import { CountriesService } from './../services/countries.service';
import { CreateCountryDto } from './../dto/create-country.dto';
import { UpdateCountryDto } from './../dto/update-country.dto';

@Controller('countries')
export class CountriesController {
    constructor(private readonly countriesService: CountriesService) {}

    @Post()
    create(@Body() createCountryDto: CreateCountryDto) {
        return this.countriesService.create(createCountryDto);
    }

    @Get()
    findAll() {
        return this.countriesService.findAll();
    }
}
