export interface CountryInformationByCode {
    sISOCode: string;
    sName: string;
    sCapitalCity: string;
    sPhoneCode: string;
    sContinentCode: string;
    sCurrencyISOCode: string;
    sCountryFlag: string;
    Languages: [
        {
            code: string;
            name: string;
        },
    ];
}
