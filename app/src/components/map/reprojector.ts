import { Feature } from "geojson";

export class ReProjector {
    feature(params: any) {
        return this
    }

    from(params: any) {
        return this;
    }

    to(params: any) {
        return this;
    }

    async project(): Promise<Feature> {
        return null as unknown as Feature;
    }
} 
