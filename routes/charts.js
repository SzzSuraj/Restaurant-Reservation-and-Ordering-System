// routes/charts.js
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

router.get('/data', async (req, res) => {
  try {
    // --- Sales Aggregation (Daily or Monthly) ---
    const salesFilter = req.query.salesFilter || 'daily';
    let sales = {};

    if (salesFilter === 'monthly') {
        // Aggregate orders by month using $month operator with timezone adjustment.
      const monthlyAggregation = await Order.aggregate([
        {
          $group: {
            _id: { 
                $month: { 
                  date: "$orderTime", 
                  timezone: "Australia/Adelaide" 
                } 
              },
              totalSales: { $sum: "$totalPrice" }
            }
          },
          { $sort: { "_id": 1 } }
        ]);
        // Map month numbers to names.
        const monthMapping = {
          1: "January", 2: "February", 3: "March", 4: "April",
          5: "May", 6: "June", 7: "July", 8: "August",
          9: "September", 10: "October", 11: "November", 12: "December"
        };
        let monthlySalesLabels = [];
        let monthlySalesData = [];
        for (let i = 1; i <= 12; i++) {
          monthlySalesLabels.push(monthMapping[i]);
          const found = monthlyAggregation.find(item => item._id === i);
          monthlySalesData.push(found ? found.totalSales : 0);
        }
        sales = { labels: monthlySalesLabels, data: monthlySalesData, stepSize: 1000 };
      } else {
        // Daily aggregation: group orders by day-of-week using Australia/Adelaide timezone.
      const dailyAggregation = await Order.aggregate([
        { 
            $project: { 
              dayOfWeek: { 
                $dayOfWeek: { 
                  date: "$orderTime", 
                  timezone: "Australia/Adelaide" 
                } 
              }, 
              totalPrice: 1 
            } 
          },
          { 
            $group: { 
              _id: "$dayOfWeek", 
              totalSales: { $sum: "$totalPrice" } 
            } 
          },
          { $sort: { "_id": 1 } }
        ]);
        // Desired order: Monday, Tuesday, …, Sunday.
        const dailySalesLabels = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
      const dailySalesMap = {};
      dailyAggregation.forEach(item => {
        dailySalesMap[item._id] = item.totalSales;
      });
      let dailySalesData = [];
      // MongoDB $dayOfWeek numbering: Monday=2, Tuesday=3, …, Saturday=7, Sunday=1.
      [2, 3, 4, 5, 6, 7, 1].forEach(dayNum => {
        dailySalesData.push(dailySalesMap[dayNum] || 0);
      });
      sales = { labels: dailySalesLabels, data: dailySalesData, stepSize: 100 };
    }

    // --- Best Selling Items (Pie Chart) ---
    const bestSellingAggregation = await Order.aggregate([
      { $unwind: "$items" },
      { 
        $group: { 
          _id: "$items.name", 
          totalQuantity: { $sum: "$items.quantity" } 
        } 
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 }
    ]);
    const bestSellingLabels = bestSellingAggregation.map(item => item._id);
    const bestSellingData = bestSellingAggregation.map(item => item.totalQuantity);
     // --- Customer Orders Count Aggregation (Bar Chart) by Day ---
     const ordersPerDayAggregation = await Order.aggregate([
        {
          $project: {
            dayOfWeek: { 
                $dayOfWeek: { 
                  date: "$orderTime", 
                  timezone: "Australia/Adelaide" 
                } 
              }
            }
          },
          {
            $group: {
                _id: "$dayOfWeek",
                orderCount: { $sum: 1 }
              }
            },
            { $sort: { _id: 1 } }
        ]);
        const dayOrder = [2, 3, 4, 5, 6, 7, 1];
        const dayMapping = {
          1: "Sunday",
          2: "Monday",
          3: "Tuesday",
          4: "Wednesday",
          5: "Thursday",
          6: "Friday",
          7: "Saturday"
        };
    const ordersPerDayLabels = dayOrder.map(dayNum => dayMapping[dayNum]);
    const ordersPerDayData = dayOrder.map(dayNum => {
    const found = ordersPerDayAggregation.find(item => item._id === dayNum);
      return found ? found.orderCount : 0;
    });
    // Return all chart data as JSON.
    res.json({
        bestSelling: { labels: bestSellingLabels, data: bestSellingData },
        sales, // Contains sales labels, data, and stepSize based on filter.
        customerOrders: { labels: ordersPerDayLabels, data: ordersPerDayData }
    });
  } catch (error) {
    console.error("Error fetching chart data:", error);
    res.status(500).json({ error: "Failed to fetch chart data" });
  }
});

module.exports = router;
