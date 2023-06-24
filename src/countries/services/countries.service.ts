import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Client } from 'nestjs-soap';
import * as cacheManager from 'cache-manager';
import * as fs from 'fs';

import { Country } from '../models/country.models';
import { CountryInformationByCode } from '../models/country-info.models';
import { CurrencyName } from '../models/currency-name.models';
import { InformationContinentsByName } from '../models/continent-by-name.models';
import { InformationsCountries } from '../models/informations-coutries.models';

@Injectable()
export class CountriesService {
    constructor(
        @Inject('SOAP_COUNTRIES') private readonly soapClient: Client, // Inyectamos el cliente soap.
    ) {}

    async findAll() {
        const informationAllCountry = await this.getInformation();

        return informationAllCountry;
    }

    /**
     * Obtiene toda la información ya filtrada.
     * @returns
     */
    private async getInformation(): Promise<InformationsCountries[]> {
        try {
            const listInformationFinal: InformationsCountries[] = [];

            const listCountries = await this.getInformationCountries();
            const listContinentsByName =
                await this.getInformationContinentsByName();

            const allPromises = listCountries.map(async (country) => {
                const listCountryByCode =
                    await this.getInformationCountriesByCode(country.sISOCode);

                const promiseCountryByCode = await listCountryByCode.map(
                    async (countryByCode) => {
                        const currencyName = await this.getCurrencyName(
                            countryByCode.sCurrencyISOCode,
                        );

                        // Filtrado de paises.
                        const continentFilterByCountry =
                            listContinentsByName.filter((continentByName) =>
                                countryByCode.sContinentCode.includes(
                                    continentByName.sCode,
                                ),
                            );

                        // Con los paises ya filtrados, se obtiene la moneda de cada uno de ellos.
                        await Promise.all(
                            continentFilterByCountry.map(
                                async (continentFilter) => {
                                    currencyName.forEach((currency) => {
                                        // Se arma el array de objeto final con toda la información ya filtradas.
                                        listInformationFinal.push({
                                            code: country.sISOCode,
                                            name: country.sName,
                                            capitalCity:
                                                countryByCode.sCapitalCity,
                                            phoneCode: parseInt(
                                                countryByCode.sPhoneCode,
                                                10,
                                            ),
                                            continent: {
                                                code: continentFilter.sCode,
                                                name: continentFilter.sName,
                                            },
                                            currency: {
                                                code: country.sISOCode,
                                                name: currency.currencyName,
                                            },
                                            flag: countryByCode.sCountryFlag,
                                            languages: countryByCode.Languages,
                                        });
                                    });
                                },
                            ),
                        ).catch((error) => {
                            this.writeLog(
                                `The following exception has occurred: ${error.message}\nTrace: ${error.stack}`,
                            );

                            throw new HttpException(
                                'The request has not been prosecuted for an internal error',
                                HttpStatus.INTERNAL_SERVER_ERROR,
                            );
                        });
                    },
                );

                await Promise.all(promiseCountryByCode).catch((error) => {
                    this.writeLog(
                        `The following exception has occurred: ${error.message}\nTrace: ${error.stack}`,
                    );

                    throw new HttpException(
                        'The request has not been prosecuted for an internal error',
                        HttpStatus.INTERNAL_SERVER_ERROR,
                    );
                });
            });

            await Promise.all(allPromises).catch((error) => {
                this.writeLog(
                    `The following exception has occurred: ${error.message}\nTrace: ${error.stack}`,
                );

                throw new HttpException(
                    'The request has not been prosecuted for an internal error',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            });

            return listInformationFinal;
        } catch (error) {
            await this.writeLog(
                `The following exception has occurred: ${error.message}\nTrace: ${error.stack}`,
            );

            throw new HttpException(
                'The request has not been prosecuted for an internal error',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
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
            await this.writeLog(
                `The following exception has occurred: ${error.message}\nTrace: ${error.stack}`,
            );

            throw new HttpException(
                'The request has not been prosecuted for an internal error',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
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
            await this.writeLog(
                `The following exception has occurred: ${error.message}\nTrace: ${error.stack}`,
            );

            throw new HttpException(
                'The request has not been prosecuted for an internal error',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
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

            return response;
        } catch (error) {
            await this.writeLog(
                `The following exception has occurred: ${error.message}\nTrace: ${error.stack}`,
            );

            throw new HttpException(
                'The request has not been prosecuted for an internal error',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    /**
     * Obtiene la información de la moneda según el código del país.
     * @param ISOCode Código ISO del país.
     * @returns
     */
    private async getCurrencyName(ISOCode): Promise<CurrencyName[]> {
        try {
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
        } catch (error) {
            await this.writeLog(
                `The following exception has occurred: ${error.message}\nTrace: ${error.stack}`,
            );

            throw new HttpException(
                'The request has not been prosecuted for an internal error',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    /**
     * Escribe archivos de logs con las posibles excepciones que ocurran.
     */
    async writeLog(string) {
        try {
            await fs.promises.appendFile('exceptions.log', `${string}\n\n`);
        } catch (error) {
            console.log(
                `The following exception has occurred: ${error.message}\nTrace: ${error.stack}`,
            );
        }
    }
}
