import axios from 'axios';
import { makeObservable, observable, action, runInAction } from "mobx";


class MainApi {
  errorMessage = "";
  constructor() {
    makeObservable(this, {
      errorMessage: observable,
      resetErrorMessage: action,
    });
  }

  resetErrorMessage() {
    runInAction(() => this.errorMessage = "");
  }

  async get(url, config = {}) {
    //const parent = this;
    this.resetErrorMessage();
    return await axios.get(url, config).catch(function () {
      // const responseError = error.response.data || {};
      runInAction(() => {
        // parent.errorMessage = responseError.message ? responseError.message : `There is an error in fetching ${url}`;
        // throw parent.errorMessage;
      });
    });
  }

  async post(url, data = {}, config = {}) {
    // const parent = this;
    this.resetErrorMessage();
    return await axios.post(url, data, config).catch(function () {
      // const responseError = error.response.data || {};
      runInAction(() => {
        /*let errorMessage = responseError.message ? responseError.message : `There is an error in posting ${url}`;

        if(responseError.errors.length) {
          errorMessage += '--> ';
          responseError.errors.forEach((error) => {
            if(error.field) errorMessage += `${error.field} -`;
            //if(error.defaultMessage) errorMessage += ` ${error.defaultMessage}. `;
          });
        }
        parent.errorMessage = errorMessage;
        throw new Error(errorMessage);*/
      })
    });
  }

  async put(url, data = {}, config = {}) {
    // const parent = this;
    this.resetErrorMessage();
    return await axios.put(url, data, config).catch(function () {
      /* const responseError = error.response.data || {};
      runInAction(() => {
        parent.errorMessage = responseError.message ? responseError.message : `There is an error in updating ${url}`;
        throw parent.errorMessage;
      });*/
    });
  }

  async delete(url, config = {}) {
    // const parent = this;
    this.resetErrorMessage();
    return await axios.delete(url, config).catch(function () {
      /* const responseError = error.response.data || {};
      runInAction(() => {
        parent.errorMessage = responseError.message ? responseError.message : `There is an error in deleting ${url}`;
        throw parent.errorMessage;
      })
      */
    });
  }
}

export default new MainApi();
