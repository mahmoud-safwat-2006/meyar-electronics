import React from "react";
import dayjs from "dayjs";
import Link from "next/link";

const MyOrders = ({ orderData }) => {
  const orderItems = orderData?.orders;

  if (!orderItems || orderItems.length === 0) {
    return (
      <div className="shofy-profile-card text-center py-5 px-3">
        <div className="empty-state-illustration mb-3">
          <svg width="84" height="84" viewBox="0 0 84 84" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="42" cy="42" r="42" fill="#F4F6F8" />
            <path d="M26 34H58L54 54H30L26 34Z" stroke="#8A92A6" strokeWidth="2" strokeLinejoin="round" />
            <path d="M36 40V46M48 40V46" stroke="#8A92A6" strokeWidth="2" strokeLinecap="round" />
            <path d="M33 34L37 26H47L51 34" stroke="#8A92A6" strokeWidth="2" strokeLinejoin="round" />
          </svg>
        </div>
        <h4 className="fw-bold mb-2" style={{ color: "#010f1c", fontSize: "20px" }}>No orders yet!</h4>
        <p className="text-muted mb-4" style={{ fontSize: "14px" }}>You have not placed any orders yet.</p>
        <Link href="/shop" className="shofy-primary-btn d-inline-flex align-items-center gap-2">
          <span>+</span> Start shopping now
        </Link>
      </div>
    );
  }

  return (
    <div className="shofy-card p-3 table-responsive">
      <table className="table align-middle mb-0">
        <thead className="table-light">
          <tr>
            <th scope="col" style={{ fontSize: "14px" }}>Order ID</th>
            <th scope="col" style={{ fontSize: "14px" }}>Date</th>
            <th scope="col" style={{ fontSize: "14px" }}>Total</th>
            <th scope="col" style={{ fontSize: "14px" }}>Status</th>
            <th scope="col" style={{ fontSize: "14px" }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {orderItems.map((item, idx) => (
            <tr key={idx}>
              <th scope="row" className="fw-bold" style={{ fontSize: "14px", color: "#0989ff" }}>
                #{item._id.substring(item._id.length - 6).toUpperCase()}
              </th>
              <td style={{ fontSize: "14px", color: "#55585b" }}>
                {dayjs(item.createdAt).format("MMM D, YYYY")}
              </td>
              <td className="fw-semibold" style={{ fontSize: "14px", color: "#010f1c" }}>
                ${item.totalAmount || "0.00"}
              </td>
              <td>
                <span
                  className={`badge rounded-pill px-3 py-1 ${
                    item.status === "Delivered"
                      ? "bg-success-subtle text-success"
                      : item.status === "Processing"
                      ? "bg-warning-subtle text-warning"
                      : "bg-primary-subtle text-primary"
                  }`}
                  style={{ fontSize: "12px" }}
                >
                  {item.status || "Pending"}
                </span>
              </td>
              <td>
                <Link
                  href={`/order/${item._id}`}
                  className="btn btn-sm btn-outline-primary px-3"
                  style={{ borderRadius: "5px", fontSize: "13px" }}
                >
                  View Details
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MyOrders;