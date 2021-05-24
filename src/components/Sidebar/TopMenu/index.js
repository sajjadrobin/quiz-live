import React, {useState} from "react";
import {Menu} from "antd";
import Products from "components/Sidebar/Products";


function TopMenu() {
  const [currentMenu, setCurrentMenu] = useState("products");

  const handleMenuClick = (event) => {
    setCurrentMenu(event.key.toString());
  }

  return (
    <>
      <Menu
        onClick={handleMenuClick}
        selectedKeys={[currentMenu]}
        mode="horizontal"
        className="menuContainer">
        <Menu.Item key="products">Products<sup>22</sup></Menu.Item>
        <Menu.Item key="chat">Chat<sup>2</sup></Menu.Item>
        <Menu.Item key="polls">Polls<sup>0</sup></Menu.Item>
        <Menu.Item key="discounts">Discounts</Menu.Item>
      </Menu>
      {currentMenu === "products" && <Products/>}
    </>
  )
}

export default TopMenu;
