import { makeObservable, runInAction, observable, toJS } from "mobx";
import MainApi from "./MainApi";
import cookies from "utils/CookiesHelper";
import firebase from "../firebase";

const COOKIE_OPTIONS = {
  sameSite: "lax",
  path: "/",
  maxAge: 2 * 60 * 60,
};
const HIGHLIGHTED_PRODUCT_LIMIT = 3;

class EventApi {
  eventDetails = {
    eventName: "",
    date: {
      _seconds: 0,
    },
    participants: [],
  };
  tokenDetails = {};
  baseUrl = "https://bbu-rtc-poc.ew.r.appspot.com/events";
  highlightedProducts = [];
  productsList = [];

  constructor() {
    makeObservable(this, {
      eventDetails: observable,
      highlightedProducts: observable,
      productsList: observable,
    });
  }

  async joinEvent(token) {
    try {
      const result = await MainApi.post(`${this.baseUrl}/join/${token}`);
      if (result.data) {
        //set in Cookie
        cookies.set("tokenDetails", result.data, COOKIE_OPTIONS);

        this.getEventDetailByID(result.data.channel);

        this.tokenDetails = result.data;
      }
    } catch (error) {
      console.log(error);
    }
  }

  async addParticipant(eventInfo) {
    const { channel: id, email } = eventInfo;
    try {
      await MainApi.post(`${this.baseUrl}/${id}/participants`, {
        email,
      });
    } catch (error) {
      // TODO: remove console.log
      console.log("add participants error ---> ", error);
    }
  }

  async updateParticipant(name) {
    const { channel: id, email } = this.tokenDetails;
    try {
      const result = await MainApi.put(
        `${this.baseUrl}/${id}/participants/${email}`,
        {
          name,
        }
      );
    } catch (error) {
      // TODO: remove console.log
      console.log("error -> ", error);
    }
  }

  async getEventDetailByID(id) {
    try {
      const result = await MainApi.get(`${this.baseUrl}/${id}`);
      if (result.data) {
        console.log("User Joined --->", result.data);
        runInAction(() => (this.eventDetails = result.data));

      }
    } catch (error) {
      // TODO: remove console.log
      console.log("event by ID error : ", error);
    }
  }

  async getProducts(eventId) {
    const eventRef = firebase.firestore().collection("events").doc(eventId);

    eventRef.onSnapshot((doc) => {
      const docData = doc.data();
      const { products = [] } = docData;

      if (products.length) {
        console.log("product list --> ", toJS(products));
        const highlightedProducts = products.filter(
          (product) => product.active
        );
        runInAction(() => {
          this.highlightedProducts = highlightedProducts.slice(
            0,
            HIGHLIGHTED_PRODUCT_LIMIT
          );
          this.productsList = products;
        });
      }
    });
  }

  async hostJoinEvent(id) {
    try {
      const result = await MainApi.post(`${this.baseUrl}/${id}/host`);
      if(result.data) {
        runInAction(() => this.tokenDetails = result.data);
        return result.data;
      } else {
        return {};
      }
    } catch (error) {
      console.log(`Host could not join ${error}`);
    }
  }

  async updateProducts(sku, active) {
    const {channel: id} = this.tokenDetails;

    try {
      await MainApi.put(`${this.baseUrl}/${id}/products/${sku}`, {active})
    } catch (error) {
      console.log("Update product error");
    }
  }
}
export default new EventApi();
