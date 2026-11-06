import React from "react";
import menu_data from "@/data/menu-data";
import Link from "next/link";

const Menus = () => {
  return (
    <ul>
      {menu_data.map((menu) =>
        menu.sub_menu && menu.sub_menus ? (
          <li key={menu.id} className="has-dropdown">
            <Link href={menu.link}>
              {menu.title}
            </Link>
            <ul className="tp-submenu">
              {menu.sub_menus.map((sub, i) => (
                <li key={i}>
                  <Link href={sub.link}>{sub.title}</Link>
                </li>
              ))}
            </ul>
          </li>
        ) : menu.products && menu.product_pages ? (
          <li key={menu.id} className="has-dropdown has-mega-menu">
            <Link href={menu.link}>
              {menu.title}
            </Link>
            <ul className="tp-submenu tp-mega-menu mega-menu-style-2">
              {menu.product_pages.map((p, i) => (
                <li key={i} className="has-dropdown">
                  <Link href={p.link} className="mega-menu-title">
                    {p.title}
                  </Link>
                  <ul className="tp-submenu">
                    {p.mega_menus.map((m, j) => (
                      <li key={j}>
                        <Link href={m.link}>{m.title}</Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </li>
        ) : (
          <li key={menu.id}>
            <Link href={menu.link}>{menu.title}</Link>
          </li>
        )
      )}
    </ul>
  );
};

export default Menus;