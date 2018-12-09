import axios, { AxiosInstance, AxiosRequestConfig, AxiosPromise } from 'axios';
import _merge from 'lodash-es/merge';

export type AjaxOptions = {
    baseURL?: string;
    headers?: object;
    headerAuthorization?: string | (() => string);
    isPostForm?: boolean;
    onRequest?: (config: AxiosRequestConfig) => AxiosRequestConfig;
    onRequestError?: (error) => void;
    onResponse?: (response: any) => any;
    onResponseError?: (error) => any;
};
export class Ajax {
    static buildOptions(options: AjaxOptions): AxiosRequestConfig {
        if (!options) return null;

        let config: AxiosRequestConfig = {};
        if (options.baseURL) {
            config.baseURL = options.baseURL;
        }
        if (options.headerAuthorization) {
            if (!config.headers) config.headers = {};
            if (!config.headers.common) config.headers.common = {};
            const authorization = typeof options.headerAuthorization === 'string'
                ? options.headerAuthorization
                : options.headerAuthorization();
            config.headers.common['Authorization'] = authorization;
        }
        if (options.headers) {
            if (!config.headers) config.headers = {};
            if (!config.headers.common) config.headers.common = {};
            for (let key in options.headers) {
                config.headers.common[key] = options.headers[key];
            }
        }
        if (options.isPostForm) {
            if (!config.headers) config.headers = {};
            // if (!config.headers.common) config.headers.common = {};
            // config.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
            config.headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=utf-8';
        }

        return config;
    }

    static setGlobalOptions(options: AjaxOptions) {
        axios.defaults = _merge({}, axios.defaults, Ajax.buildOptions(options));
    }

    static instance(options?: AjaxOptions) : AxiosInstance {
        const result: AxiosInstance = options ? axios.create(Ajax.buildOptions(options)) : axios.create();

        if (options) {
            if (options.onRequest || options.onRequestError) {
                result.interceptors.request.use(
                    options.onRequest || ((config: AxiosRequestConfig) => config),
                    options.onRequestError || ((error: any) => Promise.reject(error))
                );
            }
            if (options.onResponse || options.onResponseError) {
                result.interceptors.response.use(
                    options.onResponse || ((response: any) => response),
                    options.onResponseError || ((error: any) => Promise.reject(error))
                );
            }
        }

        return result;
    }

    options: AjaxOptions;

    constructor(options?: AjaxOptions) {
        this.options = options;
    }

    instance = (): AxiosInstance => Ajax.instance(this.options);

    get = (url: string): AxiosPromise => {
        return this.instance().get(url) as AxiosPromise;
    }
    post = (url: string, data: any): AxiosPromise => {
        return this.instance().post(url, data);
    }
    postForm = (url: string, data: any): AxiosPromise => {
        const formData = new FormData();    // Must be FormData so that the ajax request will be Form post
        Object.keys(data).forEach((k) => {
            formData.append(k, data[k])
        });
        return this.instance().post(url, formData);
    }
    remove = (url: string): AxiosPromise => {
        return this.instance().delete(url);
    }
    put = (url: string, data: any): AxiosPromise => {
        return this.instance().put(url, data);
    }
    patch = (url: string, data: any): AxiosPromise => {
        return this.instance().patch(url, data);
    }
}

const ajax = new Ajax();

export default ajax;
