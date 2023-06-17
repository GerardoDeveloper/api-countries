import { Injectable } from '@nestjs/common';
import { CreateCountryDto } from './../dto/create-country.dto';
import { UpdateCountryDto } from './../dto/update-country.dto';

@Injectable()
export class CountriesService {
    create(payload: CreateCountryDto) {
        return 'This action adds a new country';
    }

    findAll() {
        return `This action returns all countries`;
    }

    findOne(id: number) {
        return `This action returns a #${id} country`;
    }

    update(id: number, payload: UpdateCountryDto) {
        return `This action updates a #${id} country`;
    }

    remove(id: number) {
        return `This action removes a #${id} country`;
    }
}
