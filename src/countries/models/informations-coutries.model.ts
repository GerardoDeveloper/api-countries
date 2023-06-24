export interface InformationsCountries {
    code: string;
    name: string;
    capitalCity: string;
    phoneCode: number;
    continent: {
        code: string;
        name: string;
    };
    currency: {
        code: string;
        name: string;
    };
    flag: string;
    languages: [
        {
            code: string;
            name: string;
        },
    ];
}
