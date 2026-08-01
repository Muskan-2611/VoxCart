const orders = [
  { id: "1", userId: "guest" },
  { id: "2", userId: "usr_admin" },
  { id: "3", userId: "user2" }
];
const userId = "guest";
const user = undefined;
const userOrders = orders.filter(o => 
  o.userId === userId || 
  (user && user.email && o.userEmail && String(o.userEmail).toLowerCase() === String(user.email).toLowerCase()) ||
  (!o.userId || o.userId === "guest" || o.userId.startsWith("guest") || !userId || userId === "null" || userId === "undefined" || userId.startsWith("guest"))
);
console.log(userOrders);
