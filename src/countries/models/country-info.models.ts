export interface CountryInformation {
    FullCountryInfoResult: {
        sISOCode: string;
        sName: string;
        sCapitalCity: string;
        sPhoneCode: string;
        sContinentCode: string;
        sCurrencyISOCode: string;
        sCountryFlag: string;
        Languages: [
            {
                sISOCode: string;
                sName: string;
            },
            {
                sISOCode: string;
                sName: string;
            },
        ];
    };
}
