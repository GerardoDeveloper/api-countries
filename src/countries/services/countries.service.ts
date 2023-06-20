import { Inject, Injectable } from '@nestjs/common';
import { Client } from 'nestjs-soap';

import { CreateCountryDto } from './../dto/create-country.dto';
import { UpdateCountryDto } from './../dto/update-country.dto';
import { Country } from '../models/country.models';
import { CountryInformation } from '../models/country-info.models';
import { CurrencyName } from '../models/currency-name.models';
import { ContinentByName } from '../models/continent-by-name.models';

@Injectable()
export class CountriesService {
    constructor(
        @Inject('SOAP_COUNTRIES') private readonly soapClient: Client,
    ) {}

    create(payload: CreateCountryDto) {
        return 'This action adds a new country';
    }

    async findAll() {
        return this.getInformationCountries().catch((error) => error);
    }

    /**
     * Obtiene toda la información de los paises.
     * @returns
     */
    private async getInformationCountries(): Promise<Country[]> {
        try {
            const response = await new Promise((resolve, reject) => {
                this.soapClient.ListOfCountryNamesByName(
                    {},
                    (error, result) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(result);
                        }
                    },
                );
            });

            // Filtrado y limpieza de información de los datos devueltos por el servicio.
            const countries: Country[] = Object.values(response).flatMap(
                (item) => {
                    return item.tCountryCodeAndName.map((country) => {
                        const informationCountries = {
                            sISOCode: country.sISOCode,
                            sName: country.sName,
                        };

                        return informationCountries;
                    });
                },
            );

            this.getInformationCountriesByCode(countries);
            return countries;
        } catch (error) {
            console.log('Ha ocurrido la siguiente excepción: ', error);
        }
    }

    /**
     * Obtiene la informaciónde los paises por código.
     * @param informationCountries Información de los países.
     * @returns
     */
    private async getInformationCountriesByCode(
        informationCountries: Country[],
    ) {
        try {
            const promises: Promise<CountryInformation>[] =
                informationCountries.map((item) => {
                    const args = { sCountryISOCode: item.sISOCode };

                    return new Promise((resolve, reject) => {
                        this.soapClient.FullCountryInfo(
                            args,
                            (error, result) => {
                                if (error) {
                                    reject(error);
                                } else {
                                    resolve(result);
                                }
                            },
                        );
                    });
                });

            const results: CountryInformation[] = await Promise.all(promises);

            const informationCountriesByCode = Object.values(results).flatMap(
                (item) => {
                    const newCountryInformationResult = {
                        sISOCode: item.FullCountryInfoResult.sISOCode,
                        sName: item.FullCountryInfoResult.sName,
                        sCapitalCity: item.FullCountryInfoResult.sCapitalCity,
                        sPhoneCode: item.FullCountryInfoResult.sPhoneCode,
                        sContinentCode:
                            item.FullCountryInfoResult.sContinentCode,
                        sCurrencyISOCode:
                            item.FullCountryInfoResult.sCurrencyISOCode,
                        sCountryFlag: item.FullCountryInfoResult.sCountryFlag,
                        Languages: item.FullCountryInfoResult.Languages,
                    };

                    return newCountryInformationResult;
                },
            );

            this.getCurrencyName(informationCountriesByCode);
            this.getInformationContinentsByName();
            return informationCountriesByCode;
        } catch (error) {
            console.log('Ha ocurrido la siguiente excepción: ', error);
        }
    }

    private async getInformationContinentsByName() {
        try {
            const response: ContinentByName[] = await new Promise(
                (resolve, reject) => {
                    this.soapClient.ListOfContinentsByName(
                        {},
                        (error, result) => {
                            if (error) {
                                reject(error);
                            } else {
                                resolve(result);
                            }
                        },
                    );
                },
            );

            const continent = Object.values(response);

            return continent;
        } catch (error) {
            console.log('Ha ocurrido la siguiente excepción: ', error);
        }
    }

    private async getCurrencyName(countryInformation) {
        const promises: Promise<CurrencyName>[] = countryInformation.map(
            (item) => {
                const args = { sCurrencyISOCode: item.sCurrencyISOCode };

                return new Promise((resolve, reject) => {
                    this.soapClient.CurrencyName(args, (error, result) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(result);
                        }
                    });
                });
            },
        );

        const results = await Promise.all(promises);
        const informationCurrencyName = results.map((item) => {
            const informationCurrency = {
                currency: item.CurrencyNameResult,
            };

            return informationCurrency;
        });

        return informationCurrencyName;
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
