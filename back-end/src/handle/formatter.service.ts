import * as _ from 'underscore';
import {Injectable} from '@nestjs/common';
import {Repositories} from 'src/entities/repositories.entity';
const langISO = require('iso-639-1');
import CountryISO from '@mohammad231/iso_3166-1';
import {Country} from '@mohammad231/iso_3166-1/iso_3166-1';
import * as dayjs from 'dayjs';

@Injectable()
export class FormatService {
    constructor() {
    }

    getParsedSchema(repository: Repositories) {
        const parsedSchema: any = {};
        if (repository.type === 'DSpace5') {
            parsedSchema.id = 'id';
        } else if (repository.type === 'DSpace6') {
            parsedSchema.uuid = 'uuid';
        } else if (repository.type === 'DSpace7') {
            parsedSchema.uuid = 'uuid';
        } else if (repository.type === 'Dataverse') {
            parsedSchema.handle = 'persistentUrl';
        } else if (repository.type === 'CKAN') {
            parsedSchema.handle = 'identifier';
        }

        parsedSchema.metadata = repository.schemas.map(item => {
            const mappingItem: any = {
                where: {key: item.source},
                value: {value: item.target},
            };

            if (item.formatter) {
                if (item.formatter_addition) {
                    mappingItem.addOn = {};
                    mappingItem.addOn[item.formatter] = item.formatter_addition;
                } else {
                    mappingItem.addOn = item.formatter;
                }
            }
            return mappingItem;
        });

        return parsedSchema;
    }

    format(json: any, repository: Repositories) {
        const schema = this.getParsedSchema(repository);
        let finalValues: any = {};
        _.each(schema, (item: any, index: string) => {
            if (json[index]) {
                if (_.isArray(item)) {
                    _.each(item, (subItem: any, subIndex: string) => {
                        let values = json[index]
                            .filter(
                                (d: any) =>
                                    d[Object.keys(subItem.where)[0]] ==
                                    subItem.where[Object.keys(subItem.where)[0]],
                            )
                            .map((d: any) =>
                                subItem.prefix
                                    ? subItem.prefix +
                                    this.mapIt(
                                        d[Object.keys(subItem.value)[0]],
                                        subItem.addOn ? subItem.addOn : null,
                                    )
                                    : this.mapIt(
                                        d[Object.keys(subItem.value)[0]],
                                        subItem.addOn ? subItem.addOn : null,
                                    ),
                            );
                        if (values.length)
                            finalValues[subItem.value[Object.keys(subItem.value)[0]]] =
                                this.setValue(
                                    finalValues[subItem.value[Object.keys(subItem.value)[0]]],
                                    this.getArrayOrValue(values),
                                );
                    });
                } else if (_.isObject(item)) {
                    if (_.isArray(json[index])) {
                        let values = this.getArrayOrValue(
                            json[index].map((d: any) => this.mapIt(d[Object.keys(item)[0]])),
                        );
                        if (values)
                            finalValues[<string>Object.values(item)[0]] = this.setValue(
                                finalValues[<string>Object.values(item)[0]],
                                values,
                            );
                    }
                } else finalValues[index] = this.mapIt(json[index]);
            }
        });
        return finalValues;
    }

    setValue(oldvalue, value) {
        if (!oldvalue) {
            return value;
        }
        if (!value) {
            return oldvalue;
        }

        if (!Array.isArray(oldvalue)) {
            oldvalue = [oldvalue];
        }
        if (!Array.isArray(value)) {
            value = [value];
        }

        return [...oldvalue, ...value].filter((value, index, array) => {
            return array.indexOf(value) === index;
        });
    }

    mapIsoToLang = (value: string) =>
        langISO.validate(value) ? langISO.getName(value) : value;

    mapIsoToCountry(value: string) {
        const valueLower = value.toLowerCase();
        const country = CountryISO.get({
            alpha_2: valueLower,
            alpha_3: valueLower,
            numeric: valueLower,
            name: valueLower,
            common_name: valueLower,
            official_name: valueLower,
        }) as Country;
        return country ? country.name : value;
    }

    mapIt(value: any, addOn = null): string {
        if (addOn) {
            if (typeof value === 'string' || value instanceof String) {
                if (addOn == 'country') {
                    value = value.split(',').map((d) => this.mapIsoToCountry(d.trim()));
                } else if (addOn == 'language') {
                    value = value
                        .split(',')
                        .map((d) => this.mapIsoToLang(d.trim().toLowerCase()));
                } else if (addOn == 'date') {
                    if (_.isArray(value)) value = value[0];
                    try {
                        value = dayjs(value).format('YYYY-MM-DD');
                        if (!dayjs(value).isValid()) value = null;
                    } catch (e) {
                        value = null;
                    }
                } else if (addOn == 'datetime') {
                    if (_.isArray(value)) value = value[0];
                    try {
                        value = dayjs(value).format('YYYY-MM-DDTHH:mm:ssZ');
                        if (!dayjs(value).isValid()) value = null;
                    } catch (e) {
                        value = null;
                    }
                } else if (addOn == 'lowercase') {
                    value = value.trim().toLowerCase();
                }
            }
        }
        return value;
    }

    getArrayOrValue(values: Array<any>) {
        if (values.length > 1) return values;
        else return values[0];
    }
}
