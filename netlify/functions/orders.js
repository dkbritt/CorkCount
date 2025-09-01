import {
  createOrder,
  getOrders,
  updateOrderStatus,
  deleteOrder,
  deleteOrderByNumber,
} from "../../server/routes/orders.ts";

export const handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    const path = event.path.replace('/.netlify/functions/orders', '');
    const method = event.httpMethod;
    const body = event.body ? JSON.parse(event.body) : {};

    // GET /orders
    if (method === 'GET' && (path === '' || path === '/')) {
      const result = await getOrders();

      if (result.success) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(result),
        };
      } else {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify(result),
        };
      }
    }

    // POST /orders (create new order)
    if (method === 'POST' && (path === '' || path === '/')) {
      if (!body.orderNumber || !body.customerName || !body.email) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            error: "Order number, customer name, and email are required",
          }),
        };
      }

      const result = await createOrder(body);

      if (result.success) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(result),
        };
      } else {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify(result),
        };
      }
    }

    // PUT /orders/:id/status
    if (method === 'PUT' && path.includes('/status')) {
      const id = path.split('/')[1]; // Extract ID from path like /abc123/status
      const { status, note } = body;

      if (!status) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            error: "Status is required",
          }),
        };
      }

      const result = await updateOrderStatus(id, status, note);

      if (result.success) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(result),
        };
      } else {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify(result),
        };
      }
    }

    // DELETE /orders/:id
    if (method === 'DELETE' && path.startsWith('/') && !path.includes('/by-number/')) {
      const id = path.substring(1); // Remove leading slash
      const result = await deleteOrder(id);

      if (result.success) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(result),
        };
      } else {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify(result),
        };
      }
    }

    // DELETE /orders/by-number/:orderNumber
    if (method === 'DELETE' && path.startsWith('/by-number/')) {
      const orderNumber = decodeURIComponent(path.substring('/by-number/'.length));
      const result = await deleteOrderByNumber(orderNumber);

      if (result.success) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(result),
        };
      } else {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify(result),
        };
      }
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: 'Orders endpoint not found' 
      }),
    };
  } catch (error) {
    console.error('Orders error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: 'Internal server error' 
      }),
    };
  }
};
