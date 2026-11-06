// menu data
const menu_data = [
  {
    id: 1,
    sub_menu: true,
    title: "Home",
    link: "/",
    sub_menus: [
      { title: "Electronics", link: "/" },
      { title: "Fashion", link: "/fashion" },
      { title: "Beauty", link: "/beauty" },
      { title: "Jewelry", link: "/jewelry" },
      { title: "Grocery", link: "/shop" },
    ],
  },
  {
    id: 2,
    sub_menu: true,
    title: "Shop",
    link: "/shop",
    sub_menus: [
      { title: "Shop Categories", link: "/shop-category" },
      { title: "Shop Brands", link: "/shop" },
      { title: "Shop List", link: "/shop-list" },
      { title: "Shop Grid", link: "/shop" },
      { title: "Product Detail", link: "/product-details" },
      { title: "Grab Coupons", link: "/coupon" },
      { title: "Cart", link: "/cart" },
      { title: "Compare", link: "/compare" },
      { title: "Wishlist", link: "/wishlist" },
      { title: "Track Your Order", link: "/order" },
    ],
  },
  {
    id: 3,
    single_link: true,
    title: "Vendors",
    link: "/shop",
  },
  {
    id: 4,
    sub_menu: true,
    title: "Pages",
    link: "/coupon",
    sub_menus: [
      { title: "FAQs", link: "/coupon" },
      { title: "Login", link: "/login" },
      { title: "Register", link: "/register" },
      { title: "Forgot Password", link: "/forgot" },
      { title: "404 Error", link: "/404" },
      { title: "Coming Soon", link: "/contact" },
    ],
  },
  {
    id: 5,
    sub_menu: true,
    title: "Blog",
    link: "/blog",
    sub_menus: [
      { title: "Blog Grid", link: "/blog" },
      { title: "Blog List", link: "/blog-list" },
      { title: "Blog Detail", link: "/blog-details" },
    ],
  },
  {
    id: 6,
    single_link: true,
    title: "Contact",
    link: "/contact",
  },
];

export default menu_data;

// Mobile Navigation Data
export const mobile_menu = [
  {
    id: 1,
    sub_menu: true,
    title: "Home",
    link: "/",
    sub_menus: [
      { title: "Electronics", link: "/" },
      { title: "Fashion", link: "/fashion" },
      { title: "Beauty", link: "/beauty" },
      { title: "Jewelry", link: "/jewelry" },
      { title: "Grocery", link: "/shop" },
    ],
  },
  {
    id: 2,
    sub_menu: true,
    title: "Shop",
    link: "/shop",
    sub_menus: [
      { title: "Shop Categories", link: "/shop-category" },
      { title: "Shop Brands", link: "/shop" },
      { title: "Shop List", link: "/shop-list" },
      { title: "Shop Grid", link: "/shop" },
      { title: "Product Detail", link: "/product-details" },
      { title: "Grab Coupons", link: "/coupon" },
      { title: "Cart", link: "/cart" },
      { title: "Compare", link: "/compare" },
      { title: "Wishlist", link: "/wishlist" },
      { title: "Track Your Order", link: "/order" },
    ],
  },
  {
    id: 3,
    single_link: true,
    title: "Vendors",
    link: "/shop",
  },
  {
    id: 4,
    sub_menu: true,
    title: "Pages",
    link: "/coupon",
    sub_menus: [
      { title: "FAQs", link: "/coupon" },
      { title: "Login", link: "/login" },
      { title: "Register", link: "/register" },
      { title: "Forgot Password", link: "/forgot" },
      { title: "404 Error", link: "/404" },
      { title: "Coming Soon", link: "/contact" },
    ],
  },
  {
    id: 5,
    sub_menu: true,
    title: "Blog",
    link: "/blog",
    sub_menus: [
      { title: "Blog Grid", link: "/blog" },
      { title: "Blog List", link: "/blog-list" },
      { title: "Blog Detail", link: "/blog-details" },
    ],
  },
  {
    id: 6,
    single_link: true,
    title: "Contact",
    link: "/contact",
  },
];