import unirest from 'unirest';
import qs from 'querystring';
import { IApiError } from './interfaces';

export class Gitlab {
    private _host: string;
    private _token: string;
    private _project: string;
    private _headers: object;

    constructor(host: string, token: string, project: string) {
        this._host = host;
        this._token = token;
        this._project = project;
        this._headers = { 'PRIVATE-TOKEN': this._token };
    }
    private async request(uri: string, query: {} = null, headers: boolean = false) {
        try {
            const _uri = query ? `${uri}?${qs.encode(query)}` : uri;
            const r = await unirest.get(_uri)
                .headers(this._headers);
            if (r.statusCode !== 200) {
                return Promise.reject({ statusCode: r.statusCode, ...r.body });
            }
            if (headers) {
                return { body: r.body, headers: r.headers };
            }
            return r.body;
        } catch (err) {
            console.log(err);
            return Promise.reject({ statusCode: 500 });
        }
    }
    public project(): Promise<any | IApiError> {
        return this.request(`${this._host}/projects/${this._project}`);
    }

    public async members(): Promise<any | IApiError> {
        return this.request(`${this._host}/projects/${this._project}/members/all`);
    }

    public async issues(query: {}, headers: boolean = false): Promise<any | IApiError> {
        return this.request(`${this._host}/projects/${this._project}/issues?${qs.encode(query)}`, null, headers);
    }

    public async issuesStatistics(query: {} = null): Promise<any | IApiError> {
        return this.request(`${this._host}/projects/${this._project}/issues_statistics`, query);
    }

    public async milestones(): Promise<any | IApiError> {
        const query = {
            pagination: 'keyset',
            per_page: 100,
            order_by: 'title',
            sort: 'asc',
        };
        return this.request(`${this._host}/projects/${this._project}/milestones`, query);
    }

    public async labels(): Promise<any | IApiError> {
        const query = {
            pagination: 'keyset',
            per_page: 100,
            order_by: 'title',
            sort: 'asc',
        };
        return this.request(`${this._host}/projects/${this._project}/labels`, query);
    }
}
