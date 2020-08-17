const entityData = {
    Animal: {
        roles: ['animal'],
        values: [
            {
                canonical: 'Aardvark',
                synonyms: ['aardvarks'],
            },
            {
                canonical: 'GilaMonster',
                synonyms: ['gila monster', 'gila monsters'],
            }
        ]
    },
    Planet: {
        roles: ['planet'],
        values: [
            {
                canonical: 'Earth',
                synonyms: ['terra firma'],
            },
            {
                canonical: 'Mars',
                synonyms: [],
            }
        ]
    }
}

const entities = [];
const entityKeys = Object.keys(entityData).sort();
const entityValueSynonymMap = {};

entityKeys.forEach(key => {
    const entity = entityData[key];
    entityValueSynonymMap[entity] = {};
    entities.push(key);
    if (entity.roles) {
        entity.roles.forEach(role => {
            entities.push(`${role}`);
            entities.push(`@${role}`);
        });
    }
    if (entity.values) {
        entity.values.forEach(value => {
            if (value.canonical && value.synonyms) {
                entityValueSynonymMap[entity][value.canonical] = []
                entityValueSynonymMap[entity][value.canonical].push(value.canonical.toLowerCase());
                value.synonyms.forEach(synonym => {
                    entityValueSynonymMap[entity][value.canonical].push(synonym);
                });
            }
        });
    }
});

module.exports = {
    entities,
    entityValueSynonymMap,
}