import React, { Component } from "react";
import { Drawer, Button, List, Avatar } from 'antd';
import { observer } from "mobx-react";
import EventApi from "stores/api/EventApi";
import "./Product.scss";

class ProductList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: true
    }
  }

  showDrawer() {
    console.log("BUTTON CLICKED");
    this.setState({ visible: true });
  }

  onClose() {
    console.log("DRAWER CLOSED");
    this.setState({ visible: false });
  }

  toggleProduct(sku, active) {
    EventApi.updateProducts(sku, active);
  }

  render() {
    const productsList = EventApi.productsList;
    console.log("PRODUCT LIST ->", productsList);
    return (
      <>
        <Drawer
          title="Products"
          width={358}
          placement="right"
          closable={false}
          onClose={() => this.onClose()}
          visible={this.state.visible}
          mask={false}
          className="product-drawer"
        >
          <List
            itemLayout="horizontal"
            dataSource={productsList}
            renderItem={product => (
              <List.Item className="product-item">
                <List.Item.Meta
                  avatar={<Avatar src={product.image} />}
                  title={<a href="https://ant.design">{product.title}</a>}
                />
                {product.active && (
                  <Button
                    onClick={() => this.toggleProduct(product.sku, !product.active)}
                    className="hide-button">Hide
                  </Button>
                )}
                {!product.active && (
                  <Button
                    onClick={() => this.toggleProduct(product.sku, !product.active)}
                    className="show-button">Show
                  </Button>
                )}
              </List.Item>
            )}
          />
        </Drawer>
      </>
    );
  }
}

export default observer(ProductList);
