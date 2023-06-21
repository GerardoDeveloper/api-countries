import { Inject, Injectable } from '@nestjs/common';
import { Client } from 'nestjs-soap';
import * as cacheManager from 'cache-manager';

import { CreateCountryDto } from './../dto/create-country.dto';
import { UpdateCountryDto } from './../dto/update-country.dto';
import { Country } from '../models/country.models';
import { CountryInformationByCode } from '../models/country-info.models';
import { CurrencyName } from '../models/currency-name.models';
import { InformationContinentsByName } from '../models/continent-by-name.models';
import { InformationsCountries } from '../models/informations-coutries.models';

@Injectable()
export class CountriesService {
    constructor(
        @Inject('SOAP_COUNTRIES') private readonly soapClient: Client,
    ) {}

    create(payload: CreateCountryDto) {
        return 'This action adds a new country';
    }

    async findAll() {
        const informationCountries = await this.getInformationCountries();
        const informationContinentsByName =
            await this.getInformationContinentsByName();

        informationCountries.forEach(async (country) => {
            const informationCountriesByCode =
                await this.getInformationCountriesByCode(country.sISOCode);

            informationCountriesByCode.forEach(async (countriesByCode) => {
                const listInformationFinal: InformationsCountries[] = [];

                informationContinentsByName.forEach(
                    async (continentsByName) => {
                        const currencyName = await this.getCurrencyName(
                            countriesByCode.sCurrencyISOCode,
                        );

                        currencyName.forEach((currency) => {
                            listInformationFinal.push({
                                code: country.sISOCode,
                                name: country.sName,
                                capitalCity: countriesByCode.sCapitalCity,
                                phoneCode: parseInt(countriesByCode.sPhoneCode),
                                continent: {
                                    code: continentsByName.sCode,
                                    name: continentsByName.sName,
                                },
                                currency: {
                                    code: countriesByCode.sCurrencyISOCode,
                                    name: currency.currencyName,
                                },
                                flag: countriesByCode.sCountryFlag,
                                languages: countriesByCode.Languages,
                            });
                        });
                        console.log(
                            JSON.stringify(listInformationFinal, null, 4),
                        );
                    },
                );
            });
        });

        return `Return all countries`;
    }

    /**
     * Obtiene toda la información de los paises.
     * @returns
     */
    private async getInformationCountries(): Promise<Country[]> {
        try {
            const promise = await new Promise((resolve, reject) => {
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
            const countries: Country[] = Object.values(promise).flatMap(
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

            return countries;
        } catch (error) {
            console.log('Ha ocurrido la siguiente excepción: ', error);
        }
    }

    private async getInformationCountriesByCode(
        ISOCode: string,
    ): Promise<CountryInformationByCode[]> {
        try {
            const promise = await new Promise((resolve, reject) => {
                const args = { sCountryISOCode: ISOCode };
                this.soapClient.FullCountryInfo(args, (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                });
            });

            const informationCountriesByCode: CountryInformationByCode[] =
                Object.values(promise).flatMap((item) => {
                    return item;
                });

            return informationCountriesByCode;
        } catch (error) {
            console.log('Ha ocurrido la siguiente excepción: ', error);
        }
    }

    /**
     * Devuelve una lista de continentes ordenados por nombre.
     * @returns
     */
    private async getInformationContinentsByName(): Promise<
        InformationContinentsByName[]
    > {
        try {
            const promise = await new Promise((resolve, reject) => {
                this.soapClient.ListOfContinentsByName({}, (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                });
            });

            const response: InformationContinentsByName[] = Object.values(
                promise,
            ).flatMap((continent) => {
                return continent.tContinent.map((item) => {
                    const continent = {
                        sCode: item.sCode,
                        sName: item.sName,
                    };

                    return continent;
                });
            });

            console.log(JSON.stringify(response, null, 4));

            return response;
        } catch (error) {
            console.log('Ha ocurrido la siguiente excepción: ', error);
        }
    }

    /**
     * Obtiene la información de la moneda según el código del país.
     * @param ISOCode Código ISO del país.
     * @returns
     */
    private async getCurrencyName(ISOCode): Promise<CurrencyName[]> {
        const promise = await new Promise((resolve, reject) => {
            const args = { sCurrencyISOCode: ISOCode };
            this.soapClient.CurrencyName(args, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });

        const informationCurrencyName: CurrencyName[] = Object.values(
            promise,
        ).map((item) => {
            const currency = {
                currencyName: item,
            };

            return currency;
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
