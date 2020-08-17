export const textToSampleData = (text: string): any => {
    return {
        sampleElements: [],
    };
}

export default class Sample {

    public data: any = {};
    public generated: boolean = false;

    constructor(sampleData?: any) {

    }

    elements() {
        return [];
    }

    toString(flag: boolean = false): string {
        return '';
    }
}