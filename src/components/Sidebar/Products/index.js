import React, {Component} from "react";
import {Input, Button, Divider} from "antd";
import {PlusOutlined} from "@ant-design/icons/lib";

import ProductList from "data/ProductList.json";
import HeadPhone from "./headphones.png";

import "./Products.scss";

class Products extends Component {

  onSearch(value: string) {
    console.log("Search product with: ----->", value);
  }

  buildSingleProduct(product, remove) {
    return (
      <div className="single-product-container" key={Math.random()}>
        <img src={HeadPhone} alt="product headphone" className="product-image"/>
        <div className="name-price">
          <span className="product-name">{product.name}</span><br/>
          <span className="product-price">{product.price}</span>
        </div>
        <Button>{remove? (<span className="remove">Remove</span>): "Highlight"}</Button>
      </div>
    )
  }

  render() {
    return (
      <div className="product-container">
        <Input.Search
          placeholder="Search or add product url(s)"
          allowClear
          size="large"
          onSearch={(value) => this.onSearch(value)}
          enterButton={<PlusOutlined className="plusOutlined"/>}
          className="product-search"
        />
        <div className="product-list-container">
          {ProductList.map((product) => this.buildSingleProduct(product))}
        </div>
        <Divider />
        <div className="highlighted-product-list-container">
          {ProductList.slice(0, 3).map((product) => this.buildSingleProduct(product, true))}
        </div>
      </div>
    )
  }
}

export default Products;
