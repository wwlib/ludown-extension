const fs = require('fs');
import { gzip, gunzip } from 'zlib';

let configModule: any;

export default class Model {

    private _generators: any;
    private _listEntities: any;
    private _jsonFilename: string = '';
    private _data: any;

    getEntities(): string[] {
        let result: string[] = [];
        if (configModule.entities) {
            result = configModule.entities
        };
        return result;
    }

    /**
     * generates samples 
     */
    initGenerators() {
        this._generators = this.createListEntityGenerators();
        this.addGenerator('NUMBER', () => {
            return Math.floor(Math.random() * 1000)
        });
        this.addGenerator('MESSAGE', () => {
            return 'a very interesting topic';
        });
    }

    /**
     * sets an entity's generator
     * 
     * @param entity entity to add the generator to 
     * @param generator the generator to 
     */
    addGenerator(entity: string, generator: any) {
        this._generators[entity] = generator;
    }

    /** 
     * parses the listEntity to get a map of all the literals 
     * 
     * @returns an array of the literals
     */
    getListEntityLiteralsMap() {
        let literalsMap: any = {};
        if (this._listEntities) {
            this._listEntities.forEach((entity: any) => {
                // TBD
            });
        }
        return literalsMap;
    }

    /**
     * creates a listEntity generator based on the literals belonging to the specified entity
     * 
     * @param entity the entity to grab literals from
     * @returns the listEntity generator
     */
    createListEntityGenerator(entity: string) {
        let result = {};
        let literalsMap = this.getListEntityLiteralsMap();
        var listEntity = literalsMap[entity];
        if (listEntity) {
            var x = 0;
            result = () => {
                let value = listEntity[x++];
                if (x >= listEntity.length) {
                    x = 0;
                }
                return value;
            }
        }
        return result;
    }

    /**
     * creates a dictionary generator for each literal
     * 
     * @returns the array of dictionary generators
     */
    createListEntityGenerators() {
        let dictionaryGenerators: any = {};
        let dictionaryMap = this.getListEntityLiteralsMap()
        for (var key in dictionaryMap) {
            dictionaryGenerators[key] = this.createListEntityGenerator(key)
        }
        return dictionaryGenerators;
    }

    /**
     * generates new samples based on existing samples
     * 
     * @param sampleData samples to generate new samples off of
     * @returns generated samples
     */
    generateVariationWithSampleData(sampleData: any) {
        let result = {};
        // TBD
        return result
    }

    /*
    data = {
        entities: {
            entityName: {
                roles: [],
                values: [
                    {
                        canonical: 'Canonical',
                        synonyms: ['synonym'],
                    }
                ]
            }
        }
    }
    */

    loadConfigModule(configModulePath: string): Promise<any> {
        return new Promise<any>((resolve: any, reject: any) => {
            try {
                console.log(`loadConfigModule: loading:`, configModulePath);
                if (require.resolve(configModulePath)) {
                    delete require.cache[require.resolve(configModulePath)];
                }
                configModule = require(configModulePath);
                console.log(`loadConfigModule:`, configModule);
                console.log(`entities:`, configModule.entities);
                console.log(`entityValueSynonymMap:`, configModule.entityValueSynonymMap);
                resolve(configModule);
            } catch (error) {
                console.log(error);
                reject(`error requiring: ${configModulePath}`);
            }
        });
    }

    loadJson(filename: string): Promise<any> {
        return new Promise<any>((resolve: any, reject: any) => {
            if (filename) {
                this._jsonFilename = filename;
                fs.readFile(this._jsonFilename, "utf8", (err: any, data: any) => {
                    if (err) {
                        reject(err);
                    } else {
                        this._data = JSON.parse(data);
                        resolve();
                    }
                });
            } else {
                reject('invalid filename');
            }
        });
    }

    loadJsonGzip(filename: string): Promise<any> {
        return new Promise<any>((resolve: any, reject: any) => {
            if (filename) {
                fs.readFile(filename, (err: any, bufIn: any) => {
                    if (err) {
                        reject(err);
                    } else {
                        gunzip(bufIn, (err, bufInflated) => {
                            if (err) {
                                console.log(err);
                            } else {
                                const bufString = bufInflated.toString("utf8");
                                this._data = JSON.parse(bufString);
                                resolve();
                            }
                        });
                    }
                });
            } else {
                reject('invalid filename');
            }
        });
    }
}