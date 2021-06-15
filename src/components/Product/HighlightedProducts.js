import React, { Component } from "react";
import { observer } from "mobx-react";
import {toJS} from 'mobx';
import EventApi from "stores/api/EventApi";
import "./Product.scss";

class HighlightedProducts extends Component {
  render() {
    const highlightedProducts = EventApi.highlightedProducts;
    console.log("Highlighted Products -->", toJS(highlightedProducts));
    return (
      <div className="products-wrapper">
        {highlightedProducts.map(({ image, sku, title }) => {
          return (
            <div key={sku} className="product-container">
              <img src={image} alt={title} className="product-image" />
              <span className="product-title">{title}</span>
            </div>
          );
        })}
      </div>
    );
  }
}

export default observer(HighlightedProducts);
